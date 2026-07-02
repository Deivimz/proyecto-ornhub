# 📋 Context — Migración a React + TypeScript + Vite

## Descripción del Proyecto Original

**OrnHub** — Sistema de Autenticación y Gestión de Contenidos desarrollado para la Evaluación Sumativa N°3 (INACAP 2026).

El proyecto original está construido en HTML puro + CSS + JavaScript vanilla usando Firebase Auth (v10.12.2) desde CDN.

---

## 📁 Estructura Original (HTML/CSS/JS)

```
ProyectoJavascript_EV03_DLMG/
├── index.html          → Landing page (bienvenida + botones login/registro)
├── login.html          → Formulario login + Google Auth + modal recuperar contraseña
├── registro.html       → Formulario registro de cuenta nueva
├── dashboard.html      → Panel protegido con módulos de contenido
├── js/
│   ├── firebase-config.js   → Inicialización Firebase + exporta auth
│   ├── index.js             → Guard de rutas + lógica de audio toggle (sape.mp3)
│   ├── login.js             → signInWithEmailAndPassword + Google Popup + sendPasswordResetEmail
│   ├── registro.js          → createUserWithEmailAndPassword + updateProfile
│   └── dashboard.js         → Guard + perfil + módulos CRUD + likes/dislike/comments + player modal
└── audio/
    ├── sape.mp3        → Se reproduce en landing al presionar botón
    ├── wanda.mp3       → Se reproduce aleatoriamente al clickear avatar en dashboard
    └── Ricardo.mp3     → Se reproduce aleatoriamente al clickear avatar en dashboard
```

---

## 🔥 Lógica de Firebase

- **Auth**: Email/Password + Google OAuth (Popup)
- **Config**: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
- **Funciones usadas**:
  - `onAuthStateChanged` — Guard de rutas en todas las páginas
  - `signInWithEmailAndPassword` — Login tradicional
  - `signInWithPopup` + `GoogleAuthProvider` — Login Google
  - `sendPasswordResetEmail` — Modal de recuperación de contraseña
  - `createUserWithEmailAndPassword` — Registro
  - `updateProfile` — Editar nombre y foto de perfil
  - `signOut` — Cerrar sesión

---

## 📊 Lógica de Dashboard

- **Guard**: Redirige a login si no está autenticado
- **Módulos**: Guardados en `localStorage` como array JSON
- **Campos de cada módulo**: título, imagen (URL), link (YouTube/video directo), autor, autorEmail, likes, dislikes, likedBy[], dislikedBy[], comments[], views
- **Funciones**:
  - renderizar grid de cards
  - abrir reproductor modal (YouTube iframe o `<video>` nativo)
  - handleLike / handleDislike — Toggle por email
  - addComment / deleteComment — CRUD comentarios
  - eliminarModulo — Solo dueño o ADMIN puede eliminar
- **Admin**: `ADMIN_EMAIL = "deivi@ornhub.com"` puede borrar cualquier módulo/comentario

---

## 🎯 Objetivo de la Migración

Convertir el proyecto **completo** a **React 18 + TypeScript + Vite**, manteniendo:
- Toda la lógica de Firebase existente
- Todo el diseño visual (dark mode, colores naranja `#ffa31a`, etc.)
- Toda la funcionalidad de módulos (CRUD + likes + comentarios + reproductor)
- Los archivos de audio existentes
- Routing con `react-router-dom` (SPA en lugar de múltiples HTML)

---

## 🗂️ Estructura Target (React + TS + Vite)

