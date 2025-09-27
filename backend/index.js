// Import necessary libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

// INITIALIZATION
// Create an Express application
const app = express();
const PORT = process.env.PORT || 8080;


if (!process.env.GEMINI_API_KEY) {
    console.error('Missing GEMINI_API_KEY'); process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// MIDDLEWARE
// Tells the app to use libraries we installed
// Enable communication from the frontend
app.use(cors());
// Allow the server to understand JSON data from request
app.use(express.json());

// ROUTES
// Add NEW ROUTE to handle chat messages
app.post('/chat', async (req, res) => {
    try {
        // expecting the user's message to be in the 'body' of the request
        const userMessage = req.body.message ?? '';
        // For now, logit it to the backend terminal to see it arrive
        console.log(`Received message from frontend: ${userMessage}`);

        // Send the message to the Gemini model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // or 'gemini-2.5-pro'
            contents: userMessage,
        });

        // const botResponse = response.text();
        // Sent the model's response back to the frontend
        res.json({ message: response.text });

    } catch (error) {
        console.error("Error with Google AI: ", error);
        res.status(500).json({
            message: "Error communicating with the AI model."
        });
    }
});

// START THE SERVER
// tells the server to start listening for incomming request
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});