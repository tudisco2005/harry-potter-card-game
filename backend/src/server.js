import http from "http";
import dotenv from "dotenv";
import { initApp } from "./app.js";
import connectDB from "./database.js";

dotenv.config();

const mongodb = await connectDB(
    process.env.PROTOCOL,
    process.env.MONGO_HOST, 
    process.env.MONGO_USERNAME, 
    process.env.MONGO_PASSWORD, 
    process.env.MONGO_DATABASE_NAME, 
    String(process.env.MONGO_DATABASE_COLLECTIONS).split(","),
    process.env.MONGO_CONNECTION_OPTIONS
); // Connect to MongoDB using the provided environment variables

const app = await initApp(mongodb); // Initialize the Express app with the MongoDB connection
const server = http.createServer(app); // Create an HTTP server using the Express app
const PORT = process.env.SERVER_PORT || 3000;

// Start the server and listen on the specified port
server.listen(PORT, () => {
    console.log(`[+] Server avviato e in esecuzione sulla porta: ${PORT}`);
});

