// src/utils/errorMapper.ts

export const mapearError = (code: string): string => {
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no es válido.';
    case 'auth/user-not-found':
      return 'No existe una cuenta con ese correo.';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta.';
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil (mínimo 6 caracteres).';
    case 'auth/cancelled-popup-request':
      return 'Cerraste la ventana de Google antes de completar.';
    case 'auth/network-request-failed':
      return 'Error de red. Verifica tu conexión.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos.';
    default:
      return 'Ocurrió un error inesperado al autenticar.';
  }
};
