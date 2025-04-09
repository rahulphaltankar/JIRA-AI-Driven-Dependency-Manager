import { WebSocketMessage } from "@shared/types";

type MessageHandler = (data: any) => void;
type ConnectionStatusChangeHandler = (connected: boolean) => void;

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private connectionStatusHandlers: ConnectionStatusChangeHandler[] = [];
  private url: string;
  
  constructor() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.url = `${protocol}//${window.location.host}/ws`;
  }

  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connection established");
      this.notifyConnectionStatusChange(true);
      
      // Clear any reconnect timer
      if (this.reconnectTimer !== null) {
        window.clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket connection closed");
      this.notifyConnectionStatusChange(false);
      
      // Attempt to reconnect after 5 seconds
      this.reconnectTimer = window.setTimeout(() => {
        this.connect();
      }, 5000);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      // The onclose handler will be called after this
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("Cannot send message: WebSocket is not open");
      // Reconnect and queue the message to be sent when connected
      this.connect();
    }
  }

  onMessage(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(handler);
    
    // Return a function to remove this handler
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  onConnectionStatusChange(handler: ConnectionStatusChangeHandler): () => void {
    this.connectionStatusHandlers.push(handler);
    
    // Return a function to remove this handler
    return () => {
      const index = this.connectionStatusHandlers.indexOf(handler);
      if (index !== -1) {
        this.connectionStatusHandlers.splice(index, 1);
      }
    };
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message.data);
      } catch (error) {
        console.error(`Error handling message of type ${message.type}:`, error);
      }
    });
  }

  private notifyConnectionStatusChange(connected: boolean): void {
    this.connectionStatusHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        console.error("Error in connection status change handler:", error);
      }
    });
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();

// Hook to be used in components
export function useWebSocket() {
  return wsClient;
}
