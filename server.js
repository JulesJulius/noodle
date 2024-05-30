// server.js
const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the WebSocket server
require('./ws-server');

const port = 3000;
server.listen(port, () => {
    console.log(`Express server is running on http://localhost:${port}`);
});
