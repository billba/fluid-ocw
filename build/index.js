"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const fluid_framework_1 = require("fluid-framework");
const azure_client_1 = require("@fluidframework/azure-client");
const test_client_utils_1 = require("@fluidframework/test-client-utils");
const serviceConfig = {
    connection: {
        tenantId: process.env.FR_TENANT,
        tokenProvider: new test_client_utils_1.InsecureTokenProvider(process.env.FR_PRIMARY_KEY, { id: process.env.FR_USER_ID }),
        orderer: process.env.FR_ORDERER,
        storage: process.env.FR_STORAGE,
    },
};
const client = new azure_client_1.AzureClient(serviceConfig);
const diceValueKey = "dice-value-key";
const containerSchema = {
    initialObjects: { gameState: fluid_framework_1.SharedMap }
};
const createNewGame = () => __awaiter(void 0, void 0, void 0, function* () {
    const { container } = yield client.createContainer(containerSchema);
    container.initialObjects.gameState.set(diceValueKey, 1);
    const id = yield container.attach();
    console.log("Starting game " + id);
    renderGame(container.initialObjects.gameState);
    return id;
});
const joinExistingGame = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Joining game " + id);
    const { container } = yield client.getContainer(id, containerSchema);
    renderGame(container.initialObjects.gameState);
});
const renderGame = (gameState) => {
    console.log("render game");
};
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    const id = process.argv[2];
    if (id) {
        yield joinExistingGame(id);
    }
    else {
        yield createNewGame();
    }
});
start();
