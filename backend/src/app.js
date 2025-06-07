import express from "express";
import cors from "cors";
import { initRoutes } from "./routes.js";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./utils/swagger.js";

const app = express();

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

export const initApp = async (mongodb) => {
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
    app.use("/api", await initRoutes(mongodb));
    return app;
};

export default app;