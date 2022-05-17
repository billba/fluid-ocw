import * as dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import { SharedMap } from "fluid-framework";
import {AzureClient} from '@fluidframework/azure-client';
import {InsecureTokenProvider} from '@fluidframework/test-client-utils';

const id = process.env.FR_USER_ID || os.userInfo().username;

const serviceConfig = {
  connection: {
    tenantId: process.env.FR_TENANT!,
    tokenProvider: new InsecureTokenProvider(
      process.env.FR_PRIMARY_KEY!,
      {id}
    ),
    orderer: process.env.FR_ORDERER!,
    storage: process.env.FR_STORAGE!,
  },
};

const client = new AzureClient(serviceConfig);

enum GameStateKeys {
  lastChar = "lastChar",
}

const containerSchema = {
    initialObjects: { gameState: SharedMap }
};

const createNewGame = async () => {
    const { container } = await client.createContainer(containerSchema);
    const gameState = container.initialObjects.gameState as SharedMap; 
    gameState.set(GameStateKeys.lastChar, "none");
    const id = await container.attach();
    console.log("Starting game " + id);
    play(gameState);
    return id;
}

const joinExistingGame = async (id: string) => {
    console.log("Joining game " + id);
    const { container } = await client.getContainer(id, containerSchema);
    play(container.initialObjects.gameState as SharedMap);
}

const play = (gameState: SharedMap) => {
    console.log('initial value', gameState.get(GameStateKeys.lastChar));

    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
  
    stdin.on('data', buffer => {
      const key = String(buffer);

      // ctrl-c exits game
      if (key === '\u0003') {
        console.log('EXIT');
        process.exit();
      } else {
        gameState.set(GameStateKeys.lastChar, `${id} pressed '${key}'`);
      }
    });

    gameState.on('valueChanged', () => {
      console.log(gameState.get(GameStateKeys.lastChar));
    });
}

const start = async () => {
    const id = process.argv[2];
    if (id) {
        await joinExistingGame(id);
    } else {
        await createNewGame();
    }
}

start();
