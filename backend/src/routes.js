import express from "express";
import { createUserController, loginUserController, logoutUserController, tokenStatusUserController } from "./controllers/user.js";
import { authenticateUser } from "./auth/auth.js";

const router = express.Router();

export const initRoutes = async (mongodb) => {
    // API endpoint for user handling
    router.post("/user/register", createUserController(mongodb));
    router.post("/user/login", loginUserController(mongodb)); 
    router.get("/user/token_status", tokenStatusUserController(mongodb))
    router.post("/user/logout", await authenticateUser, logoutUserController(mongodb));

    return router;
};