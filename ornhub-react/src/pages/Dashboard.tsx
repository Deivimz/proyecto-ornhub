// src/pages/Dashboard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { signOut, updateProfile } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Logo from '../components/Logo';
import VideoModal from '../components/VideoModal';
import type { Modulo } from '../types';

const ADMIN_EMAIL = 'deivi@ornhub.com';
const AUDIO_LIST = ['/audio/wanda.mp3', '/audio/Ricardo.mp3'];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Profile form state
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaFoto, setNuevaFoto] = useState('');
  const [perfilMsg, setPerfilMsg] = useState('');
  const [perfilMsgType, setPerfilMsgType] = useState<'exito' | 'error'>('exito');

  // Add module form state
  const [modTitulo, setModTitulo] = useState('');
  const [modImagen, setModImagen] = useState('');
  const [modLink, setModLink] = useState('');

  // Audio ref for profile click
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    if (user) {
      setNuevoNombre(user.displayName || '');
      setNuevaFoto(user.photoURL || '');
    }
  }, [user]);

  // Firebase Realtime Listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'modulos'), (snapshot) => {
      const mods: Modulo[] = [];
      snapshot.forEach((document) => {
        mods.push({ id: document.id, ...document.data() } as Modulo);
      });
      setModulos(mods);
    });
    return () => unsubscribe();
  }, []);

  // Click en avatar → audio aleatorio
  const handleAvatarClick = () => {
    if (audioRef.current.paused) {
      const idx = Math.floor(Math.random() * AUDIO_LIST.length);
      audioRef.current.src = AUDIO_LIST[idx];
      audioRef.current.play().catch((e) => console.error('Error de audio:', e));
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Cerrar modales de opciones al hacer clic fuera
  const handleWindowClick = () => setOpenMenuId(null);

  useEffect(() => {
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // ──── Handlers de módulos ────

  const handleLike = async (id: string) => {
    if (!user || !user.email) return;
    const mod = modulos.find((m) => m.id === id);
    if (!mod) return;

    const email = user.email;
    let newLikedBy = [...mod.likedBy];
    let newDislikedBy = [...mod.dislikedBy];

    if (newLikedBy.includes(email)) {
      newLikedBy = newLikedBy.filter((e) => e !== email);
    } else {
      newLikedBy.push(email);
      newDislikedBy = newDislikedBy.filter((e) => e !== email);
    }

    const modRef = doc(db, 'modulos', id);
    await updateDoc(modRef, {
      likedBy: newLikedBy,
      dislikedBy: newDislikedBy,
      likes: newLikedBy.length,
      dislikes: newDislikedBy.length,
    });
  };

  const handleDislike = async (id: string) => {
    if (!user || !user.email) return;
    const mod = modulos.find((m) => m.id === id);
    if (!mod) return;

    const email = user.email;
    let newLikedBy = [...mod.likedBy];
    let newDislikedBy = [...mod.dislikedBy];

    if (newDislikedBy.includes(email)) {
      newDislikedBy = newDislikedBy.filter((e) => e !== email);
    } else {
      newDislikedBy.push(email);
      newLikedBy = newLikedBy.filter((e) => e !== email);
    }

    const modRef = doc(db, 'modulos', id);
    await updateDoc(modRef, {
      likedBy: newLikedBy,
      dislikedBy: newDislikedBy,
      likes: newLikedBy.length,
      dislikes: newDislikedBy.length,
    });
  };

  const handleAddComment = async (id: string, text: string) => {
    if (!user || !text.trim() || !user.email) return;
    const mod = modulos.find((m) => m.id === id);
    if (!mod) return;

    const newComment = {
      text,
      user: user.displayName || 'Usuario Anónimo',
      userEmail: user.email,
      timestamp: new Date().toISOString(),
    };

    const modRef = doc(db, 'modulos', id);
    await updateDoc(modRef, {
      comments: [...mod.comments, newComment],
    });
  };

  const handleDeleteComment = async (id: string, commentIndex: number) => {
    const mod = modulos.find((m) => m.id === id);
    if (!mod) return;

    const newComments = mod.comments.filter((_, i) => i !== commentIndex);
    const modRef = doc(db, 'modulos', id);
    await updateDoc(modRef, {
      comments: newComments,
    });
  };

  const handleOpenPlayer = async (id: string) => {
    setActiveModalId(id);
    const mod = modulos.find((m) => m.id === id);
    if (mod) {
      const modRef = doc(db, 'modulos', id);
      await updateDoc(modRef, {
        views: (mod.views || 0) + 1,
      });
    }
  };

  const handleEliminarModulo = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
      await deleteDoc(doc(db, 'modulos', id));
    }
  };

  // ──── Perfil ────

  const handlePerfilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPerfilMsg('');
    if (!user) return;
    try {
      await updateProfile(user, {
        displayName: nuevoNombre,
        photoURL: nuevaFoto || user.photoURL || undefined,
      });
      setPerfilMsg('Perfil actualizado en Firebase exitosamente.');
      setPerfilMsgType('exito');
    } catch (err: any) {
      setPerfilMsg('Error de red al actualizar. Verifica tu conexión.');
      setPerfilMsgType('error');
    }
  };

  // ──── Logout ────

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  // ──── Agregar Módulo ────

  const handleAddModulo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    const nuevo: Omit<Modulo, 'id'> = {
      titulo: modTitulo,
      imagen: modImagen,
      link: modLink,
      autor: user.displayName || 'Usuario Anon',
      autorEmail: user.email,
      views: 0,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      comments: [],
    };
    
    try {
      await addDoc(collection(db, 'modulos'), nuevo);
      setModTitulo('');
      setModImagen('');
      setModLink('');
    } catch (err) {
      console.error('Error añadiendo módulo:', err);
    }
  };

  const avatarSrc = user?.photoURL || `https://via.placeholder.com/36?text=U`;
  const avatarLargeSrc = nuevaFoto || user?.photoURL || `https://via.placeholder.com/80?text=U`;

  return (
    <ProtectedRoute>
      {/* Navbar */}
      <header className="navbar">
        <div className="nav-left">
          <div style={{ cursor: 'pointer', fontSize: '20px' }}>≡</div>
          <Logo size="md" />
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Buscar módulos, APIs o documentación..."
          />
        </div>

        <div className="nav-right">
          <img
            id="fotoPerfil"
            src={avatarSrc}
            alt="Avatar"
            className="user-avatar"
            title="Tu Perfil"
          />
        </div>
      </header>

      {/* Sub Nav */}
      <nav className="sub-nav">
        <a href="#" className="active">Inicio</a>
        <a href="#">Módulos</a>
        <a href="#">Categorías</a>
        <a href="#">Documentación</a>
        <a href="#">Comunidad</a>
      </nav>

      {/* Tags */}
      <div className="tags-container">
        {['javascript avanzado', 'firebase auth', 'inacap 2026', 'frontend spa', 'fetch api', 'css grid', 'desarrollo web', 'mejores prácticas'].map((tag) => (
          <div key={tag} className="tag">{tag}</div>
        ))}
      </div>

      {/* Main Content */}
      <main className="main-content">

        {/* Panel de Perfil */}
        <div className="section-title">Panel de Control de Usuario</div>
        <section className="profile-panel">
          <img
            id="fotoPerfilPanel"
            src={avatarLargeSrc}
            alt="Avatar"
            className="profile-avatar-large"
            onClick={handleAvatarClick}
            title="Click para reproducir audio"
          />
          <div className="profile-info">
            <h3 id="nombreMostrar">{user?.displayName || 'Usuario sin nombre'}</h3>
            <p id="correoMostrar">{user?.email}</p>
            {perfilMsg && (
              <div
                id="mensajePerfil"
                className="mensaje"
                style={{
                  display: 'block',
                  color: perfilMsgType === 'exito' ? '#28a745' : '#ff4444',
                }}
              >
                {perfilMsg}
              </div>
            )}
          </div>

          <form id="perfilForm" onSubmit={handlePerfilSubmit} style={{ flex: 2, minWidth: '300px' }}>
            <div className="form-group">
              <label htmlFor="nuevoNombre">Identificador Público (Nombre)</label>
              <input
                type="text"
                id="nuevoNombre"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="nuevaFoto">URL del Avatar (Foto de Perfil)</label>
              <input
                type="url"
                id="nuevaFoto"
                placeholder="https://ejemplo.com/avatar.jpg"
                value={nuevaFoto}
                onChange={(e) => setNuevaFoto(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px' }}>
              <button type="submit" className="btn btn-update">Actualizar Datos</button>
              <button type="button" id="btnLogout" className="btn btn-logout" onClick={handleLogout}>
                Desconectar
              </button>
            </div>
          </form>
        </section>

        {/* Publicar Módulo */}
        <div className="section-title">Publicar Nuevo Contenido</div>
        <section className="add-module-panel">
          <form id="formModulo" className="grid-form" onSubmit={handleAddModulo}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Título del Contenido</label>
              <input
                type="text"
                id="modTitulo"
                placeholder="Ej: Mi nuevo tutorial"
                value={modTitulo}
                onChange={(e) => setModTitulo(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>URL de la Imagen (Foto)</label>
              <input
                type="url"
                id="modImagen"
                placeholder="https://..."
                value={modImagen}
                onChange={(e) => setModImagen(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Link del Video / Recurso</label>
              <input
                type="url"
                id="modLink"
                placeholder="https://youtube.com/..."
                value={modLink}
                onChange={(e) => setModLink(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-add">Publicar Ahora</button>
          </form>
        </section>

        {/* Grid de Módulos */}
        <div className="section-title">Módulos Destacados 🇨🇱</div>
        <section id="contenedorModulos" className="video-grid">
          {modulos.map((mod) => {
            const esDuenio = user && mod.autorEmail === user.email;
            const esAdmin = user && user.email === ADMIN_EMAIL;
            const canManage = esDuenio || esAdmin;

            return (
              <div key={mod.id} className="card">
                {canManage && (
                  <div className="card-options">
                    <button
                      className="btn-dots"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === mod.id ? null : mod.id!);
                      }}
                    >
                      ⋮
                    </button>
                    {openMenuId === mod.id && (
                      <div className="options-menu" style={{ display: 'block' }}>
                        <button
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (mod.id) handleEliminarModulo(mod.id);
                          }}
                        >
                          Eliminar Contenido
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="card-thumbnail" onClick={() => { if (mod.id) handleOpenPlayer(mod.id); }}>
                  <img src={mod.imagen} alt="Miniatura" />
                </div>

                <div className="card-content">
                  <div className="card-meta" style={{ marginBottom: '4px' }}>
                    <span className="uploader">
                      {mod.autor} <span className="verified">✓</span>
                    </span>
                    <span>👁 {mod.views || 0}</span>
                  </div>
                  <div className="card-title" onClick={() => { if (mod.id) handleOpenPlayer(mod.id); }}>
                    {mod.titulo}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Modal Reproductor */}
      {activeModalId !== null && (
        <VideoModal
          modulo={modulos.find((m) => m.id === activeModalId)!}
          moduloId={activeModalId}
          userEmail={user?.email || null}
          userName={user?.displayName || null}
          onClose={() => setActiveModalId(null)}
          onLike={handleLike}
          onDislike={handleDislike}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </ProtectedRoute>
  );
};

export default DashboardPage;
