const express = require("express");
const router = express.Router();
const {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  getAllDocuments
} = require("../controllers/documentController"); // Adjust path if your structure differs

router.get("/", getAllDocuments); // Get all documents (must be before /:id)
router.post("/", createDocument);
router.get("/:id", getDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

module.exports = router;