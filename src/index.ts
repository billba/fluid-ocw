import * as dotenv from 'dotenv';
dotenv.config();

// import { SharedMap } from "fluid-framework";

import {AzureClient} from '@fluidframework/azure-client';
import {InsecureTokenProvider} from '@fluidframework/test-client-utils';

const serviceConfig = {
  connection: {
    tenantId: process.env.FR_TENANT || "", // REPLACE WITH YOUR TENANT ID
    tokenProvider: new InsecureTokenProvider(
        process.env.FR_PRIMARY_KEY || "", // workaround for type string
      {id: 'userId'}
    ),
    orderer: process.env.FR_ORDERER || "", // REPLACE WITH YOUR ORDERER ENDPOINT
    storage: process.env.FR_STORAGE || "", // REPLACE WITH YOUR STORAGE ENDPOINT
  },
};

const client = new AzureClient(serviceConfig);


// const diceValueKey = "dice-value-key";
// const client = new TinyliciousClient();
// const containerSchema = {
//     initialObjects: { gameState: SharedMap }
// };
// const createNewGame = async () => {
//     const { container } = await client.createContainer(containerSchema);
//     (container.initialObjects.gameState as any).set(diceValueKey, 1);
//     const id = await container.attach();
//     console.log("Starting game " + id);
//     renderGame(container.initialObjects.gameState);
//     return id;
// }
// const joinExistingGame = async (id: string) => {
//     console.log("Joining game " + id);
//     const { container } = await client.getContainer(id, containerSchema);
//     renderGame(container.initialObjects.gameState);
// }
// const renderGame = (gameState: any) => {
//     console.log("render game");
// }
// const start = () => {
//     const id = process.argv[2];
//     if (id) {
//         joinExistingGame(id);
//     } else {
//         createNewGame();
//     }
// }
// start();