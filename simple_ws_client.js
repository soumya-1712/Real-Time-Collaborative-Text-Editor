const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Simple WS Client: Connected');
  ws.send('Hello from client!');
};

ws.onmessage = event => {
  console.log(`Simple WS Client: Received: ${event.data}`);
  ws.close();
};

ws.onclose = () => {
  console.log('Simple WS Client: Disconnected');
};

ws.onerror = error => {
  console.error('Simple WS Client: WebSocket error:', error);
};
