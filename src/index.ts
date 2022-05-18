import * as dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import {SharedMap, SharedString} from 'fluid-framework';
import {AzureClient} from '@fluidframework/azure-client';
import {InsecureTokenProvider} from '@fluidframework/test-client-utils';
import {newShuffledDeck} from './game';

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
  pile: SharedString;
  gameState: SharedMap;
}

const containerSchema = {
  initialObjects: {
    pile: SharedString,
    gameState: SharedMap,
  },
};

const createNewGame = async () => {
  const {container} = await client.createContainer(containerSchema);
  const initialObjects = container.initialObjects as unknown as InitialObjects;
  const containerId = await container.attach();
  console.log('Starting game ' + containerId);

  initialObjects.pile.insertText(0, newShuffledDeck(0));

  play(initialObjects);
  return containerId;
};

const joinExistingGame = async (containerId: string) => {
  console.log('Joining game ' + containerId);
  const {container} = await client.getContainer(containerId, containerSchema);
  const initialObjects = container.initialObjects as unknown as InitialObjects;
  play(initialObjects);
};

const play = ({gameState, pile}: InitialObjects) => {
  console.log(pile.getText());
  for (const [key, value] of gameState.entries()) {
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
      gameState.set(id, key);
    }
  });

  gameState.on('valueChanged', ivc => {
    console.clear();
    console.log(pile.getText());
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
