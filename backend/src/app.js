import express from "express";
import cors from "cors";

const app = express();              // Create an Express application

// Middleware configuration
app.use(express.json());            // Parse incoming JSON requests
app.use(express.urlencoded({ extended: false }));  // Parse URL-encoded data
app.use(cors());                    // Enable CORS for cross-origin requests

export default app;                // Export the configured app