import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080', // Вкажи хост бекенду
  headers: {
    'Content-Type': 'application/json',
  },
})

// Автоматично підставляємо токен у кожен запит
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config;
})

export default api