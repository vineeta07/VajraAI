class MockSocket {
  listeners = {};
  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event] = [cb];
  }
  off(event, cb) {
    if (cb && this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((fn) => fn !== cb);
    } else {
      this.listeners[event] = [];
    }
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => cb(data));
    }
    if (event === "simulate-block") {
      setTimeout(() => {
        this.emit("savings-updated", {
          blocked: 47e6 + Math.random() * 5e6,
          ghosts: 247 + Math.floor(Math.random() * 5),
          firs: 350 + Math.floor(Math.random() * 2)
        });
        this.emit("notification", {
          message: "New anomaly blocked in Adarsh Nagar! \u20B91.2Cr saved.",
          type: "success"
        });
      }, 500);
    }
  }
  disconnect() {
    this.listeners = {};
  }
}
export const socket = new MockSocket();
