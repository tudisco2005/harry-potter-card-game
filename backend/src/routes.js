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
    sellUserCardsController
} from "./controllers/user.js";
import { authenticateUser } from "./auth/auth.js";

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

    return router;
};