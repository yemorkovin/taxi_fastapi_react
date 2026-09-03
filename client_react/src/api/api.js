import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Базовый URL вашего FastAPI
  timeout: 5000,                         // Таймаут запроса (5 секунд)
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
