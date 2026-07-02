// src/pages/Register.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import Logo from '../components/Logo';
import PublicRoute from '../components/PublicRoute';

import { mapearError } from '../utils/errorMapper';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre || !correo || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, correo, password);
      await updateProfile(userCredential.user, { displayName: nombre });
      alert('Usuario registrado con éxito. Redirigiendo...');
      navigate('/login');
    } catch (err: any) {
      setError(mapearError(err.code));
    }
  };

  return (
    <PublicRoute>
      <div className="container">
        <div className="logo-container">
          <Logo size="md" />
        </div>
        <p className="subtitle">Crear Cuenta Nueva</p>

        <form id="registroForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre de usuario</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div id="mensajeError" className="error" style={{ display: 'block' }}>
              {error}
            </div>
          )}

          <button type="submit">Registrarse</button>
        </form>

        <p className="footer-text">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </PublicRoute>
  );
};

export default RegisterPage;
