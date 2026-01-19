// ============ AUTH ============
export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  cedula?: string;
  telefono?: string;
  direccion?: string;
  foto?: string;
  status: 'activo' | 'inactivo' | 'suspendido';
  email_verified_at?: string;
  id_rol: number;
  rol?: Rol;
  // Campos para instructores
  especialidad?: string;
  certificaciones?: string;
  // Campos para tutores
  parentesco?: string;
  nombre_completo?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  password_confirmation: string;
  cedula?: string;
  telefono?: string;
  id_rol?: number;
}

export interface AuthResponse {
  user: Usuario;
  token: string;
  message?: string;
}

// ============ ROLES ============
export interface Rol {
  id_rol: number;
  nombre: string;
  slug?: string;
  descripcion?: string;
  activo?: boolean;
}

// ============ DEPORTISTAS ============
export interface Deportista {
  id_deportista: number;
  nombres: string;
  apellidos: string;
  cedula?: string;
  fecha_nacimiento: string;
  genero: 'M' | 'F';
  direccion?: string;
  telefono?: string;
  email?: string;
  foto?: string;
  peso?: number;
  altura?: number;
  tipo_sangre?: string;
  alergias?: string;
  enfermedades?: string;
  estado: 'activo' | 'inactivo';
  id_categoria?: number;
  categoria?: Categoria;
  tutores?: Usuario[]; // Usuarios con rol tutor
  nombre_completo?: string;
  edad?: number;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  edad_minima?: number;
  edad_maxima?: number;
  descripcion?: string;
}

export interface DeportistaFormData {
  nombres: string;
  apellidos: string;
  cedula?: string;
  fecha_nacimiento: string;
  genero: 'M' | 'F';
  direccion?: string;
  telefono?: string;
  email?: string;
  peso?: number;
  altura?: number;
  tipo_sangre?: string;
  alergias?: string;
  enfermedades?: string;
  id_categoria?: number;
}

// ============ CURSOS VACACIONALES ============
export interface Curso {
  id_curso: number;
  nombre: string;
  slug?: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  representante?: string;
  email_representante?: string;
  telefono_representante?: string;
  tipo: 'vacacional' | 'permanente';
  estado: 'abierto' | 'cerrado' | 'en_proceso' | 'cancelado';
  cupo_maximo?: number;
  cupo_actual?: number;
  precio?: number;
  imagen?: string;
  grupos?: GrupoCurso[];
  inscritos_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CursoFormData {
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  representante: string;
  email_representante?: string;
  telefono_representante?: string;
  tipo: 'vacacional' | 'permanente';
  cupo_maximo?: number;
  precio?: number;
  imagen?: File;
}

export interface GrupoCurso {
  id_grupo: number;
  id_curso: number;
  nombre: string;
  cupo_maximo: number;
  cupo_actual: number;
  hora_inicio?: string;
  hora_fin?: string;
  dias_semana?: string[] | number[];
  dias_semana_nombres?: string;
  estado: 'activo' | 'inactivo' | 'completo' | 'cancelado';
  cupos_disponibles?: number;
  curso?: Curso;
  id_instructor?: number;
  instructor?: Usuario; // Usuario con rol instructor
  inscripciones?: InscripcionCurso[];
}

export interface GrupoCursoFormData {
  id_curso: number;
  nombre: string;
  cupo_maximo: number;
  hora_inicio: string;
  hora_fin: string;
  dias_semana: string[] | number[];
  id_instructor?: number;
  estado?: string;
}

export interface InscripcionCurso {
  id_inscripcion: number;
  id_curso: number;
  id_grupo: number;
  id_usuario: number;
  id_deportista: number;
  fecha_inscripcion: string;
  observaciones?: string;
  estado: 'activa' | 'completada' | 'cancelada' | 'abandonada';
  calificacion?: number;
  calificacion_final?: number;
  comentarios?: string;
  curso?: Curso;
  grupo?: GrupoCurso;
  usuario?: Usuario;
  deportista?: Deportista;
  factura?: Factura;
}

export interface InscripcionFormData {
  id_curso: number;
  id_grupo: number;
  id_deportista: number;
  observaciones?: string;
  generar_factura?: boolean;
}

// ============ FINANZAS ============
export interface Factura {
  id_factura: number;
  numero_factura: string;
  id_deportista: number;
  id_tutor?: number; // id_usuario del tutor
  id_inscripcion?: number;
  usuario_id?: number;
  concepto: string;
  subtotal: number;
  descuento?: number;
  impuesto?: number;
  total: number;
  saldo_pendiente?: number;
  total_pagado?: number;
  estado: 'pendiente' | 'pagada' | 'cancelada' | 'vencida';
  fecha_emision: string;
  fecha_vencimiento?: string;
  metodo_pago?: string;
  observaciones?: string;
  deportista?: Deportista;
  tutor?: Usuario; // Usuario con rol tutor
  inscripcion?: InscripcionCurso;
  usuario?: Usuario;
  detalles?: DetalleFactura[];
  pagos?: Pago[];
}

export interface DetalleFactura {
  id_detalle?: number;
  id_factura: number;
  concepto: string;
  descripcion?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  descuento?: number;
  monto: number;
}

export interface FacturaFormData {
  id_deportista: number;
  id_tutor?: number;
  id_inscripcion?: number;
  concepto: string;
  fecha_emision: string;
  fecha_vencimiento?: string;
  descuento?: number;
  impuesto?: number;
  metodo_pago?: string;
  observaciones?: string;
  detalles: {
    concepto: string;
    descripcion?: string;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
  }[];
}

export interface Pago {
  id_pago: number;
  id_factura: number;
  numero_pago?: string;
  monto: number;
  fecha_pago: string;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque' | 'otro';
  referencia?: string;
  comprobante?: string;
  estado: 'pendiente' | 'verificado' | 'rechazado';
  observaciones?: string;
  factura?: Factura;
}

export interface PagoFormData {
  monto: number;
  fecha_pago: string;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque' | 'otro';
  referencia?: string;
  observaciones?: string;
}

// ============ SISTEMA ============
export interface Configuracion {
  id_configuracion: number;
  clave: string;
  valor: string;
  grupo?: string;
  descripcion?: string;
}

// ============ PAGINACIÓN ============
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginationParams {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Alias
export type Inscripcion = InscripcionCurso;

// Instructor es un Usuario con rol instructor
export type Instructor = Usuario;

// ============ ASISTENCIAS ============
export interface Asistencia {
  id_asistencia?: number;
  id_grupo: number;
  id_deportista: number;
  id_instructor?: number;
  fecha: string;
  estado: 'presente' | 'ausente' | 'tardanza' | 'justificado' | 'sin_registrar';
  observaciones?: string;
  deportista?: Deportista;
  grupo?: GrupoCurso;
}

export interface AsistenciaListItem {
  id_deportista: number;
  deportista: {
    id_deportista: number;
    nombres: string;
    apellidos: string;
    cedula?: string;
  };
  id_asistencia?: number;
  estado: 'presente' | 'ausente' | 'tardanza' | 'justificado' | 'sin_registrar';
  observaciones?: string;
}

export interface AsistenciaResponse {
  grupo: {
    id_grupo: number;
    nombre: string;
    curso: string;
    horario: string;
    dias: string;
  };
  fecha: string;
  fecha_formato: string;
  total_inscritos: number;
  presentes: number;
  ausentes: number;
  lista: AsistenciaListItem[];
}

export interface AsistenciaFormData {
  id_deportista: number;
  estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
  observaciones?: string;
}
