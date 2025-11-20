import "dotenv/config"; // To load secret environment variables
import express from "express"; // Framework to use API endpoints
import cors from "cors"; // Allowing frontend to access backend

import routes from "./routes.js"; // Import API endpoints

const app = express(); // Create an Express application
app.use(cors()); // Enable CORS
app.use(express.json()); // Enable JSON parsing
app.use("/api", routes); // Register API routes

// Start the server (port 5000 or from environment variable)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});