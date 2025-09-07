import React, { useState, useEffect } from 'react';
import { documentService } from '../api/documentService';

export default function DocumentList({ onSelectDocument, onNewDocument }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const docs = await documentService.getAllDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Collaborative Text Editor</h1>
            <p className="text-gray-600 mt-2">Create and edit documents collaboratively</p>
          </div>
          <button
            onClick={onNewDocument}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            + New Document
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No documents yet</h2>
            <p className="text-gray-600 mb-4">Create your first document to get started</p>
            <button
              onClick={onNewDocument}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Create Document
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => onSelectDocument(doc._id)}
                className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-sm text-gray-600">
                  Last updated: {new Date(doc.updatedAt).toLocaleDateString()} at{' '}
                  {new Date(doc.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Anyone can access and edit these documents</p>
          <p>Share the document URL to collaborate in real-time</p>
        </div>
      </div>
    </div>
  );
}