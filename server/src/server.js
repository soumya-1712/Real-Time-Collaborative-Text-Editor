// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const documentRoutes = require('./routes/document'); // We'll create this next

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

// // Routes
// app.use('/api/documents', documentRoutes); // All document-related routes will start with /api/documents

// // Simple root route
// app.get('/', (req, res) => {
//   res.send('Document App API is running!');
// });

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));