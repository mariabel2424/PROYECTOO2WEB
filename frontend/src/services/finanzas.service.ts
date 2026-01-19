import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type {
  Factura,
  FacturaFormData,
  Pago,
  PagoFormData,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const facturasService = {
  async getAll(
    params?: PaginationParams & {
      estado?: string;
      id_deportista?: number;
      id_tutor?: number;
    }
  ): Promise<PaginatedResponse<Factura>> {
    const { data } = await apiClient.get<
      | PaginatedResponse<Factura>
      | Factura[]
      | { success: boolean; data: PaginatedResponse<Factura>; message: string }
    >(API_ENDPOINTS.facturas, params);

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
    return data as PaginatedResponse<Factura>;
  },

  async getById(id: number): Promise<Factura> {
    const { data } = await apiClient.get<Factura>(
      `${API_ENDPOINTS.facturas}/${id}`
    );
    return data;
  },

  async create(
    factura: FacturaFormData
  ): Promise<{ message: string; data: Factura }> {
    const { data } = await apiClient.post<{ message: string; data: Factura }>(
      API_ENDPOINTS.facturas,
      factura
    );
    return data;
  },

  async update(
    id: number,
    factura: Partial<FacturaFormData>
  ): Promise<{ message: string; data: Factura }> {
    const { data } = await apiClient.put<{ message: string; data: Factura }>(
      `${API_ENDPOINTS.facturas}/${id}`,
      factura
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.facturas}/${id}`);
  },

  async cambiarEstado(
    id: number,
    estado: 'pendiente' | 'pagada' | 'vencida' | 'cancelada'
  ): Promise<{ message: string; data: Factura }> {
    const { data } = await apiClient.put<{ message: string; data: Factura }>(
      `${API_ENDPOINTS.facturas}/${id}`,
      { estado }
    );
    return data;
  },

  async registrarPago(
    facturaId: number,
    pago: PagoFormData
  ): Promise<{ message: string; data: Pago }> {
    const { data } = await apiClient.post<{ message: string; data: Pago }>(
      `${API_ENDPOINTS.facturas}/${facturaId}/registrar-pago`,
      pago
    );
    return data;
  },

  // Generar factura desde una inscripción existente
  async generarDesdeInscripcion(
    inscripcionId: number,
    idTutor?: number
  ): Promise<{ message: string; data: Factura }> {
    const { data } = await apiClient.post<{ message: string; data: Factura }>(
      `${API_ENDPOINTS.facturas}/generar-desde-inscripcion/${inscripcionId}`,
      { id_tutor: idTutor }
    );
    return data;
  },

  // Obtener facturas de un tutor específico
  async getFacturasPorTutor(tutorId: number): Promise<Factura[]> {
    const { data } = await apiClient.get<Factura[]>(
      `${API_ENDPOINTS.facturas}/tutor/${tutorId}`
    );
    return data;
  },

  async getReporteFacturacion(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<unknown> {
    const { data } = await apiClient.get(
      `${API_ENDPOINTS.facturas}/reporte/facturacion`,
      params
    );
    return data;
  },

  async getDatosParaPdf(
    id: number
  ): Promise<{
    factura: Factura;
    empresa: {
      nombre: string;
      direccion: string;
      telefono: string;
      email: string;
      ruc: string;
    };
  }> {
    const { data } = await apiClient.get<{
      factura: Factura;
      empresa: {
        nombre: string;
        direccion: string;
        telefono: string;
        email: string;
        ruc: string;
      };
    }>(`${API_ENDPOINTS.facturas}/${id}/pdf`);
    return data;
  },
};

export const pagosService = {
  async getAll(
    params?: PaginationParams & {
      estado?: string;
      id_factura?: number;
    }
  ): Promise<PaginatedResponse<Pago>> {
    const { data } = await apiClient.get<
      | PaginatedResponse<Pago>
      | Pago[]
      | { success: boolean; data: PaginatedResponse<Pago>; message: string }
    >(API_ENDPOINTS.pagos, params);

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
    return data as PaginatedResponse<Pago>;
  },

  async getById(id: number): Promise<Pago> {
    const { data } = await apiClient.get<Pago>(`${API_ENDPOINTS.pagos}/${id}`);
    return data;
  },

  async update(
    id: number,
    pago: Partial<PagoFormData>
  ): Promise<{ message: string; data: Pago }> {
    const { data } = await apiClient.put<{ message: string; data: Pago }>(
      `${API_ENDPOINTS.pagos}/${id}`,
      pago
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.pagos}/${id}`);
  },

  async verificar(id: number): Promise<{ message: string; data: Pago }> {
    const { data } = await apiClient.post<{ message: string; data: Pago }>(
      `${API_ENDPOINTS.pagos}/${id}/verificar`
    );
    return data;
  },

  async rechazar(
    id: number,
    motivo?: string
  ): Promise<{ message: string; data: Pago }> {
    const { data } = await apiClient.post<{ message: string; data: Pago }>(
      `${API_ENDPOINTS.pagos}/${id}/rechazar`,
      { motivo }
    );
    return data;
  },
};

// Servicio combinado para flujo de inscripción de tutores
export const finanzasService = {
  // Inscribir con generación de factura
  async inscribirConPago(params: {
    id_deportista: number;
    id_curso: number;
    id_grupo: number;
    generar_factura?: boolean;
  }): Promise<{
    message: string;
    data: unknown;
    factura?: { id_factura: number };
  }> {
    const { data } = await apiClient.post<{
      message: string;
      data: unknown;
      factura?: { id_factura: number };
    }>('/inscripciones-curso', {
      ...params,
      generar_factura: params.generar_factura ?? true,
    });
    return data;
  },

  // Realizar pago como tutor (pendiente de verificación)
  async realizarMiPago(params: {
    id_factura: number;
    monto: number;
    metodo_pago: string;
    referencia?: string;
    observaciones?: string;
  }): Promise<{ message: string; data: Pago }> {
    const { data } = await apiClient.post<{ message: string; data: Pago }>(
      '/mis-pagos',
      params
    );
    return data;
  },

  // Obtener mis pagos (tutor)
  async getMisPagos(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Pago>> {
    const { data } = await apiClient.get<PaginatedResponse<Pago>>(
      '/mis-pagos',
      params
    );
    return data;
  },

  // Obtener mis facturas (tutor)
  async getMisFacturas(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Factura>> {
    const { data } = await apiClient.get<PaginatedResponse<Factura>>(
      '/mis-facturas',
      params
    );
    return data;
  },
};
