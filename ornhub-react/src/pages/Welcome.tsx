// src/pages/Welcome.tsx

import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import PublicRoute from '../components/PublicRoute';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();

    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/sape.mp3');
    }

    const audio = audioRef.current;

    if (audio.paused) {
      audio.play().catch((err) => console.error('Error al reproducir audio:', err));
      timerRef.current = setTimeout(() => {
        navigate(path);
      }, 1500);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      audio.pause();
      audio.currentTime = 0;
      navigate(path);
    }
  };

  return (
    <PublicRoute>
      <div className="welcome-container">
        <div className="app-logo">
          <Logo size="lg" />
        </div>

        <h2>Este es un Sistema<br />Seguro de Autenticación</h2>

        <hr className="divider" />

        <p>
          Estás intentando acceder al Sistema de Autenticación Centralizado desarrollado por Deivi
          para la Evaluación Sumativa N°3. <br /><br />
          Esta plataforma utiliza Firebase Authentication para gestionar el acceso de usuarios de
          forma segura y federada, permitiendo autenticación con correo/contraseña y proveedores
          sociales como Google, cumpliendo con todos los requerimientos técnicos del proyecto.
        </p>

        <div className="action-buttons">
          <a
            href="/login"
            id="btnTengoCuenta"
            className="btn btn-enter"
            onClick={(e) => handleNavClick(e, '/login')}
          >
            Ya tengo cuenta - Ingresar
          </a>
          <a
            href="/register"
            id="btnSoyNuevo"
            className="btn btn-register"
            onClick={(e) => handleNavClick(e, '/register')}
          >
            Soy nuevo - Registrarme
          </a>
        </div>

        <div className="footer">
          <p>© AuthDeivi, 2026. Todos los derechos reservados. <br />Versión del Sistema: 1.0.0</p>
        </div>
      </div>
    </PublicRoute>
  );
};

export default WelcomePage;
