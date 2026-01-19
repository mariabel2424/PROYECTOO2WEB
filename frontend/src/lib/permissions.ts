/**
 * Sistema de Permisos para Cursos Vacacionales
 *
 * Roles:
 * - administrador: Acceso total al sistema
 * - tutor: Padre/madre que gestiona sus hijos e inscripciones
 * - instructor: Profesor que ve sus grupos y califica participantes
 */

export type RoleSlug = 'administrador' | 'tutor' | 'instructor';

export interface Permission {
  module: string;
  actions: ('view' | 'create' | 'edit' | 'delete')[];
}

// Definición de permisos por rol
export const ROLE_PERMISSIONS: Record<RoleSlug, Permission[]> = {
  administrador: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'cursos', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'grupos', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'inscripciones', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'deportistas', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'categorias', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'instructores', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'tutores', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'facturas', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'pagos', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'usuarios', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'roles', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'configuracion', actions: ['view', 'edit'] },
  ],
  tutor: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'cursos', actions: ['view'] },
    { module: 'grupos', actions: ['view'] },
    {
      module: 'mis-participantes',
      actions: ['view', 'create', 'edit', 'delete'],
    },
    { module: 'mis-inscripciones', actions: ['view', 'create'] },
    { module: 'mis-facturas', actions: ['view'] },
    { module: 'mis-pagos', actions: ['view', 'create'] },
    { module: 'categorias', actions: ['view'] },
  ],
  instructor: [
    { module: 'dashboard', actions: ['view'] },
    { module: 'cursos', actions: ['view'] },
    { module: 'grupos', actions: ['view'] },
    { module: 'mis-grupos', actions: ['view'] },
    { module: 'inscripciones', actions: ['view', 'edit'] }, // Para calificar
    { module: 'deportistas', actions: ['view'] },
    { module: 'categorias', actions: ['view'] },
  ],
};

// Rutas permitidas por rol
export const ALLOWED_ROUTES: Record<RoleSlug, string[]> = {
  administrador: [
    '/dashboard',
    '/cursos',
    '/cursos/grupos',
    '/cursos/inscripciones',
    '/deportistas',
    '/deportistas/categorias',
    '/instructores',
    '/tutores',
    '/finanzas',
    '/finanzas/facturas',
    '/finanzas/pagos',
    '/sistema',
    '/sistema/usuarios',
    '/sistema/roles',
    '/sistema/configuracion',
  ],
  tutor: [
    '/dashboard',
    '/mis-participantes',
    '/inscribir',
    '/mis-inscripciones',
    '/mis-facturas',
    '/mis-pagos',
    '/cursos', // Solo ver cursos disponibles
  ],
  instructor: ['/dashboard', '/mis-grupos', '/cursos', '/cursos/grupos'],
};

/**
 * Verifica si un rol tiene permiso para una acción en un módulo
 */
export function hasPermission(
  roleSlug: string | undefined,
  module: string,
  action: 'view' | 'create' | 'edit' | 'delete' = 'view'
): boolean {
  if (!roleSlug) return false;

  // Admin tiene todos los permisos
  if (roleSlug === 'administrador') return true;

  const permissions = ROLE_PERMISSIONS[roleSlug as RoleSlug];
  if (!permissions) return false;

  const modulePermission = permissions.find((p) => p.module === module);
  if (!modulePermission) return false;

  return modulePermission.actions.includes(action);
}

/**
 * Verifica si un rol puede acceder a una ruta
 */
export function canAccessRoute(
  roleSlug: string | undefined,
  pathname: string
): boolean {
  if (!roleSlug) return false;

  // Admin puede acceder a todo
  if (roleSlug === 'administrador') return true;

  const allowedRoutes = ALLOWED_ROUTES[roleSlug as RoleSlug];
  if (!allowedRoutes) return false;

  // Verificar si la ruta está permitida (incluyendo subrutas)
  return allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Obtiene la ruta de redirección según el rol
 */
export function getDefaultRoute(roleSlug: string | undefined): string {
  switch (roleSlug) {
    case 'administrador':
      return '/dashboard';
    case 'tutor':
      return '/dashboard';
    case 'instructor':
      return '/dashboard';
    default:
      return '/login';
  }
}

/**
 * Verifica si el usuario es administrador
 */
export function isAdmin(roleSlug: string | undefined): boolean {
  return roleSlug === 'administrador';
}

/**
 * Verifica si el usuario es tutor
 */
export function isTutor(roleSlug: string | undefined): boolean {
  return roleSlug === 'tutor';
}

/**
 * Verifica si el usuario es instructor
 */
export function isInstructor(roleSlug: string | undefined): boolean {
  return roleSlug === 'instructor';
}
