import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type {
  Curso,
  CursoFormData,
  GrupoCurso,
  GrupoCursoFormData,
  InscripcionCurso,
  InscripcionFormData,
  PaginatedResponse,
  PaginationParams,
  Instructor,
} from '@/types';

// ============ CURSOS ============
export const cursosService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Curso>> {
    const { data } = await apiClient.get<
      | PaginatedResponse<Curso>
      | Curso[]
      | { success: boolean; data: PaginatedResponse<Curso>; message: string }
    >(API_ENDPOINTS.cursos, params);

    // Manejar respuesta envuelta en { success, data, message }
    if (data && typeof data === 'object' && 'success' in data && data.data) {
      const innerData = data.data;
      if (Array.isArray(innerData)) {
        return {
          data: innerData,
          total: innerData.length,
          current_page: 1,
          last_page: 1,
          per_page: innerData.length,
          from: 1,
          to: innerData.length,
        };
      }
      return innerData;
    }

    // Manejar respuesta paginada directa de Laravel (tiene current_page y data)
    if (
      data &&
      typeof data === 'object' &&
      'current_page' in data &&
      'data' in data
    ) {
      const paginatedData = data as PaginatedResponse<Curso>;
      return {
        data: Array.isArray(paginatedData.data) ? paginatedData.data : [],
        total: paginatedData.total || 0,
        current_page: paginatedData.current_page || 1,
        last_page: paginatedData.last_page || 1,
        per_page: paginatedData.per_page || 15,
        from: paginatedData.from || 0,
        to: paginatedData.to || 0,
      };
    }

    // Manejar array directo
    if (Array.isArray(data)) {
      return {
        data,
        total: data.length,
        current_page: 1,
        last_page: 1,
        per_page: data.length,
        from: 1,
        to: data.length,
      };
    }

    // Fallback: retornar estructura vacía
    return {
      data: [],
      total: 0,
      current_page: 1,
      last_page: 1,
      per_page: 15,
      from: 0,
      to: 0,
    };
  },

  async getById(id: number): Promise<Curso> {
    const { data } = await apiClient.get<Curso>(
      `${API_ENDPOINTS.cursos}/${id}`
    );
    return data;
  },

  async create(
    curso: CursoFormData | FormData
  ): Promise<{ message: string; data: Curso }> {
    const { data } = await apiClient.post<{ message: string; data: Curso }>(
      API_ENDPOINTS.cursos,
      curso
    );
    return data;
  },

  async update(
    id: number,
    curso: Partial<CursoFormData> | FormData
  ): Promise<{ message: string; data: Curso }> {
    const { data } = await apiClient.put<{ message: string; data: Curso }>(
      `${API_ENDPOINTS.cursos}/${id}`,
      curso
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.cursos}/${id}`);
  },

  async getCursosAbiertos(): Promise<Curso[]> {
    const { data } = await apiClient.get<Curso[]>(API_ENDPOINTS.cursosAbiertos);
    return data;
  },

  async getParticipantes(cursoId: number): Promise<InscripcionCurso[]> {
    const { data } = await apiClient.get<InscripcionCurso[]>(
      `${API_ENDPOINTS.cursos}/${cursoId}/participantes`
    );
    return data;
  },

  async getGruposDisponibles(
    cursoId: number
  ): Promise<{ curso_id: number; total_grupos: number; grupos: GrupoCurso[] }> {
    const { data } = await apiClient.get<{
      curso_id: number;
      total_grupos: number;
      grupos: GrupoCurso[];
    }>(`${API_ENDPOINTS.cursos}/${cursoId}/grupos-disponibles`);
    return data;
  },

  // Obtener grupos públicos (sin autenticación, para landing page)
  async getGruposPublico(cursoId: number): Promise<GrupoCurso[]> {
    const { data } = await apiClient.get<GrupoCurso[]>(
      `${API_ENDPOINTS.cursos}/${cursoId}/grupos-publico`
    );
    return data;
  },
};

// ============ GRUPOS DE CURSO ============
export const gruposCursoService = {
  async getAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<GrupoCurso>> {
    const { data } = await apiClient.get<
      | PaginatedResponse<GrupoCurso>
      | GrupoCurso[]
      | {
          success: boolean;
          data: PaginatedResponse<GrupoCurso>;
          message: string;
        }
    >(API_ENDPOINTS.gruposCurso, params);

    // Manejar respuesta envuelta en { success, data, message }
    if (data && typeof data === 'object' && 'success' in data && data.data) {
      const innerData = data.data;
      if (Array.isArray(innerData)) {
        return {
          data: innerData,
          total: innerData.length,
          current_page: 1,
          last_page: 1,
          per_page: innerData.length,
          from: 1,
          to: innerData.length,
        };
      }
      return innerData;
    }

    // Manejar respuesta paginada directa o array directo
    if (Array.isArray(data)) {
      return {
        data,
        total: data.length,
        current_page: 1,
        last_page: 1,
        per_page: data.length,
        from: 1,
        to: data.length,
      };
    }
    return data as PaginatedResponse<GrupoCurso>;
  },

  async getById(id: number): Promise<GrupoCurso> {
    const { data } = await apiClient.get<GrupoCurso>(
      `${API_ENDPOINTS.gruposCurso}/${id}`
    );
    return data;
  },

  async create(
    grupo: GrupoCursoFormData
  ): Promise<{ message: string; data: GrupoCurso }> {
    const { data } = await apiClient.post<{
      message: string;
      data: GrupoCurso;
    }>(API_ENDPOINTS.gruposCurso, grupo);
    return data;
  },

  async update(
    id: number,
    grupo: Partial<GrupoCursoFormData>
  ): Promise<{ message: string; data: GrupoCurso }> {
    const { data } = await apiClient.put<{ message: string; data: GrupoCurso }>(
      `${API_ENDPOINTS.gruposCurso}/${id}`,
      grupo
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.gruposCurso}/${id}`);
  },

  async getDeportistas(grupoId: number): Promise<{
    grupo: string;
    curso: string;
    cupo_actual: number;
    cupo_maximo: number;
    cupos_disponibles: number;
    total_deportistas: number;
    deportistas: InscripcionCurso[];
  }> {
    const { data } = await apiClient.get<{
      grupo: string;
      curso: string;
      cupo_actual: number;
      cupo_maximo: number;
      cupos_disponibles: number;
      total_deportistas: number;
      deportistas: InscripcionCurso[];
    }>(`${API_ENDPOINTS.gruposCurso}/${grupoId}/deportistas`);
    return data;
  },

  async asignarInstructor(
    grupoId: number,
    instructorId: number
  ): Promise<{ message: string; data: GrupoCurso }> {
    const { data } = await apiClient.post<{
      message: string;
      data: GrupoCurso;
    }>(`${API_ENDPOINTS.gruposCurso}/${grupoId}/asignar-instructor`, {
      id_instructor: instructorId,
    });
    return data;
  },

  async quitarInstructor(
    grupoId: number,
    instructorId: number
  ): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      `${API_ENDPOINTS.gruposCurso}/${grupoId}/quitar-instructor`,
      { id_instructor: instructorId }
    );
    return data;
  },

  async getInstructores(grupoId: number): Promise<{
    grupo: string;
    total_instructores: number;
    instructores: Instructor[];
  }> {
    const { data } = await apiClient.get<{
      grupo: string;
      total_instructores: number;
      instructores: Instructor[];
    }>(`${API_ENDPOINTS.gruposCurso}/${grupoId}/instructores`);
    return data;
  },

  async cambiarEstado(
    grupoId: number,
    estado: string
  ): Promise<{ message: string; estado: string; data: GrupoCurso }> {
    const { data } = await apiClient.patch<{
      message: string;
      estado: string;
      data: GrupoCurso;
    }>(`${API_ENDPOINTS.gruposCurso}/${grupoId}/cambiar-estado`, { estado });
    return data;
  },
};

