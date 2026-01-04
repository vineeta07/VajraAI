import { SavingsState } from './types';

type Callback = (data: any) => void;

class MockSocket {
  private listeners: Record<string, Callback[]> = {};

  on(event: string, cb: Callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    // Prevent duplicate listeners by clearing first
    this.listeners[event] = [cb];
  }

  off(event: string, cb?: Callback) {
    if (cb && this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(fn => fn !== cb);
    } else {
      this.listeners[event] = [];
    }
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
    // Simulate server side broadcasting some events
    if (event === 'simulate-block') {
      setTimeout(() => {
        this.emit('savings-updated', {
          blocked: 47000000 + Math.random() * 5000000,
          ghosts: 247 + Math.floor(Math.random() * 5),
          firs: 350 + Math.floor(Math.random() * 2)
        });
        this.emit('notification', {
          message: "New anomaly blocked in Adarsh Nagar! ₹1.2Cr saved.",
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
