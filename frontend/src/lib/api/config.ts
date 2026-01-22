// Configuración base de la API
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/register',
    logout: '/auth/logout',
    me: '/auth/me',
    cambiarPassword: '/auth/cambiar-password',
    verificarEmail: '/auth/verificar-email',
    enviarCodigo: '/auth/enviar-codigo',
    verificarCodigo: '/auth/verificar-codigo',
    solicitarReset: '/auth/solicitar-reset',
    verificarToken: '/auth/verificar-token',
  },
  // Dashboard - Cursos Vacacionales
  dashboard: {
    estadisticas: '/dashboard/estadisticas',
    cursosActivos: '/dashboard/cursos-activos',
    inscripcionesRecientes: '/dashboard/inscripciones-recientes',
    facturacionMensual: '/dashboard/facturacion-mensual',
    misDatos: '/dashboard/mis-datos',
    participantes: '/dashboard/participantes',
  },
  // Usuarios y Roles
  usuarios: '/usuarios',
  roles: '/rols',
  // Cursos Vacacionales
  cursos: '/cursos',
  cursosAbiertos: '/cursos-abiertos',
  gruposCurso: '/grupos-curso',
  gruposPublico: '/cursos', // Se usa como /cursos/{id}/grupos-publico
  inscripcionesCurso: '/inscripciones-curso',
  // Deportistas
  deportistas: '/deportistas',
  misParticipantes: '/mis-participantes',
  categorias: '/categorias',
  // Tutores e Instructores
  tutores: '/tutores',
  instructores: '/instructores',
  // Finanzas
  facturas: '/facturas',
  pagos: '/pagos',
  misPagos: '/mis-pagos',
  misFacturas: '/mis-facturas',
  misInscripciones: '/mis-inscripciones',
  // Sistema
  configuraciones: '/configuraciones',
} as const;
