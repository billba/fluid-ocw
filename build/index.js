"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
