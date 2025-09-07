// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const http = require('http');
const { Server } = require("socket.io");
const documentRoutes = require('./routes/document');
const Document = require('./models/Document'); // Import the Document model

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // For parsing application/json

app.use("/api/documents", documentRoutes); // All routes defined in documentRoutes will be prefixed with /api/documents

// Root route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Collaborative Text Editor API is running!',
    endpoints: {
      'POST /api/documents': 'Create a new document',
      'GET /api/documents/:id': 'Get document by ID',
      'PUT /api/documents/:id': 'Update document',
      'DELETE /api/documents/:id': 'Delete document'
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected to Cluster0...'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Fallback for development
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  socket.on("join_document", (documentId) => {
    socket.join(documentId);
    console.log(`User ${socket.id} joined document ${documentId}`);
  });

  socket.on("send_changes", async ({ documentId, changes }) => {
    try {
      await Document.findByIdAndUpdate(documentId, { content: changes });
      socket.to(documentId).emit("receive_changes", changes);
    } catch (error) {
      console.error("Error updating document:", error);
      socket.emit("update_error", { message: "Failed to save changes." });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(PORT, () => console.log(`🚀 Server (HTTP + WebSocket) running on port ${PORT}`));