/**
 * Configurazione dell'applicazione Express
 * Questo file gestisce la configurazione base dell'applicazione e dei middleware
 */

import express from "express";
import cors from "cors";
import { initRoutes } from "./routes.js";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./utils/swagger.js";

// Creazione dell'applicazione Express
const app = express();

// Configurazione dei middleware essenziali
app.use(express.json());  // Per il parsing del body in formato JSON
app.use(express.urlencoded({ extended: false }));  // Per il parsing dei dati form
app.use(cors());  // Per gestire le richieste cross-origin

export const initApp = async () => {
    // Configurazione della documentazione API con Swagger
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
    // Configurazione delle route dell'API
    app.use("/api", await initRoutes());
    return app;
};

export default app;