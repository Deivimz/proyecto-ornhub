// src/pages/Dashboard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { signOut, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Logo from '../components/Logo';
import VideoModal from '../components/VideoModal';
import type { Modulo } from '../types';

const ADMIN_EMAIL = 'deivi@ornhub.com';
const AUDIO_LIST = ['/audio/wanda.mp3', '/audio/Ricardo.mp3'];
const STORAGE_KEY = 'modulosUsuario';

const defaultModulos: Modulo[] = [
  {
    titulo: 'Tutorial de Firebase',
    imagen: 'https://via.placeholder.com/300x180/ff9900/000000?text=Firebase',
    link: '#',
    autor: 'Admin',
    autorEmail: 'deivi@ornhub.com',
    views: 1240,
    likes: 0,
    dislikes: 0,
    likedBy: [],
    dislikedBy: [],
    comments: [
      {
        text: '¡Excelente tutorial!',
        user: 'Usuario1',
        userEmail: 'user1@example.com',
        timestamp: new Date().toISOString(),
      },
    ],
  },
];

const loadModulos = (): Modulo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: Modulo[] = JSON.parse(stored);
      // Migración: asegurar que todos tienen los campos necesarios
      return parsed.map((mod) => ({
        ...mod,
        likedBy: mod.likedBy || [],
        dislikedBy: mod.dislikedBy || [],
        comments: mod.comments || [],
        likes: (mod.likedBy || []).length,
        dislikes: (mod.dislikedBy || []).length,
      }));
    }
  } catch {
    // ignore parse errors
  }
  return defaultModulos;
};

const saveModulos = (modulos: Modulo[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modulos));
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [modulos, setModulos] = useState<Modulo[]>(loadModulos);
  const [activeModal, setActiveModal] = useState<number | null>(null);

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

  // Save modulos to localStorage whenever they change
  useEffect(() => {
    saveModulos(modulos);
  }, [modulos]);

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
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const handleWindowClick = () => setOpenMenuIndex(null);

  useEffect(() => {
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // ──── Handlers de módulos ────

  const handleLike = (index: number) => {
    if (!user) return;
    setModulos((prev) => {
      const updated = [...prev];
      const mod = { ...updated[index] };
      const email = user.email!;

      const likedIdx = mod.likedBy.indexOf(email);
      const dislikedIdx = mod.dislikedBy.indexOf(email);

      if (likedIdx > -1) {
        mod.likedBy = mod.likedBy.filter((e) => e !== email);
      } else {
        mod.likedBy = [...mod.likedBy, email];
        if (dislikedIdx > -1) mod.dislikedBy = mod.dislikedBy.filter((e) => e !== email);
      }

      mod.likes = mod.likedBy.length;
      mod.dislikes = mod.dislikedBy.length;
      updated[index] = mod;
      return updated;
    });
  };

  const handleDislike = (index: number) => {
    if (!user) return;
    setModulos((prev) => {
      const updated = [...prev];
      const mod = { ...updated[index] };
      const email = user.email!;

      const likedIdx = mod.likedBy.indexOf(email);
      const dislikedIdx = mod.dislikedBy.indexOf(email);

      if (dislikedIdx > -1) {
        mod.dislikedBy = mod.dislikedBy.filter((e) => e !== email);
      } else {
        mod.dislikedBy = [...mod.dislikedBy, email];
        if (likedIdx > -1) mod.likedBy = mod.likedBy.filter((e) => e !== email);
      }

      mod.likes = mod.likedBy.length;
      mod.dislikes = mod.dislikedBy.length;
      updated[index] = mod;
      return updated;
    });
  };

  const handleAddComment = (index: number, text: string) => {
    if (!user || !text.trim()) return;
    setModulos((prev) => {
      const updated = [...prev];
      const mod = { ...updated[index] };
      mod.comments = [
        ...mod.comments,
        {
          text,
          user: user.displayName || 'Usuario Anónimo',
          userEmail: user.email!,
          timestamp: new Date().toISOString(),
        },
      ];
      updated[index] = mod;
      return updated;
    });
  };

  const handleDeleteComment = (moduleIndex: number, commentIndex: number) => {
    setModulos((prev) => {
      const updated = [...prev];
      const mod = { ...updated[moduleIndex] };
      mod.comments = mod.comments.filter((_, i) => i !== commentIndex);
      updated[moduleIndex] = mod;
      return updated;
    });
  };

  const handleOpenPlayer = (index: number) => {
    setModulos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], views: (updated[index].views || 0) + 1 };
      return updated;
    });
    setActiveModal(index);
  };

  const handleEliminarModulo = (index: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contenido?')) {
      setModulos((prev) => prev.filter((_, i) => i !== index));
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

  const handleAddModulo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const nuevo: Modulo = {
      titulo: modTitulo,
      imagen: modImagen,
      link: modLink,
      autor: user.displayName || 'Usuario Anon',
      autorEmail: user.email!,
      views: 0,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      comments: [],
    };
    setModulos((prev) => [nuevo, ...prev]);
    setModTitulo('');
    setModImagen('');
    setModLink('');
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
          {modulos.map((mod, index) => {
            const esDuenio = user && mod.autorEmail === user.email;
            const esAdmin = user && user.email === ADMIN_EMAIL;
            const canManage = esDuenio || esAdmin;

            return (
              <div key={index} className="card">
                {canManage && (
                  <div className="card-options">
                    <button
                      className="btn-dots"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuIndex(openMenuIndex === index ? null : index);
                      }}
                    >
                      ⋮
                    </button>
                    {openMenuIndex === index && (
                      <div className="options-menu" style={{ display: 'block' }}>
                        <button
                          className="btn-delete"
                          data-index={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminarModulo(index);
                          }}
                        >
                          Eliminar Contenido
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="card-thumbnail" onClick={() => handleOpenPlayer(index)}>
                  <img src={mod.imagen} alt="Miniatura" />
                </div>

                <div className="card-content">
                  <div className="card-meta" style={{ marginBottom: '4px' }}>
                    <span className="uploader">
                      {mod.autor} <span className="verified">✓</span>
                    </span>
                    <span>👁 {mod.views || 0}</span>
                  </div>
                  <div className="card-title" onClick={() => handleOpenPlayer(index)}>
                    {mod.titulo}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Modal Reproductor */}
      {activeModal !== null && (
        <VideoModal
          modulo={modulos[activeModal]}
          moduloIndex={activeModal}
          userEmail={user?.email || null}
          userName={user?.displayName || null}
          onClose={() => setActiveModal(null)}
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
