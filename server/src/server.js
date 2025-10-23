// server.js - Consolidated and Cleaned

// Load environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Node.js built-in HTTP module

// --- Define the valid, default empty state for a new Slate document ---
const defaultSlateValue = [{ type: 'paragraph', children: [{ text: '' }] }];

// ShareDB and WebSocket dependencies
const WebSocket = require('ws'); // Raw WebSocket server
const WebSocketJSONStream = require('@teamwork/websocket-json-stream'); // For bridging WebSocket to ShareDB stream
const { share } = require('./sharedb-instance'); // Import the single, shared ShareDB instance

// Express App Setup
const app = express();
const server = http.createServer(app); // Create HTTP server from Express app

// CORS Configuration (for both Express and WebSocket)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5174", // Allow your frontend to connect
  methods: ["GET", "POST", "PUT", "DELETE"] // Allow all necessary methods
}));

// Middleware
app.use(express.json()); // For parsing application/json request bodies

// Import Routes and Models (needed for REST API)
const documentRoutes = require('./routes/document');
const Document = require("./models/Document"); // Needed for the /api/documents/:id/content endpoint

// REST API Routes
app.use("/api/documents", documentRoutes); // All document-related routes

// Root route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Collaborative Text Editor API is running!',
    endpoints: {
      'POST /api/documents': 'Create a new document',
      'GET /api/documents/:id': 'Get document by ID',
      'PUT /api/documents/:id': 'Update document',
      'DELETE /api/documents/:id': 'Delete document',
      'GET /api/documents/:id/content': 'Get ShareDB document content'
    }
  });
});

// --- ShareDB WebSocket Connection ---
// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections for ShareDB
wss.on('connection', (ws) => {
  // 1. Log the initial connection for debugging.
  console.log('Client connected.');

  // 2. Create the stream wrapper.
  const stream = new WebSocketJSONStream(ws);

  // 3. Immediately hand the stream over to ShareDB.
  //    DO NOT add any other `ws.on('message', ...)` listeners.
  //    ShareDB now owns this connection's message flow.
  share.listen(stream);
  
  stream.on('error', (err) => {
    // It's still good practice to log errors on the stream itself.
    console.error('Stream Error:', err);
  });
  
  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

// --- New/Modified REST endpoint for getting initial document content for ShareDB ---
// This endpoint is crucial for the client to initialize a ShareDB document
// --- UPGRADED REST endpoint for getting/creating initial document content ---
app.get("/api/documents/:id/content", async (req, res) => {
  try {
    const docId = req.params.id;
    const shareDoc = share.connect().get("documents", docId);

    shareDoc.fetch(function(err) {
      if (err) {
        console.error("ShareDB fetch error:", err);
        return res.status(500).json({ message: "Error fetching ShareDB document." });
      }

      // 1. If the document doesn't exist in ShareDB, create it correctly.
      if (shareDoc.type === null) {
        shareDoc.create({ content: defaultSlateValue }, 'slate-ot', (err) => {
          if (err) {
            console.error("ShareDB create error:", err);
            return res.status(500).json({ message: "Error creating ShareDB document." });
          }
          console.log(`Created new ShareDB document: ${docId}`);
          res.json({ content: shareDoc.data.content, version: shareDoc.version });
        });
        return; // Stop execution here
      }

      // 2. If the document *does* exist, validate its content.
      const content = shareDoc.data.content;
      const isContentInvalid = !content || !Array.isArray(content) || content.length === 0;

      if (isContentInvalid) {
        // 3. The content is invalid! Fix it with a ShareDB operation.
        console.warn(`Document ${docId} has invalid content. Healing...`);
        const op = [{ p: ['content'], od: content, oi: defaultSlateValue }];
        
        shareDoc.submitOp(op, { source: 'server-heal' }, (err) => {
          if (err) {
            console.error("ShareDB healing op error:", err);
            return res.status(500).json({ message: "Error healing document." });
          }
          console.log(`Healed document ${docId} with default content.`);
          // Now that it's fixed, send the corrected data.
          res.json({ content: shareDoc.data.content, version: shareDoc.version });
        });
      } else {
        // 4. The content is valid. Send it as is.
        res.json({ content: shareDoc.data.content, version: shareDoc.version });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching document content." });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected to Cluster0...'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

