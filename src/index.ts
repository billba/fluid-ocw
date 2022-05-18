import * as dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import {SharedMap, SharedString, SharedSequence, ContainerSchema} from 'fluid-framework';
import {AzureClient} from '@fluidframework/azure-client';
import {InsecureTokenProvider} from '@fluidframework/test-client-utils';
// import {Card, newShuffledDeck} from './game';

interface Card {
  suit: number;
  rank: number;
  player: string;
}

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

/*

interface InitialObjects {
  gameState: SharedMap {
    acePiles: SharedSequence<SharedSequence<Card>>,
    players: SharedMap {
      [playerName]: SharedMap {
        workPiles: SharedSequence<SharedSequence<Card>>
        draw: SharedSequence<Card>,
        drawDiscard: SharedSequence<Card>,
        nerds: SharedSequence<Card>,
        nerdsDiscard: SharedSequence<Card>,
      }
    }
  }

}

*/

interface InitialObjects {
  gameState: SharedMap;
}

const containerSchema: ContainerSchema = {
  initialObjects: {
    gameState: SharedMap,
  },
  dynamicObjectTypes: [SharedString],
};

const createNewGame = async () => {
  const {container} = await client.createContainer(containerSchema);
  const initialObjects = container.initialObjects as unknown as InitialObjects;
  const containerId = await container.attach();
  console.log('Starting game ' + containerId);

  const text = await container.create(SharedString);
  text.insertText(0, 'starting text');
  initialObjects.gameState.set("text", text.handle);

  await play(initialObjects);
  return containerId;
};

const joinExistingGame = async (containerId: string) => {
  console.log('Joining game ' + containerId);
  const {container} = await client.getContainer(containerId, containerSchema);
  const initialObjects = container.initialObjects as unknown as InitialObjects;
  await play(initialObjects);
};

const play = async ({gameState}: InitialObjects) => {
  const handle = gameState.get("text");
  const sharedString:SharedString = await handle.get();
  const text = sharedString.getText();
  console.log(text);

  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  stdin.on('data', async buffer => {
    const key = String(buffer);

    // ctrl-c exits game
    if (key === '\u0003') {
      console.log('EXIT');
      // eslint-disable-next-line no-process-exit
      process.exit();
    } else {
      console.log("I got this far");
      const handle = gameState.get("text");
      const sharedString:SharedString = await handle.get();
      sharedString.replaceText(0, sharedString.getLength(), id);
      console.log(sharedString.getText());
    }
  });

  sharedString.on('sequenceDelta', () => {
    console.log("string changed");
  });

  gameState.on('valueChanged', (ivc) => {
    console.log("map changed");

    if (ivc.key === "text") {
      console.log("text changed");
    }
    // console.clear();

    // const handle = gameState.get("text");
    // const sharedString:SharedString = await handle.get();
    // const text = sharedString.getText();

    // console.log(text);
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


