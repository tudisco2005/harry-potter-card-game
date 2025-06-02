import express from "express";
import cors from "cors";
import { initRoutes } from "./routes.js";
import cookies from "cookie-parser";

const app = express();

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookies());

export const initApp = async (mongodb) => {
    app.use("/api", await initRoutes(mongodb));
    return app;
};

export default app;