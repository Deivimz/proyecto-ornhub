// src/components/PublicRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Cookies from 'js-cookie';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const hasCookie = !!Cookies.get('auth_session');

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#ffa31a',
        fontSize: '1.2rem',
        fontFamily: "'Segoe UI', sans-serif"
      }}>
        Cargando...
      </div>
    );
  }

  // Si el usuario ya está autenticado (en context o cookie), redirigir al dashboard
  if (user || hasCookie) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
