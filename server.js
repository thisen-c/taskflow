const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// A simple test route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to TaskFlow API! Server is running successfully." });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});