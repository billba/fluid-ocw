import * as dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import {SharedMap, SharedString} from 'fluid-framework';
import {AzureClient} from '@fluidframework/azure-client';
import {InsecureTokenProvider} from '@fluidframework/test-client-utils';

const id = process.env.FR_USER_ID || os.userInfo().username;

const serviceConfig = {
  connection: {
    tenantId: process.env.FR_TENANT!,
    tokenProvider: new InsecureTokenProvider(process.env.FR_PRIMARY_KEY!, {id}),
    orderer: process.env.FR_ORDERER!,
    storage: process.env.FR_STORAGE!,
  },
};

const client = new AzureClient(serviceConfig);

interface InitialObjects {
  gameState: SharedMap;
  someText: SharedString;
}

const containerSchema = {
  initialObjects: {
    gameState: SharedMap,
    someText: SharedString,
  },
};

const createNewGame = async () => {
  const {container} = await client.createContainer(containerSchema);
  const {gameState, someText} =
    container.initialObjects as unknown as InitialObjects;
  const containerId = await container.attach();
  console.log('Starting game ' + containerId);
  play(gameState, someText);
  return containerId;
};

const joinExistingGame = async (containerId: string) => {
  console.log('Joining game ' + containerId);
  const {container} = await client.getContainer(containerId, containerSchema);
  play(
    container.initialObjects.gameState as SharedMap,
    container.initialObjects.sharedText as SharedString
  );
};

const play = (gameState: SharedMap, someText: SharedString) => {
  for (const [key, value] of gameState) {
    console.log(key, value);
  }

  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  stdin.on('data', buffer => {
    const key = String(buffer);

    // ctrl-c exits game
    if (key === '\u0003') {
      console.log('EXIT');
      // eslint-disable-next-line no-process-exit
      process.exit();
    } else {
      someText.insertText(0, key);
      gameState.set(id, key);
    }
  });

  gameState.on('valueChanged', ivc => {
    console.clear();
    console.log(someText.getText());
    for (const [key, value] of gameState.entries()) {
      console.log((ivc.key === key ? '*' : '') + key, value);
    }
  });
};

const start = async () => {
  const containerId = process.argv[2];
  if (containerId) {
    await joinExistingGame(containerId);
  } else {
    await createNewGame();
  }
};

start();
