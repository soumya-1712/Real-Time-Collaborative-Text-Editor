// socketService.js (DIAGNOSTIC VERSION)

import ReconnectingWebSocket from 'reconnecting-websocket';
import sharedb from 'sharedb/lib/client';
import json0 from 'ot-json0';

sharedb.types.register(json0.type);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connection = null;
  }

  connect(documentId) {
    this.socket = new ReconnectingWebSocket(SOCKET_URL);
    this.connection = new sharedb.Connection(this.socket);

    // ================== START OF DIAGNOSTIC CODE ==================

    console.log('[DIAGNOSTIC] Connecting...');

    // PROBE 1: Listen for RAW WebSocket messages.
    // This will show us EXACTLY what the browser receives, before ShareDB touches it.
    this.socket.onmessage = (event) => {
      console.log('[DIAGNOSTIC] Raw message received from server:', event.data);
    };

    // PROBE 2: Listen for errors on the ShareDB Connection object.
    // This is the MOST LIKELY place to find the hidden error.
    this.connection.on('error', (err) => {
      console.error('🔥🔥🔥 [DIAGNOSTIC] ShareDB Connection Error:', err);
    });

    // PROBE 3: Listen for state changes in the connection.
    this.connection.on('state', (state, reason) => {
      console.log(`[DIAGNOSTIC] Connection state changed to: ${state}`, reason || '');
    });

    // =================== END OF DIAGNOSTIC CODE ===================

    return this.connection;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.connection = null;
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
export default socketService;