// ============ INSCRIPCIONES ============
export const inscripcionesService = {
  async getAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<InscripcionCurso>> {
    const { data } = await apiClient.get<
      | PaginatedResponse<InscripcionCurso>
      | InscripcionCurso[]
      | {
          success: boolean;
          data: PaginatedResponse<InscripcionCurso>;
          message: string;
        }
    >(API_ENDPOINTS.inscripcionesCurso, params);

    // Manejar respuesta envuelta en { success, data, message }
    if (data && typeof data === 'object' && 'success' in data && data.data) {
      const innerData = data.data;
      if (Array.isArray(innerData)) {
        return {
          data: innerData,
          total: innerData.length,
          current_page: 1,
          last_page: 1,
          per_page: innerData.length,
          from: 1,
          to: innerData.length,
        };
      }
      return innerData;
    }

    // Manejar respuesta paginada directa o array directo
    if (Array.isArray(data)) {
      return {
        data,
        total: data.length,
        current_page: 1,
        last_page: 1,
        per_page: data.length,
        from: 1,
        to: data.length,
      };
    }
    return data as PaginatedResponse<InscripcionCurso>;
  },

  async getById(id: number): Promise<InscripcionCurso> {
    const { data } = await apiClient.get<InscripcionCurso>(
      `${API_ENDPOINTS.inscripcionesCurso}/${id}`
    );
    return data;
  },

  async create(
    inscripcion: InscripcionFormData
  ): Promise<{ message: string; data: InscripcionCurso }> {
    const { data } = await apiClient.post<{
      message: string;
      data: InscripcionCurso;
    }>(API_ENDPOINTS.inscripcionesCurso, inscripcion);
    return data;
  },

  async update(
    id: number,
    inscripcion: Partial<InscripcionCurso>
  ): Promise<{ message: string; data: InscripcionCurso }> {
    const { data } = await apiClient.put<{
      message: string;
      data: InscripcionCurso;
    }>(`${API_ENDPOINTS.inscripcionesCurso}/${id}`, inscripcion);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.inscripcionesCurso}/${id}`);
  },

  async calificar(
    id: number,
    calificacion: number,
    comentarios?: string
  ): Promise<{ message: string; data: InscripcionCurso }> {
    const { data } = await apiClient.post<{
      message: string;
      data: InscripcionCurso;
    }>(`${API_ENDPOINTS.inscripcionesCurso}/${id}/calificar`, {
      calificacion,
      comentarios,
    });
    return data;
  },

  async cancelar(
    id: number,
    motivo?: string
  ): Promise<{ message: string; data: InscripcionCurso }> {
    const { data } = await apiClient.patch<{
      message: string;
      data: InscripcionCurso;
    }>(`${API_ENDPOINTS.inscripcionesCurso}/${id}/cancelar`, { motivo });
    return data;
  },

  async generarFactura(
    id: number,
    idTutor?: number
  ): Promise<{ message: string; data: unknown }> {
    const { data } = await apiClient.post<{
      message: string;
      data: unknown;
    }>(`${API_ENDPOINTS.inscripcionesCurso}/${id}/generar-factura`, {
      id_tutor: idTutor,
    });
    return data;
  },

  // Mis inscripciones (para tutores)
  async getMisInscripciones(
    params?: PaginationParams
  ): Promise<PaginatedResponse<InscripcionCurso>> {
    const { data } = await apiClient.get<
      PaginatedResponse<InscripcionCurso> | InscripcionCurso[]
    >('/mis-inscripciones', params);

    if (Array.isArray(data)) {
      return {
        data,
        total: data.length,
        current_page: 1,
        last_page: 1,
        per_page: data.length,
        from: 1,
        to: data.length,
      };
    }
    return data;
  },
};

// ============ ASISTENCIAS ============
export interface AsistenciaEstudiante {
  id_inscripcion: number;
  id_deportista: number;
  deportista: {
    id_deportista: number;
    nombres: string;
    apellidos: string;
    cedula?: string;
  };
  asistencia: {
    id_asistencia: number;
    estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
    observaciones?: string;
  } | null;
}

export interface AsistenciaGrupoResponse {
  grupo: {
    id_grupo: number;
    nombre: string;
    curso: string;
    horario: string;
  };
  fecha: string;
  fecha_formato: string;
  total_estudiantes: number;
  presentes: number;
  ausentes: number;
  estudiantes: AsistenciaEstudiante[];
}

export interface AsistenciaRegistro {
  id_inscripcion: number;
  id_deportista: number;
  estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
  observaciones?: string;
}

export interface ReporteAsistencia {
  titulo: string;
  grupo: string;
  curso: string;
  instructor: string;
  fecha: string;
  horario: string;
  generado_en: string;
  generado_por: string;
  resumen: {
    total_estudiantes: number;
    presentes: number;
    ausentes: number;
    tardanzas: number;
    justificados: number;
    sin_registrar: number;
  };
  estudiantes: {
    nombre: string;
    cedula: string;
    estado: string;
    observaciones: string;
  }[];
}

export const asistenciasService = {
  async getAsistencias(
    grupoId: number,
    fecha?: string
  ): Promise<AsistenciaGrupoResponse> {
    const params = fecha ? { fecha } : {};
    const { data } = await apiClient.get<AsistenciaGrupoResponse>(
      `${API_ENDPOINTS.gruposCurso}/${grupoId}/asistencias`,
      params
    );
    return data;
  },

  async registrarAsistencias(
    grupoId: number,
    fecha: string,
    asistencias: AsistenciaRegistro[]
  ): Promise<{ message: string; registradas: number; actualizadas: number }> {
    const { data } = await apiClient.post<{
      message: string;
      registradas: number;
      actualizadas: number;
    }>(`${API_ENDPOINTS.gruposCurso}/${grupoId}/asistencias`, {
      fecha,
      asistencias,
    });
    return data;
  },

  async getHistorial(
    grupoId: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<{
    grupo: string;
    curso: string;
    historial: {
      fecha: string;
      fecha_formato: string;
      total: number;
      presentes: number;
      ausentes: number;
      tardanzas: number;
      justificados: number;
    }[];
  }> {
    const params: Record<string, string> = {};
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;

    const { data } = await apiClient.get<{
      grupo: string;
      curso: string;
      historial: {
        fecha: string;
        fecha_formato: string;
        total: number;
        presentes: number;
        ausentes: number;
        tardanzas: number;
        justificados: number;
      }[];
    }>(`${API_ENDPOINTS.gruposCurso}/${grupoId}/asistencias/historial`, params);
    return data;
  },

  async getReporte(grupoId: number, fecha: string): Promise<ReporteAsistencia> {
    const { data } = await apiClient.get<ReporteAsistencia>(
      `${API_ENDPOINTS.gruposCurso}/${grupoId}/asistencias/reporte`,
      { fecha }
    );
    return data;
  },
};
