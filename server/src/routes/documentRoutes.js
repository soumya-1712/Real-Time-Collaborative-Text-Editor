// routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const Document = require('../models/Document'); // Import your Document model

// --- CRUD Operations ---

// 1. Create a document
// POST /api/documents
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const newDocument = new Document({
      title: title || "New Document", // Default title if not provided
      content: content || "<p>Start typing...</p>" // Default content
    });
    const savedDocument = await newDocument.save();
    res.status(201).json(savedDocument); // 201 Created
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating document', error: err.message });
  }
});

// 2. Read a document by _id
// GET /api/documents/:id
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).select('title content'); // Fetch by _id and select title + content
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (err) {
    console.error(err);
    // Handle invalid ObjectId format
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid document ID' });
    }
    res.status(500).json({ message: 'Error fetching document', error: err.message });
  }
});

// 3. Update a document by _id
// PUT /api/documents/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      {
        title: title, // Update title if provided
        content: content,
        updatedAt: Date.now() // Update updatedAt timestamp
      },
      { new: true, runValidators: true } // Return the updated document, run schema validators
    ).select('title content updatedAt');

    if (!updatedDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(updatedDocument);
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid document ID' });
    }
    res.status(500).json({ message: 'Error updating document', error: err.message });
  }
});

// 4. Delete a document by _id (Optional for MVP)
// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedDocument = await Document.findByIdAndDelete(req.params.id);
    if (!deletedDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully', deletedDocumentId: req.params.id });
  } catch (err) {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid document ID' });
    }
    res.status(500).json({ message: 'Error deleting document', error: err.message });
  }
});

module.exports = router;