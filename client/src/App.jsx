import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import IdlePage from './pages/IdlePage';
import StartPage from './pages/StartPage';
import GuestPage from './pages/GuestPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GamesPage from './pages/GamesPage';
import GamePlayPage from './pages/GamePlayPage';
import MyPage from './pages/MyPage';
import ProductsPage from './pages/ProductsPage';
import IdeaBoxPage from './pages/IdeaBoxPage';
import ControllerPage from './pages/ControllerPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/start" replace />;
  }

  return children;
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<IdlePage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/guest" element={<GuestPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/controller" element={<ControllerPage />} />
        <Route path="/controller/:sessionId" element={<ControllerPage />} />

        {/* Protected routes (require authentication) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <GamesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/:gameSlug"
          element={
            <ProtectedRoute>
              <GamePlayPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-page"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/idea-box"
          element={
            <ProtectedRoute>
              <IdeaBoxPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
