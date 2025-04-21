class WebSocketService {
    static instance = null;
    callbacks = {};
    socketRef = null;
  
    static getInstance() {
      if (!WebSocketService.instance) {
        WebSocketService.instance = new WebSocketService();
      }
      return WebSocketService.instance;
    }
  
    connect() {
    
      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = window.location.hostname === 'localhost'
        ? `${window.location.hostname}:8001` 
        : window.location.host;
  
      const path = `${wsProtocol}://${host}/ws/locations/`;
  
      this.socketRef = new WebSocket(path);
  
      this.socketRef.onopen = () => {
        console.log('WebSocket connection established');
      };
  
      this.socketRef.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          const callbacksForEvent = Object.values(this.callbacks);
          callbacksForEvent.forEach(callback => callback(data));
        } catch (err) {
          console.error("Error processing WebSocket message:", err);
        }
      };
  
      this.socketRef.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
  
      this.socketRef.onclose = () => {
        console.log("WebSocket connection closed");
        setTimeout(() => {
          if (this.socketRef) {
            this.connect();
          }
        }, 5000);
      };
    }
  
    disconnect() {
      if (this.socketRef) {
        this.socketRef.close();
        this.socketRef = null;
      }
    }
  
    addCallback(callbackName, callback) {
      this.callbacks[callbackName] = callback;
    }
  
    removeCallback(callbackName) {
      delete this.callbacks[callbackName];
    }
  
    sendMessage(message) {
      if (this.socketRef && this.socketRef.readyState === WebSocket.OPEN) {
        this.socketRef.send(JSON.stringify(message));
      } else {
        console.error("WebSocket connection not ready");
      }
    }
  }
  
  const WebSocketInstance = WebSocketService.getInstance();
  export default WebSocketInstance;
  