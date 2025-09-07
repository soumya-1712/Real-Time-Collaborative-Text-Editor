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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.error(err));

// // Routes
// app.use('/api/documents', documentRoutes); // All document-related routes will start with /api/documents

// // Simple root route
// app.get('/', (req, res) => {
//   res.send('Document App API is running!');
// });

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));