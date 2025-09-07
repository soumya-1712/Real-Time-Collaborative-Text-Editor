const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class DocumentService {
  async createDocument(title, content) {
    console.log('📝 Creating document:', { title, content });
    console.log('🌐 API URL:', `${API_BASE_URL}/api/documents`);
    
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title || 'Untitled document',
        content: JSON.stringify(content)
      })
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Failed to create document:', response.statusText);
      throw new Error(`Failed to create document: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Document created:', result);
    return result;
  }

  async getDocument(id) {
    console.log('📖 Getting document:', id);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/documents/${id}`);
    
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Document not found');
      }
      throw new Error(`Failed to get document: ${response.statusText}`);
    }

    const doc = await response.json();
    console.log('📄 Raw document from API:', doc);
    
    let parsedContent;
    try {
      // Try to parse as JSON (Slate.js format)
      parsedContent = JSON.parse(doc.content || '[]');
      console.log('✅ Parsed content as JSON:', parsedContent);
    } catch (error) {
      // If it's not JSON, convert plain text to Slate.js format
      console.log('🔄 Converting plain text to Slate.js format');
      parsedContent = [
        {
          type: "paragraph",
          children: [{ text: doc.content || "" }]
        }
      ];
      console.log('✅ Converted content:', parsedContent);
    }
    
    const result = {
      ...doc,
      content: parsedContent
    };
    
    console.log('📋 Final document result:', result);
    return result;
  }

  async updateDocument(id, title, content) {
    console.log('📝 Updating document:', { id, title, content });
    console.log('🌐 API URL:', `${API_BASE_URL}/api/documents/${id}`);
    
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title || 'Untitled document',
        content: JSON.stringify(content)
      })
    });

    console.log('📡 Update response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Failed to update document:', response.statusText);
      throw new Error(`Failed to update document: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Document updated:', result);
    return result;
  }

  async deleteDocument(id) {
    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }

    return response.json();
  }

  async getAllDocuments() {
    const response = await fetch(`${API_BASE_URL}/api/documents`);

    if (!response.ok) {
      throw new Error(`Failed to get documents: ${response.statusText}`);
    }

    return response.json();
  }
}

export const documentService = new DocumentService();