import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' }
});

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('auth');
  if (stored) {
    const { token } = JSON.parse(stored);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}
