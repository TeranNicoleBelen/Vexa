import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vexa_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vexa_token');
      localStorage.removeItem('vexa_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authService = {
  getCaptcha: () => api.get('/auth/captcha'),
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  checkPassword: (password) => api.post('/auth/check-password', { password }),
};

// Productos
export const productosService = {
  getAll: (params) => api.get('/productos', { params }),
  getById: (id) => api.get(`/productos/${id}`),
  create: (data) => api.post('/productos', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/productos/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/productos/${id}`),
};

// Categorías
export const categoriasService = {
  getAll: (params) => api.get('/categorias', { params }),
  getById: (id) => api.get(`/categorias/${id}`),
  create: (data) => api.post('/categorias', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/categorias/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/categorias/${id}`),
};

// Pedidos
export const pedidosService = {
  getAll: (params) => api.get('/pedidos', { params }),
  getById: (id) => api.get(`/pedidos/${id}`),
  create: (data) => api.post('/pedidos', data),
  updateEstado: (id, estado) => api.put(`/pedidos/${id}/estado`, { estado }),
  delete: (id) => api.delete(`/pedidos/${id}`),
};

// Carrito
export const carritoService = {
  get: () => api.get('/carrito'),
  add: (producto_id, cantidad) => api.post('/carrito', { producto_id, cantidad }),
  update: (id, cantidad) => api.put(`/carrito/${id}`, { cantidad }),
  remove: (id) => api.delete(`/carrito/${id}`),
};

// Usuarios
export const usuariosService = {
  getAll: (params) => api.get('/usuarios', { params }),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

// Estadísticas
export const statsService = {
  getDashboard: () => api.get('/estadisticas/dashboard'),
  getVentasPorMes: () => api.get('/estadisticas/ventas-por-mes'),
  getProductosMasVendidos: () => api.get('/estadisticas/productos-mas-vendidos'),
  getClientesTop: () => api.get('/estadisticas/clientes-top'),
  getVentasPorCategoria: () => api.get('/estadisticas/ventas-por-categoria'),
};

// Logs
export const logsService = {
  getAcceso: (params) => api.get('/logs/acceso', { params }),
  getActividad: (params) => api.get('/logs/actividad', { params }),
};

// Reportes PDF — incluye token en la URL para que funcione en nueva pestaña
export const reportesService = {
  getPedidoPDF: (id) => {
    const token = localStorage.getItem('vexa_token');
    return `${API_URL}/reportes/pedido/${id}?token=${token}`;
  },
  getVentasPDF: () => {
    const token = localStorage.getItem('vexa_token');
    return `${API_URL}/reportes/ventas?token=${token}`;
  },
};
