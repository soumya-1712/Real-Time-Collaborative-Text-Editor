import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(documentId, userId = null) {
    console.log('🔌 Connecting to Socket.IO server:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
    
    // Join the document room
    if (documentId) {
      this.joinDocument(documentId, userId);
    }

    return this.socket;
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Socket.IO connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to Socket.IO server after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🚨 Socket.IO reconnection error:', error);
    });
  }

  joinDocument(documentId, userId = null) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    const userData = {
      documentId,
      userId: userId || `user_${Date.now()}`,
      timestamp: Date.now()
    };

    console.log('📖 Joining document:', userData);
    this.socket.emit('join-document', userData);
  }

  leaveDocument(documentId) {
    if (!this.socket) return;

    console.log('📤 Leaving document:', documentId);
    this.socket.emit('leave-document', { documentId });
  }

  // Document operations
  sendOperation(documentId, operation) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    const operationData = {
      documentId,
      operation,
      timestamp: Date.now(),
      userId: this.socket.id
    };

    console.log('📝 Sending operation:', operationData);
    this.socket.emit('document-operation', operationData);
  }

  sendSelection(documentId, selection) {
    if (!this.socket) return;

    const selectionData = {
      documentId,
      selection,
      timestamp: Date.now(),
      userId: this.socket.id
    };

    this.socket.emit('selection-change', selectionData);
  }

  sendCursor(documentId, cursor) {
    if (!this.socket) return;

    const cursorData = {
      documentId,
      cursor,
      timestamp: Date.now(),
      userId: this.socket.id
    };

    this.socket.emit('cursor-change', cursorData);
  }

  // Event listeners
  onDocumentOperation(callback) {
    if (!this.socket) return;
    
    this.socket.on('document-operation', (data) => {
      console.log('📥 Received operation:', data);
      callback(data);
    });
  }

  onSelectionChange(callback) {
    if (!this.socket) return;
    
    this.socket.on('selection-change', (data) => {
      console.log('📍 Received selection change:', data);
      callback(data);
    });
  }

  onCursorChange(callback) {
    if (!this.socket) return;
    
    this.socket.on('cursor-change', (data) => {
      console.log('👆 Received cursor change:', data);
      callback(data);
    });
  }

  onUserJoined(callback) {
    if (!this.socket) return;
    
    this.socket.on('user-joined', (data) => {
      console.log('👋 User joined:', data);
      callback(data);
    });
  }

  onUserLeft(callback) {
    if (!this.socket) return;
    
    this.socket.on('user-left', (data) => {
      console.log('👋 User left:', data);
      callback(data);
    });
  }

  onDocumentUpdated(callback) {
    if (!this.socket) return;
    
    this.socket.on('document-updated', (data) => {
      console.log('📄 Document updated:', data);
      callback(data);
    });
  }

  onActiveUsers(callback) {
    if (!this.socket) return;
    
    this.socket.on('active-users', (data) => {
      console.log('👥 Active users:', data);
      callback(data);
    });
  }

  // Connection management
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from Socket.IO server');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Utility methods
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

// Create singleton instance
export const socketService = new SocketService();
export default socketService;