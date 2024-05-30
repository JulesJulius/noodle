// ws-server.js
const WebSocket = require('ws');
const http = require('http');
const chalk = require('chalk');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
    console.log('new ws client connection')
    const ip = req.socket.remoteAddress;
    ws.on('message', function incoming(message) {
        console.log(chalk.hex('#006400')(`[${ip}]: ${message}`));
    });
});

const port = 8080;
server.listen(port, () => {
    console.log(`WebSocket server is running on ws://localhost:${port}`);
});