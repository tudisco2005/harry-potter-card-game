import express from "express";
import { 
    createUserController, 
    loginUserController, 
    logoutUserController, 
    tokenStatusUserController,
    getUserInfoController,
    updateUserInfoController,
    deleteUserController,
    searchUserCardsController,
    sellUserCardsController,
    openPackageCardsUserController,
    buyCreditUserController,
    getUserMissingCardsController,
    getUserDoubleCardsController,
    getUserAllTrades
} from "./controllers/user.js";

import {
    createTradeController,
    getAllTradesController,
    acceptTradeController,
    deleteTradeController
} from "./controllers/trade.js";

import { authenticateUser } from "./auth/auth.js";
import { checkExpiredTrades } from './utils/checkExpiredTrades.js';


const router = express.Router();

export const initRoutes = async (mongodb) => {
    // API endpoint for user handling
    router.post("/user/register", createUserController(mongodb));
    router.post("/user/login", loginUserController(mongodb)); 
    router.get("/user/validate", await authenticateUser, tokenStatusUserController(mongodb))
    router.post("/user/logout", await authenticateUser, logoutUserController(mongodb));
    router.get("/user/allinfo", await authenticateUser, getUserInfoController(mongodb));
    router.put("/user/update", await authenticateUser, updateUserInfoController(mongodb));
    router.delete("/user/delete", await authenticateUser, deleteUserController(mongodb));
    router.get("/user/searchcards", await authenticateUser, searchUserCardsController(mongodb));
    router.post("/user/sellcards", await authenticateUser, sellUserCardsController(mongodb));
    router.post("/user/openpackage", await authenticateUser, openPackageCardsUserController(mongodb));
    router.post("/user/credits/purchase", await authenticateUser, buyCreditUserController(mongodb))
    router.get("/user/missingcards", await authenticateUser, getUserMissingCardsController(mongodb));
    router.get("/user/doublecards", await authenticateUser, getUserDoubleCardsController(mongodb));
    router.get("/user/trades", await authenticateUser, getUserAllTrades(mongodb))

    // API endpoint for trade handling
    router.use(checkExpiredTrades); // Middleware to check and expire trades
    // This middleware will run before any trade-related routes
    router.post("/trade/create", await authenticateUser, createTradeController(mongodb));
    router.get("/trade/all", await authenticateUser, getAllTradesController(mongodb));
    router.post("/trade/accept", await authenticateUser, acceptTradeController(mongodb));
    router.delete("/trade/delete", await authenticateUser, deleteTradeController(mongodb));
    return router;
};