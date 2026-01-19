'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Button, Spinner } from '@/components/ui';
import {
  asistenciasService,
  type AsistenciaEstudiante,
  type AsistenciaRegistro,
  type ReporteAsistencia,
} from '@/services/cursos.service';
import {
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function AsistenciaPage() {
  const params = useParams();
  const router = useRouter();
  const grupoId = Number(params.id);

  const [fecha, setFecha] = useState(() => {
    // Fecha actual en zona horaria de Ecuador (UTC-5)
    const now = new Date();
    const ecuadorOffset = -5 * 60;
    const localOffset = now.getTimezoneOffset();
    const ecuadorTime = new Date(
      now.getTime() + (localOffset + ecuadorOffset) * 60000
    );
    return ecuadorTime.toISOString().split('T')[0];
  });

  const [grupo, setGrupo] = useState<{
    id_grupo: number;
    nombre: string;
    curso: string;
    horario: string;
  } | null>(null);
  const [fechaFormato, setFechaFormato] = useState('');
  const [estudiantes, setEstudiantes] = useState<AsistenciaEstudiante[]>([]);
  const [asistencias, setAsistencias] = useState<
    Record<number, AsistenciaRegistro>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error';
    texto: string;
  } | null>(null);
  const [stats, setStats] = useState({ presentes: 0, ausentes: 0, total: 0 });

  const fetchAsistencias = async (fechaParam: string) => {
    setIsLoading(true);
    try {
      const data = await asistenciasService.getAsistencias(grupoId, fechaParam);
      setGrupo(data.grupo);
      setFechaFormato(data.fecha_formato || '');

      const estudiantesList = data.estudiantes || [];
      setEstudiantes(estudiantesList);
      setStats({
        presentes: data.presentes || 0,
        ausentes: data.ausentes || 0,
        total: data.total_estudiantes || estudiantesList.length,
      });

      // Inicializar estado de asistencias
      const asistenciasInit: Record<number, AsistenciaRegistro> = {};
      estudiantesList.forEach((est) => {
        asistenciasInit[est.id_deportista] = {
          id_inscripcion: est.id_inscripcion,
          id_deportista: est.id_deportista,
          estado: est.asistencia?.estado || 'presente',
          observaciones: est.asistencia?.observaciones || '',
        };
      });
      setAsistencias(asistenciasInit);
    } catch (error) {
      console.error('Error cargando asistencias:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar las asistencias' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (grupoId) {
      fetchAsistencias(fecha);
    }
  }, [grupoId, fecha]);

  const handleEstadoChange = (
    idDeportista: number,
    estado: 'presente' | 'ausente' | 'tardanza' | 'justificado'
  ) => {
    setAsistencias((prev) => ({
      ...prev,
      [idDeportista]: { ...prev[idDeportista], estado },
    }));
  };

  const handleObservacionChange = (
    idDeportista: number,
    observaciones: string
  ) => {
    setAsistencias((prev) => ({
      ...prev,
      [idDeportista]: { ...prev[idDeportista], observaciones },
    }));
  };

  const marcarTodos = (estado: 'presente' | 'ausente') => {
    setAsistencias((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        updated[Number(key)] = { ...updated[Number(key)], estado };
      });
      return updated;
    });
  };

  const handleGuardar = async () => {
    setIsSaving(true);
    setMensaje(null);
    try {
      const asistenciasArray = Object.values(asistencias);
      const result = await asistenciasService.registrarAsistencias(
        grupoId,
        fecha,
        asistenciasArray
      );
      setMensaje({ tipo: 'success', texto: result.message });
      // Recargar para actualizar stats
      fetchAsistencias(fecha);
    } catch (error) {
      console.error('Error guardando asistencias:', error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar las asistencias' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDescargarReporte = async () => {
    setIsDownloading(true);
    try {
      const reporte = await asistenciasService.getReporte(grupoId, fecha);
      generarPDF(reporte);
    } catch (error) {
      console.error('Error descargando reporte:', error);
      setMensaje({ tipo: 'error', texto: 'Error al generar el reporte' });
    } finally {
      setIsDownloading(false);
    }
  };

  const generarPDF = (reporte: ReporteAsistencia) => {
    // Crear contenido HTML para imprimir
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Asistencia - ${reporte.grupo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #333; font-size: 18px; }
          .info { margin-bottom: 20px; }
          .info p { margin: 5px 0; font-size: 12px; }
          .resumen { display: flex; gap: 20px; margin-bottom: 20px; }
          .resumen-item { padding: 10px; background: #f5f5f5; border-radius: 5px; text-align: center; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f0f0f0; }
          .presente { color: green; }
          .ausente { color: red; }
          .footer { margin-top: 20px; font-size: 10px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${reporte.titulo}</h1>
        <div class="info">
          <p><strong>Grupo:</strong> ${reporte.grupo}</p>
          <p><strong>Curso:</strong> ${reporte.curso}</p>
          <p><strong>Instructor:</strong> ${reporte.instructor}</p>
          <p><strong>Fecha:</strong> ${reporte.fecha}</p>
          <p><strong>Horario:</strong> ${reporte.horario}</p>
        </div>
        <div class="resumen">
          <div class="resumen-item"><strong>Total:</strong> ${
            reporte.resumen.total_estudiantes
          }</div>
          <div class="resumen-item"><strong>Presentes:</strong> ${
            reporte.resumen.presentes
          }</div>
          <div class="resumen-item"><strong>Ausentes:</strong> ${
            reporte.resumen.ausentes
          }</div>
          <div class="resumen-item"><strong>Tardanzas:</strong> ${
            reporte.resumen.tardanzas
          }</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Estado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${reporte.estudiantes
              .map(
                (est, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${est.nombre}</td>
                <td>${est.cedula}</td>
                <td class="${
                  est.estado.toLowerCase() === 'presente'
                    ? 'presente'
                    : est.estado.toLowerCase() === 'ausente'
                    ? 'ausente'
                    : ''
                }">${est.estado}</td>
                <td>${est.observaciones || '-'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Generado el ${reporte.generado_en} por ${reporte.generado_por}</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      ventana.print();
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'presente':
        return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
      case 'ausente':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'tardanza':
        return <ClockIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/mis-grupos/${grupoId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Registro de Asistencia
                </h1>
                <p className="text-sm text-gray-500">
                  {grupo?.nombre} • {grupo?.curso}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selector de fecha y acciones */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-sm text-gray-600">{fechaFormato}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => marcarTodos('presente')}
              >
                Todos Presentes
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => marcarTodos('ausente')}
              >
                Todos Ausentes
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Estudiantes</p>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {
                Object.values(asistencias).filter(
                  (a) => a.estado === 'presente'
                ).length
              }
            </p>
            <p className="text-xs text-emerald-600">Presentes</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {
                Object.values(asistencias).filter((a) => a.estado === 'ausente')
                  .length
              }
            </p>
            <p className="text-xs text-red-600">Ausentes</p>
          </div>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div
            className={`p-4 rounded-lg ${
              mensaje.tipo === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        {/* Lista de estudiantes */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Estudiante</th>
                  <th className="px-4 py-3 font-medium">Cédula</th>
                  <th className="px-4 py-3 font-medium text-center">Estado</th>
                  <th className="px-4 py-3 font-medium">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {estudiantes.map((est, index) => (
                  <tr key={est.id_deportista} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-indigo-600">
                            {est.deportista.nombres.charAt(0)}
                            {est.deportista.apellidos.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {est.deportista.nombres} {est.deportista.apellidos}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {est.deportista.cedula || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {['presente', 'ausente', 'tardanza', 'justificado'].map(
                          (estado) => (
                            <button
                              key={estado}
                              onClick={() =>
                                handleEstadoChange(
                                  est.id_deportista,
                                  estado as
                                    | 'presente'
                                    | 'ausente'
                                    | 'tardanza'
                                    | 'justificado'
                                )
                              }
                              className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                                asistencias[est.id_deportista]?.estado ===
                                estado
                                  ? estado === 'presente'
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                    : estado === 'ausente'
                                    ? 'bg-red-100 border-red-300 text-red-700'
                                    : estado === 'tardanza'
                                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                                    : 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {estado === 'presente'
                                ? 'P'
                                : estado === 'ausente'
                                ? 'A'
                                : estado === 'tardanza'
                                ? 'T'
                                : 'J'}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={
                          asistencias[est.id_deportista]?.observaciones || ''
                        }
                        onChange={(e) =>
                          handleObservacionChange(
                            est.id_deportista,
                            e.target.value
                          )
                        }
                        placeholder="Observaciones..."
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={handleDescargarReporte}
            disabled={isDownloading}
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            {isDownloading ? 'Generando...' : 'Descargar Reporte'}
          </Button>
          <Button onClick={handleGuardar} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Asistencia'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
