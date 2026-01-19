// Auth
export { authService } from './auth.service';

// Dashboard
export { dashboardService } from './dashboard.service';

// Cursos Vacacionales
export {
  cursosService,
  gruposCursoService,
  inscripcionesService,
  asistenciasService,
} from './cursos.service';

// Deportistas
export { deportistasService } from './deportistas.service';
export { categoriasService } from './categorias.service';

// Finanzas
export {
  facturasService,
  pagosService,
  finanzasService,
} from './finanzas.service';

// Sistema (Usuarios incluye tutores e instructores por rol)
export {
  usuariosService,
  rolesService,
  permisosService,
  instructoresService,
} from './usuarios.service';
export { configuracionesService } from './sistema.service';