```
ornhub-react/                    ← Nuevo proyecto dentro de la carpeta actual
├── public/
│   └── audio/                   ← Copiar los 3 archivos .mp3 aquí
├── src/
│   ├── main.tsx                 ← Entry point
│   ├── App.tsx                  ← Router principal (BrowserRouter)
│   ├── firebase/
│   │   └── config.ts            ← Inicialización Firebase
│   ├── types/
│   │   └── index.ts             ← Interfaces TypeScript (Modulo, Comment, User)
│   ├── hooks/
│   │   └── useAuth.ts           ← Custom hook: onAuthStateChanged
│   ├── context/
│   │   └── AuthContext.tsx      ← Context API para estado de autenticación global
│   ├── components/
│   │   ├── Logo.tsx             ← Logo "OrnHub" reutilizable
│   │   ├── ProtectedRoute.tsx   ← Wrapper que redirige si no está autenticado
│   │   ├── PublicRoute.tsx      ← Wrapper que redirige al dashboard si ya autenticado
│   │   └── VideoModal.tsx       ← Modal del reproductor con likes + comentarios
│   ├── pages/
│   │   ├── Welcome.tsx          ← index.html → audio toggle + guard
│   │   ├── Login.tsx            ← login.html → email/pass + Google + modal recuperación
│   │   ├── Register.tsx         ← registro.html → createUser + updateProfile
│   │   └── Dashboard.tsx        ← dashboard.html → perfil + módulos grid + add form
│   └── styles/
│       └── globals.css          ← Todos los estilos CSS unificados
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## ✅ Plan de Ejecución (Checklist)

### Fase 1 — Scaffolding
- [x] Crear `context.md` (este archivo)
- [x] Inicializar proyecto Vite con template React-TS (`ornhub-react/`)
- [x] Instalar dependencias: `firebase`, `react-router-dom`
- [x] Copiar archivos de audio a `public/audio/`

### Fase 2 — Configuración Base
- [x] Crear `src/firebase/config.ts`
- [x] Crear `src/types/index.ts`
- [x] Crear `src/context/AuthContext.tsx`

### Fase 3 — Componentes Reutilizables
- [x] Crear `Logo.tsx`
- [x] Crear `ProtectedRoute.tsx`
- [x] Crear `PublicRoute.tsx`
- [x] Crear `VideoModal.tsx`

### Fase 4 — Páginas
- [x] Crear `pages/Welcome.tsx` (landing + audio toggle)
- [x] Crear `pages/Login.tsx` (email + Google + modal recuperación)
- [x] Crear `pages/Register.tsx`
- [x] Crear `pages/Dashboard.tsx` (perfil + módulos + reproductor modal)

### Fase 5 — Routing y Estilos
- [x] Crear `styles/globals.css` (unificar todos los CSS)
- [x] Configurar `App.tsx` con react-router-dom
- [x] Ajustar `main.tsx`

### Fase 6 — Validación ✅
- [x] `npx tsc --noEmit` → 0 errores
- [x] `npm run build` → build exitoso (45 módulos, 368 KB JS, 11 KB CSS)
- [x] `npm run dev` → servidor en http://localhost:5173/

---

## 📝 Notas Importantes

- El proyecto NO usa Firestore; toda la data de módulos va a `localStorage`
- Los archivos de audio se sirven desde `/audio/` (public folder de Vite)
- Los `window.handleLike`, `window.handleDislike`, etc. serán reemplazados por props/callbacks en React
- Los `innerHTML` dinámicos serán reemplazados por JSX reactivo con estado
- La lógica de `body.style.display = 'none'` se manejará con `ProtectedRoute` y un estado de carga
- La carpeta del nuevo proyecto será `ornhub-react/` dentro de la carpeta actual del proyecto

---

## 🚀 Fase 7 — Limpieza y Despliegue (En progreso)

### Limpieza
- [x] Eliminar carpeta `version_anterior/` que contenía el código Vanilla JS, ya que todo se migró a `ornhub-react/`.
- [x] Asegurarnos de que el `.gitignore` de `ornhub-react/` esté correcto antes del push.

### Subida a GitHub
- [ ] Inicializar Git en la carpeta raíz `ornhub-react/`.
- [ ] Hacer el primer commit con el proyecto finalizado.
- [ ] Subir el repositorio a GitHub.

### Despliegue (Deploy) en Netlify
- [ ] Conectar el repositorio de GitHub a Netlify.
- [ ] Configurar el comando de build (`npm run build`) y el directorio de publicación (`dist/`).
- [ ] Verificar que la aplicación en vivo funcione correctamente.
