# Feature: Debugging Process

## Summary

This feature branch focuses on setting up a WebSocket server to facilitate debugging by routing all traffic to the server's console log. The server prefixes incoming messages with the client's IP address and formats the log messages in dark green.

## Key Changes

1. **Feature Branch Creation:**
   - Created a new branch `feature/debugging-process`.

2. **WebSocket Server Setup:**
   - Installed the `ws` library for WebSocket support.
   - Configured a WebSocket server to handle incoming connections and messages.
   - Prefixed incoming messages with the client's IP address and formatted them in dark green using the `chalk` library.
   - Added logging to track client connections and disconnections.

3. **Server Integration:**
   - Updated the main server file to include and run the WebSocket server alongside the Express server.

4. **Client-Side WebSocket Connection:**
   - Set up the WebSocket client in the application to connect to the WebSocket server using the hostname of the server that served the content.
   - Ensured the WebSocket client sends a test message upon establishing a connection.

5. **Troubleshooting:**
   - Added detailed logging to the WebSocket server for better troubleshooting.
   - Ensured the client-side WebSocket connection and message sending are correctly implemented.
   - Tested the WebSocket connection, verifying that messages are received and logged correctly.

## Testing and Validation

- Verified the WebSocket server is running and listening for connections.
- Confirmed the client successfully connects to the WebSocket server.
- Ensured that messages sent from the client are received and logged by the server, with the correct IP address prefix and formatting.
