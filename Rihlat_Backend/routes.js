import express from "express";
const router = express.Router(); // Creating router
import {startConversation, continueConversation} from "./ai.js"; // Handler AI functions

// Attaching the routes
router.post("/start", startConversation); // New color
router.post("/answer", continueConversation); // Continue with current color

export default router; // Exporting the router