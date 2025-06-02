import express from "express";
import { createUserController } from "./controllers/user.js";

const router = express.Router();

export const initRoutes = (mongodb) => {
    // API endpoint for user handling
    router.post("/user/register", createUserController(mongodb));
    return router;
};