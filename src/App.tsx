import './App.css'
import { MainLayout } from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Auth from './pages/Auth/AuthPage'
import { PrivateRoute, PublicRoute } from './components/ProtectedRoutes'
import { useEffect } from 'react'
import Settings from './pages/Settings'
import Issues from './pages/Issues'
import Team from './pages/Team'
import Projects from './pages/Projects'
import Reports from './pages/Reports'
import Activity from './pages/Activity'
import Labels from './pages/Labels'
import Chat from './pages/Chat'
import { useAuth } from './contexts/AuthContext'
import { AuthLoader } from './components/AuthLoader'
import AdminDashboard from './pages/AdminDashboard'

const App = () => {
  const { isLoading, isAuthenticated } = useAuth();
  
  const Redirect = ({ page = '/auth' }) => {
    const navigate = useNavigate();

    useEffect(() => {
      navigate(page, { replace: true });
    }, [navigate, page]);

    return null;
  };

  // Show loading screen while authentication is being initialized
  if (isLoading) {
    return <AuthLoader />;
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        }
      />
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/issues"
          element={
            <PrivateRoute>
              <Issues />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin_dashoard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/team"
          element={
            <PrivateRoute>
              <Team />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <PrivateRoute>
              <Activity />
            </PrivateRoute>
          }
        />
        <Route
          path="/labels"
          element={
            <PrivateRoute>
              <Labels />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
      </Route>
      
      {/* Default redirect */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Redirect page="/dashboard" /> : <Redirect page="/auth" />
        } 
      />
      <Route path="*" element={<Redirect />} />
    </Routes>
  );
}

export default App