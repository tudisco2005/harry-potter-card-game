import express from "express";
import cors from "cors";
import { initRoutes } from "./routes.js";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./utils/swagger.js";

const app = express();

// Configurazione middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

export const initApp = async () => {
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
    app.use("/api", await initRoutes());
    return app;
};

export default app;