const API_BASE = '/api';

export const api = {
  async checkStatus() {
    try {
      const res = await fetch(`${API_BASE}/`);
      return await res.json();
    } catch (err) {
      console.error('API status check failed:', err);
      return { status: 'offline' };
    }
  },

  async getRooms(showAll = true) {
    const res = await fetch(`${API_BASE}/rooms?all=${showAll}`);
    if (!res.ok) {
      throw new Error(`Failed to load rooms: ${res.statusText}`);
    }
    return await res.json();
  },

  async bookRoom(bookingData) {
    const res = await fetch(`${API_BASE}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to complete booking');
    }
    return data;
  },

  async getBookings(userId = null) {
    const url = userId ? `${API_BASE}/bookings?user_id=${userId}` : `${API_BASE}/bookings`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load bookings: ${res.statusText}`);
    }
    return await res.json();
  },

  async cancelBooking(bookingId) {
    const res = await fetch(`${API_BASE}/cancel/${bookingId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to cancel booking');
    }
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  }
};
