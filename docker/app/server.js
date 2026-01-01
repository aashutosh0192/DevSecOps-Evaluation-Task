const express = require('express');
const app = express();

// Health check endpoint for probes
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Hello World endpoint
app.get('/', (req, res) => {
  res.send('Hello World from Node.js + Express!');
});

// Use PORT env variable (default 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});