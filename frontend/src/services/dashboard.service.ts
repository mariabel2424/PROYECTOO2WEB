import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';

// Tipos específicos para el dashboard de Cursos Vacacionales
export interface EstadisticasCursosVacacionales {
  cursos: {
    total: number;
    abiertos: number;
    en_proceso: number;
    cerrados: number;
  };
  grupos: {
    total: number;
    activos: number;
    completos: number;
  };
  inscripciones: {
    total: number;
    activas: number;
    completadas: number;
    este_mes: number;
  };
  deportistas: {
    total: number;
    activos: number;
  };
  instructores: {
    total: number;
    activos: number;
  };
  tutores: {
    total: number;
  };
  facturacion: {
    total_mes: number;
    pendiente: number;
    pagadas_mes: number;
  };
}

export interface CursoActivo {
  id_curso: number;
  nombre: string;
  tipo: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  precio: number;
  cupo_maximo: number;
  cupo_actual: number;
  grupos_count: number;
  inscripciones_count: number;
  porcentaje_ocupacion: number;
}

export interface InscripcionReciente {
  id_inscripcion: number;
  fecha_inscripcion: string;
  estado: string;
  curso: string | null;
  grupo: string | null;
  deportista: string | null;
  registrado_por: string | null;
}

export interface FacturacionMensual {
  mes: number;
  total: number;
  pagado: number;
  pendiente: number;
  cantidad: number;
}

// Tipos para dashboard por rol
export interface MisDatosUsuario {
  usuario: {
    nombre: string;
    email: string;
    rol: string;
  };
}

export interface MisDatosTutor extends MisDatosUsuario {
  participantes: {
    total: number;
    activos: number;
    lista: { id: number; nombre: string; edad: number | null }[];
  };
  inscripciones: {
    total: number;
    activas: number;
    completadas: number;
  };
  facturas: {
    total: number;
    pendientes: number;
    monto_pendiente: number;
    pagadas: number;
  };
}

export interface MisDatosInstructor extends MisDatosUsuario {
  grupos: {
    total: number;
    activos: number;
    lista: {
      id: number;
      nombre: string;
      curso: string | null;
      participantes: number;
      cupo_maximo: number;
    }[];
  };
  participantes_total: number;
}

export type MisDatosResponse =
  | MisDatosUsuario
  | MisDatosTutor
  | MisDatosInstructor;

export interface ParticipanteDashboard {
  id: number;
  nombre: string;
  edad: number | null;
  categoria: string | null;
  estado: string;
  tutor: string | null;
}

// Tipos para reportes
export interface ReporteCurso {
  id: number;
  nombre: string;
  tipo: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  precio: number;
  cupo_maximo: number;
  cupo_actual: number;
  grupos_count: number;
  inscripciones_count: number;
}

export interface ReporteCursosResponse {
  cursos: ReporteCurso[];
  resumen: {
    total_cursos: number;
    cursos_abiertos: number;
    cursos_en_proceso: number;
    cursos_cerrados: number;
    total_inscripciones: number;
    total_grupos: number;
  };
}

export interface ReporteFactura {
  id: number;
  numero: string;
  cliente: string;
  concepto: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  estado: string;
  fecha_emision: string;
  fecha_vencimiento: string;
}

export interface ReporteFinanzasResponse {
  facturas: ReporteFactura[];
  resumen: {
    total_facturas: number;
    total_facturado: number;
    total_pagado: number;
    total_pendiente: number;
    facturas_pagadas: number;
    facturas_pendientes: number;
  };
}

export interface ReporteParticipante {
  id: number;
  nombre: string;
  cedula: string | null;
  edad: number | null;
  genero: string | null;
  categoria: string | null;
  estado: string;
  tutor: string | null;
  inscripciones_activas: number;
  fecha_registro: string;
}

export interface ReporteParticipantesResponse {
  participantes: ReporteParticipante[];
  resumen: {
    total_participantes: number;
    participantes_activos: number;
    participantes_inactivos: number;
    con_inscripciones: number;
  };
}

export interface FiltroFechas {
  fecha_desde?: string;
  fecha_hasta?: string;
}

export const dashboardService = {
  async getEstadisticas(): Promise<EstadisticasCursosVacacionales> {
    const { data } = await apiClient.get<EstadisticasCursosVacacionales>(
      API_ENDPOINTS.dashboard.estadisticas
    );
    return data;
  },

  async getCursosActivos(): Promise<CursoActivo[]> {
    const { data } = await apiClient.get<CursoActivo[]>(
      API_ENDPOINTS.dashboard.cursosActivos
    );
    return data;
  },

  async getInscripcionesRecientes(): Promise<InscripcionReciente[]> {
    const { data } = await apiClient.get<InscripcionReciente[]>(
      API_ENDPOINTS.dashboard.inscripcionesRecientes
    );
    return data;
  },

  async getFacturacionMensual(): Promise<FacturacionMensual[]> {
    const { data } = await apiClient.get<FacturacionMensual[]>(
      API_ENDPOINTS.dashboard.facturacionMensual
    );
    return data;
  },

  async getMisDatos(): Promise<MisDatosResponse> {
    const { data } = await apiClient.get<MisDatosResponse>(
      API_ENDPOINTS.dashboard.misDatos
    );
    return data;
  },

  async getParticipantes(limit?: number): Promise<ParticipanteDashboard[]> {
    const { data } = await apiClient.get<ParticipanteDashboard[]>(
      API_ENDPOINTS.dashboard.participantes,
      { limit }
    );
    return data;
  },

  // Reportes con filtro de fechas
  async getReporteCursos(
    filtros?: FiltroFechas
  ): Promise<ReporteCursosResponse> {
    const { data } = await apiClient.get<ReporteCursosResponse>(
      '/dashboard/reporte/cursos',
      filtros
    );
    return data;
  },

  async getReporteFinanzas(
    filtros?: FiltroFechas
  ): Promise<ReporteFinanzasResponse> {
    const { data } = await apiClient.get<ReporteFinanzasResponse>(
      '/dashboard/reporte/finanzas',
      filtros
    );
    return data;
  },

  async getReporteParticipantes(
    filtros?: FiltroFechas
  ): Promise<ReporteParticipantesResponse> {
    const { data } = await apiClient.get<ReporteParticipantesResponse>(
      '/dashboard/reporte/participantes',
      filtros
    );
    return data;
  },
};
