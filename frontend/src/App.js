import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Public Pages
import HomePage from './pages/client/HomePage';
import StorePage from './pages/client/StorePage';
import ProductDetailPage from './pages/client/ProductDetailPage';
import AboutPage from './pages/client/AboutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CartPage from './pages/client/CartPage';
import CheckoutPage from './pages/client/CheckoutPage';
import OrderConfirmPage from './pages/client/OrderConfirmPage';
import MyOrdersPage from './pages/client/MyOrdersPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductos from './pages/admin/AdminProductos';
import AdminCategorias from './pages/admin/AdminCategorias';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminPedidos from './pages/admin/AdminPedidos';
import AdminLogs from './pages/admin/AdminLogs';
import AdminEstadisticas from './pages/admin/AdminEstadisticas';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerPedidos from './pages/seller/SellerPedidos';
import SellerEstadisticas from './pages/seller/SellerEstadisticas';

// Agent
import AgenteIA from './components/shared/AgenteIA';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.rol_nombre)) {
    if (user.rol_nombre === 'admin') return <Navigate to="/admin" />;
    if (user.rol_nombre === 'vendedor') return <Navigate to="/vendedor" />;
    return <Navigate to="/" />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;
  if (user) {
    if (user.rol_nombre === 'admin') return <Navigate to="/admin" />;
    if (user.rol_nombre === 'vendedor') return <Navigate to="/vendedor" />;
    return <Navigate to="/" />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/tienda" element={<StorePage />} />
        <Route path="/tienda/categoria/:id" element={<StorePage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/registro" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Cliente */}
        <Route path="/carrito" element={<PrivateRoute roles={['cliente']}><CartPage /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute roles={['cliente']}><CheckoutPage /></PrivateRoute>} />
        <Route path="/pedido-confirmado/:id" element={<PrivateRoute roles={['cliente']}><OrderConfirmPage /></PrivateRoute>} />
        <Route path="/mis-pedidos" element={<PrivateRoute roles={['cliente']}><MyOrdersPage /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/productos" element={<PrivateRoute roles={['admin']}><AdminProductos /></PrivateRoute>} />
        <Route path="/admin/categorias" element={<PrivateRoute roles={['admin']}><AdminCategorias /></PrivateRoute>} />
        <Route path="/admin/usuarios" element={<PrivateRoute roles={['admin']}><AdminUsuarios /></PrivateRoute>} />
        <Route path="/admin/pedidos" element={<PrivateRoute roles={['admin']}><AdminPedidos /></PrivateRoute>} />
        <Route path="/admin/logs" element={<PrivateRoute roles={['admin']}><AdminLogs /></PrivateRoute>} />
        <Route path="/admin/estadisticas" element={<PrivateRoute roles={['admin']}><AdminEstadisticas /></PrivateRoute>} />

        {/* Vendedor */}
        <Route path="/vendedor" element={<PrivateRoute roles={['vendedor']}><SellerDashboard /></PrivateRoute>} />
        <Route path="/vendedor/pedidos" element={<PrivateRoute roles={['vendedor']}><SellerPedidos /></PrivateRoute>} />
        <Route path="/vendedor/estadisticas" element={<PrivateRoute roles={['vendedor']}><SellerEstadisticas /></PrivateRoute>} />
        <Route path="/vendedor/productos" element={<PrivateRoute roles={['vendedor']}><AdminProductos /></PrivateRoute>} />
        <Route path="/vendedor/categorias" element={<PrivateRoute roles={['vendedor']}><AdminCategorias /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Agente IA flotante */}
      <AgenteIA />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
