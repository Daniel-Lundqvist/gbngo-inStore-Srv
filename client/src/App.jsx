import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import IdlePage from './pages/IdlePage';
import StartPage from './pages/StartPage';
import GuestPage from './pages/GuestPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GamesPage from './pages/GamesPage';
import GameModeSelectionPage from './pages/GameModeSelectionPage';
import ValidatedGamePlayPage from './pages/ValidatedGamePlayPage';
import MyPage from './pages/MyPage';
import ProductsPage from './pages/ProductsPage';
import IdeaBoxPage from './pages/IdeaBoxPage';
import HighscoresPage from './pages/HighscoresPage';
import ControllerPage from './pages/ControllerPage';
import ControllerTestPage from './pages/ControllerTestPage';
import AdminLoginPage from './pages/AdminLoginPage';
import NotFoundPage from './pages/NotFoundPage';
import TournamentPage from './pages/TournamentPage';
import TimeoutTestPage from './pages/TimeoutTestPage';

// Admin pages
import {
  AdminLayout,
  AdminDashboard,
  AdminSettings,
  AdminProducts,
  AdminCategories,
  AdminIdeaResponses,
  AdminAdvertisements,
  AdminStatistics,
  AdminMaintenance
} from './pages/admin';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirect after login
    return <Navigate to="/start" state={{ from: location.pathname }} replace />;
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
        <Route path="/controller-test" element={<ControllerTestPage />} />

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
        {/* Game mode selection screen */}
        <Route
          path="/games/:gameSlug"
          element={
            <ProtectedRoute>
              <GameModeSelectionPage />
            </ProtectedRoute>
          }
        />
        {/* Actual game play with mode */}
        <Route
          path="/games/:gameSlug/play"
          element={
            <ProtectedRoute>
              <ValidatedGamePlayPage />
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
        <Route
          path="/highscores"
          element={
            <ProtectedRoute>
              <HighscoresPage />
            </ProtectedRoute>
          }
        />


        {/* Tournament routes */}
        <Route
          path="/tournament"
          element={
            <ProtectedRoute>
              <TournamentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournament/:tournamentId"
          element={
            <ProtectedRoute>
              <TournamentPage />
            </ProtectedRoute>
          }
        />

        {/* Timeout test page */}
        <Route
          path="/timeout-test"
          element={
            <ProtectedRoute>
              <TimeoutTestPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="idea-responses" element={<AdminIdeaResponses />} />
          <Route path="advertisements" element={<AdminAdvertisements />} />
          <Route path="statistics" element={<AdminStatistics />} />
          <Route path="maintenance" element={<AdminMaintenance />} />
        </Route>

        {/* 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
