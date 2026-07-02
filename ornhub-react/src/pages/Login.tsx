// src/pages/Login.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import Logo from '../components/Logo';
import PublicRoute from '../components/PublicRoute';

import { mapearError } from '../utils/errorMapper';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Modal recuperación
  const [modalOpen, setModalOpen] = useState(false);
  const [correoRecuperacion, setCorreoRecuperacion] = useState('');
  const [mensajeModal, setMensajeModal] = useState('');
  const [mensajeModalColor, setMensajeModalColor] = useState('red');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, correo.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(mapearError(err.code));
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(mapearError(err.code));
    }
  };

  const handleRecuperar = async () => {
    if (!correoRecuperacion.trim()) {
      setMensajeModalColor('red');
      setMensajeModal('Por favor, ingresa un correo.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, correoRecuperacion.trim());
      setMensajeModalColor('green');
      setMensajeModal('Enlace enviado. Revisa tu bandeja de entrada.');
      setCorreoRecuperacion('');
    } catch (err: any) {
      setMensajeModalColor('red');
      setMensajeModal(mapearError(err.code));
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setMensajeModal('');
    setCorreoRecuperacion('');
  };

  return (
    <PublicRoute>
      <div className="container">
        <div className="logo-container">
          <Logo size="md" />
        </div>

        <form id="loginForm" onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div id="mensajeError" className="error" style={{ display: 'block' }}>
              {error}
            </div>
          )}

          <button type="submit">Ingresar de forma segura</button>

          <button type="button" id="btnGoogle" className="btn-google" onClick={handleGoogleLogin}>
            <svg className="google-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Ingresar con Google
          </button>
        </form>

        <span className="link" id="abrirModal" onClick={() => setModalOpen(true)}>
          ¿Olvidaste tu contraseña?
        </span>
        <p className="footer-text">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>

      {/* Modal Recuperación */}
      {modalOpen && (
        <div id="modalRecuperacion" className="modal" style={{ display: 'block' }} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-content">
            <span className="close" id="cerrarModal" onClick={closeModal}>×</span>
            <h3>Recuperar Acceso</h3>
            <p style={{ fontSize: '0.9rem' }}>Ingresa tu correo para recibir un enlace de recuperación.</p>
            <input
              type="email"
              id="correoRecuperacion"
              placeholder="tu@correo.com"
              value={correoRecuperacion}
              onChange={(e) => setCorreoRecuperacion(e.target.value)}
            />
            {mensajeModal && (
              <div id="mensajeModal" style={{ color: mensajeModalColor, fontWeight: 'bold', textAlign: 'center', marginTop: '10px' }}>
                {mensajeModal}
              </div>
            )}
            <button id="btnRecuperar" onClick={handleRecuperar}>Enviar Enlace</button>
          </div>
        </div>
      )}
    </PublicRoute>
  );
};

export default LoginPage;
