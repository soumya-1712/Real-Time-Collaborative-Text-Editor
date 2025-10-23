const Document = require("../models/Document");
const { share } = require("../sharedb-instance"); // Import the shared ShareDB instance

// Create new document
exports.createDocument = async (req, res) => {
    try {
      const { title } = req.body; // Only taking title from body, content will be managed by ShareDB
      const newDocument = new Document({
        title: title || "Untitled Document",
        content: "" // Initial empty content, ShareDB will fill this
      });
      const savedDocument = await newDocument.save(); // Save metadata to Mongoose
  
      // Initialize the document in ShareDB as well
      const connection = share.connect();
      const shareDoc = connection.get("documents", savedDocument._id.toString());
      shareDoc.create({ content: "" }, 'json0', (err) => { // 'json0' type for basic JSON
        if (err) {
          console.error("ShareDB init create error:", err);
        }
        res.status(201).json(savedDocument);
      });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  };


// Get document by ID (now also fetches content from ShareDB)
exports.getDocument = async (req, res) => {
    try {
      const docId = req.params.id;
      const document = await Document.findById(docId); // Get metadata from Mongoose
      if (!document) return res.status(404).json({ error: "Not found" });
  
      // Fetch content from ShareDB
      const connection = share.connect();
      const shareDoc = connection.get("documents", docId);
      shareDoc.fetch(function(err) {
        if (err) {
          console.error("ShareDB fetch error in controller:", err);
          return res.json({ ...document.toObject(), content: "Error loading content" });
        }
        const content = shareDoc.type === null ? document.content : shareDoc.data.content;
        res.json({ ...document.toObject(), content, version: shareDoc.version });
      });
  
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  };

// Update document (primarily for metadata, ShareDB handles content updates)
exports.updateDocument = async (req, res) => {
    try {
      const { title } = req.body; // Assuming content will be updated via WebSockets
      const docId = req.params.id;
  
      const updatedDocument = await Document.findByIdAndUpdate(
        docId,
        { title, updatedAt: Date.now() }, // Only update title and timestamp via REST
        { new: true, runValidators: true }
      );
      if (!updatedDocument) return res.status(404).json({ error: "Not found" });
  
      res.json(updatedDocument);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  };

// Delete document (also delete from ShareDB)
exports.deleteDocument = async (req, res) => {
    try {
      const docId = req.params.id;
      const deletedDocument = await Document.findByIdAndDelete(docId); // Delete from Mongoose
      if (!deletedDocument) return res.status(404).json({ error: "Not found" });
  
      // Delete from ShareDB
      const connection = share.connect();
      const shareDoc = connection.get("documents", docId);
      shareDoc.fetch((err) => {
        if (err) console.error("Error fetching ShareDB doc for delete:", err);
        if (shareDoc.type !== null) { // Only delete if it exists in ShareDB
          shareDoc.del((err) => {
            if (err) console.error("ShareDB delete error:", err);
          });
        }
      });
  
      res.json({ message: "Deleted successfully", deletedDocumentId: docId });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  };

  
// Get all documents (for public access - shows recent documents)
exports.getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find({})
      .select('_id title updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(docs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};