import './App.css'
import { MainLayout } from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Auth from './pages/Auth/AuthPage'
import { PrivateRoute, PublicRoute } from './components/ProtectedRoutes'
import { useEffect } from 'react'

const App = () => {
  const Redirect = ({ page = '/auth' }) => {
    const navigate = useNavigate();

    useEffect(() => {
      navigate(page, { replace: true });
    }, [navigate, page]);

    return null;
  };
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
      </Route>
      <Route path="*" element={<Redirect />} />
    </Routes>
)
}

export default App
