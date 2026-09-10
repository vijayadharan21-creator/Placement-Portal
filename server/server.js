const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require("path");

const { DBConnect, DBDisconnect } = require('./config/db');
const apiRouter = require('./routers/api');

const app = express();
const PORT = process.env.PORT || 5000;

let server;

// Middleware
app.use(cors({
    origin: '*', // Allow all client links for development
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Serve static frontend files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Catch-all route to serve the React app for any unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const StartServer = async () => {
    try {
        await DBConnect(); // Establish MongoDB connection
        server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (e) {
        console.error("Failed to start server:", e);
    }
};

StartServer();

// Graceful Shutdown
const shutdown = async () => {
    console.log("Shutting down server...");
    if (server) {
        server.close(async () => {
            await DBDisconnect();
            process.exit(0);
        });
    } else {
        await DBDisconnect();
        process.exit(0);
    }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await shutdown();
});

process.on("unhandledRejection", async (err) => {
    console.error("Unhandled Rejection:", err);
    await shutdown();
});
