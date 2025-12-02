import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { JwtPayload } from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';
import { getToken } from './store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getToken();

  let decoded: JwtPayload | null = null;
  let invalidOrMissing = false;
  let expired = false;

  if (!token) {
    invalidOrMissing = true;
  } else {
    try {
      decoded = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;

      if (decoded.exp && decoded.exp < now) {
        expired = true;
      }
    } catch (e) {
      invalidOrMissing = true;
    }
  }

  useEffect(() => {
    if (!token || !decoded || invalidOrMissing || expired) {
      return;
    }

    if (!decoded.exp) return;

    const nowMs = Date.now();
    const expiryMs = decoded.exp * 1000;
    const msLeft = expiryMs - nowMs;

    if (msLeft <= 0) {
      localStorage.removeItem('auth_token');
      navigate('/login', {
        replace: true,
        state: { from: location.pathname },
      });

      return;
    }

    const timeoutId = window.setTimeout(() => {
      localStorage.removeItem('auth_token');
      navigate('/login', {
        replace: true,
        state: { from: location.pathname },
      });
    }, msLeft);

    return () => clearTimeout(timeoutId);
  }, [token, location.pathname]);

  if (!token || invalidOrMissing || expired) {
    localStorage.removeItem('auth_token');

    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
