import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { verifyToken } from './auth.js';

interface AuthenticatedClient {
  ws: WebSocket;
  userId: string;
  isAlive: boolean;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<AuthenticatedClient> = new Set();

  public init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      let currentClient: AuthenticatedClient | null = null;

      // Handle message (like auth token or ping)
      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'AUTH') {
            const token = message.token;
            if (token) {
              const decoded = verifyToken(token);
              if (decoded) {
                currentClient = {
                  ws,
                  userId: decoded.id,
                  isAlive: true,
                };
                this.clients.add(currentClient);
                ws.send(JSON.stringify({
                  type: 'CONNECTED',
                  userId: decoded.id,
                  message: 'Real-time WebSocket authenticated and connected.',
                }));
              } else {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid authentication token.' }));
              }
            }
          } else if (message.type === 'PING') {
            if (currentClient) currentClient.isAlive = true;
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          }
        } catch (err) {
          // ignore malformed ws messages
        }
      });

      ws.on('close', () => {
        if (currentClient) {
          this.clients.delete(currentClient);
        }
      });

      ws.on('error', () => {
        if (currentClient) {
          this.clients.delete(currentClient);
        }
      });
    });

    // Setup heartbeat interval
    setInterval(() => {
      this.clients.forEach(client => {
        if (!client.isAlive) {
          this.clients.delete(client);
          return client.ws.terminate();
        }
        client.isAlive = false;
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
        }
      });
    }, 30000);
  }

  public broadcastToUser(userId: string, event: { type: string; payload?: any }) {
    const payloadStr = JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
    });

    this.clients.forEach(client => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payloadStr);
      }
    });
  }
}

export const wsManager = new WebSocketManager();
