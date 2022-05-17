import * as dotenv from 'dotenv';
dotenv.config();
import os from 'os';
import { SharedMap } from "fluid-framework";
import {AzureClient} from '@fluidframework/azure-client';
import {InsecureTokenProvider} from '@fluidframework/test-client-utils';

const serviceConfig = {
  connection: {
    tenantId: process.env.FR_TENANT!,
    tokenProvider: new InsecureTokenProvider(
        process.env.FR_PRIMARY_KEY!,
      {id: process.env.FR_USER_ID || os.userInfo().username}
    ),
    orderer: process.env.FR_ORDERER!,
    storage: process.env.FR_STORAGE!,
  },
};

const client = new AzureClient(serviceConfig);

const diceValueKey = "dice-value-key";
const containerSchema = {
    initialObjects: { gameState: SharedMap }
};
const createNewGame = async () => {
    const { container } = await client.createContainer(containerSchema);
    (container.initialObjects.gameState as any).set(diceValueKey, 1);
    const id = await container.attach();
    console.log("Starting game " + id);
    renderGame(container.initialObjects.gameState);
    return id;
}
const joinExistingGame = async (id: string) => {
    console.log("Joining game " + id);
    const { container } = await client.getContainer(id, containerSchema);
    renderGame(container.initialObjects.gameState);
}
const renderGame = (gameState: any) => {
    console.log("render game");
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
