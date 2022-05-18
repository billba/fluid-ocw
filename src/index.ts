import * as dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import {
  SharedMap,
  SharedString,
  ContainerSchema,
  IFluidContainer,
} from 'fluid-framework';
import {SharedObjectSequence} from '@fluidframework/sequence';
import {AzureClient} from '@fluidframework/azure-client';
import {InsecureTokenProvider} from '@fluidframework/test-client-utils';

interface Card {
  suit: number;
  rank: number;
  player: string;
}

const playerId = process.env.FR_USER_ID || os.userInfo().username;

const serviceConfig = {
  connection: {
    tenantId: process.env.FR_TENANT!,
    tokenProvider: new InsecureTokenProvider(process.env.FR_PRIMARY_KEY!, {
      id: playerId,
    }),
    orderer: process.env.FR_ORDERER!,
    storage: process.env.FR_STORAGE!,
  },
};

const client = new AzureClient(serviceConfig);

/*

interface InitialObjects {
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

*/

interface InitialObjects {
  acePiles: SharedObjectSequence<SharedObjectSequence<Card>>;
  players: SharedMap;
}

const containerSchema: ContainerSchema = {
  initialObjects: {
    acePiles: SharedObjectSequence,
    players: SharedMap,
  },
  dynamicObjectTypes: [SharedString, SharedObjectSequence],
};

const createNewGame = async (playerId: string) => {
  const {container} = await client.createContainer(containerSchema);
  const initialObjects = container.initialObjects as unknown as InitialObjects;
  const containerId = await container.attach();
  console.log('Starting game ' + containerId);
  initializePlayer(playerId, container);
  await play(initialObjects);
  return containerId;
};

const joinExistingGame = async (playerId: string, containerId: string) => {
  console.log('Joining game ' + containerId);
  const {container} = await client.getContainer(containerId, containerSchema);
  const initialObjects = container.initialObjects as unknown as InitialObjects;
  initializePlayer(playerId, container);
  await play(initialObjects);
};

const initializePlayer = async (
  playerId: string,
  container: IFluidContainer
) => {
  const playerMap = await container.create(SharedMap);
  playerMap.set('playerId', playerId);

  const initialObjects = container.initialObjects as unknown as InitialObjects;
  initialObjects.players.set(playerId, playerMap.handle);

  // TODO: set all the piles
};

const play = async ({acePiles, players}: InitialObjects) => {
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
      console.log(key);
    }
  });
};

const start = async () => {
  const containerId = process.argv[2];
  if (containerId) {
    await joinExistingGame(playerId, containerId);
  } else {
    await createNewGame(playerId);
  }
};

start();
