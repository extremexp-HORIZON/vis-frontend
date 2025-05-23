import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getToken } from './store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = getToken();

  // Check if token exists
  if (!token) {
    // Redirect to login page while preserving the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if token is expired
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp && decoded.exp < currentTime) {
      // Token is expired, remove it and redirect to login
      localStorage.removeItem('auth_token');

      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
  } catch (error) {
    // Invalid token format, remove it and redirect to login
    localStorage.removeItem('auth_token');

    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Token is valid, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
