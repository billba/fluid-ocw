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

import {Card, newShuffledDeck, pileToString} from './game';

// interface Card {
//   suit: number;
//   rank: number;
//   player: string;
// }

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
      playerId: SharedString,
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
  playerId = 'mhop';
  // Create the game session
  const {container} = await client.createContainer(containerSchema);
  const containerId = await container.attach();
  console.log('Starting game ' + containerId);

  // Add our player
  await addPlayer(playerId, container);

  // Start playing
  await play(container);
};

const joinExistingGame = async (playerId: string, containerId: string) => {
  console.log('Joining game ' + containerId);
  const {container} = await client.getContainer(containerId, containerSchema);

  // Add our player
  await addPlayer(playerId, container);

  // Start playing
  await play(container);
};

enum PlayerFields {
  draw = 'draw',
  id = 'playerId',
  nerds = 'nerds',
}

const addPlayer = async (playerId: string, container: IFluidContainer) => {
  const playerObject = await container.create(SharedMap);
  playerObject.set(PlayerFields.id, playerId);
  playerObject.set(PlayerFields.draw, newShuffledDeck(playerId));

  const initialObjects = container.initialObjects as unknown as InitialObjects;
  initialObjects.players.set(playerId, playerObject.handle);

  // TODO: set all the piles
};

async function printWorld(container: IFluidContainer) {
  // Print players
  const initialObjects = container.initialObjects as unknown as InitialObjects;
  for (const [playerId, anyObject] of initialObjects.players.entries()) {
    const playerObject = (await anyObject.get()) as SharedMap;
    const deck1 = playerObject.get(PlayerFields.draw);
    // const deck2 = (await deck1.get()) as SharedObjectSequence<Card>;
    // const deck3 = deck2.getItems(0);

    console.log(playerId);
    console.log('  ' + pileToString(deck1));
  }
}

const play = async (container: IFluidContainer) => {
  // const initialObjects = container.initialObjects as unknown as InitialObjects;
  // const {acePiles, players} = initialObjects;

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

  printWorld(container);
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
