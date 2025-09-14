const ShareDB = require('sharedb/lib/client'); // Use the client-side library
const WebSocket = require('ws');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');

// --- Configuration ---
const SERVER_URL = 'ws://localhost:3000'; // Your server's WebSocket URL
const COLLECTION_NAME = 'documents';
const DOCUMENT_ID = 'test-sharedb-doc-123'; // Use a unique ID for testing

// --- 1. Establish a raw WebSocket connection ---
const ws = new WebSocket(SERVER_URL);

ws.onopen = () => {
  console.log('✅ WebSocket connection opened.');

  // --- 2. Send a raw WebSocket message directly ---
  ws.send(JSON.stringify({ type: 'raw_test', payload: 'Hello raw from client!' }));

  // --- 7. Close connection after a longer delay ---
  setTimeout(() => {
    console.log('Closing raw WebSocket connection.');
    ws.close(); // Rely only on raw WebSocket close
  }, 8000); // Close after 8 seconds (increased delay)
};

ws.onclose = () => {
  console.log('❌ WebSocket connection closed.');
};

ws.onerror = (error) => {
  console.error('🚨 WebSocket error:', error.message);
};
