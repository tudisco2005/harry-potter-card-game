import express from "express";
import cors from "cors";
import { initRoutes } from "./routes.js";

const app = express();

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

export const initApp = (mongodb) => {
    app.use("/api", initRoutes(mongodb));
    return app;
};

export default app;