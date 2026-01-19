'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import {
  dashboardService,
  EstadisticasCursosVacacionales,
  CursoActivo,
  InscripcionReciente,
  MisDatosTutor,
  MisDatosInstructor,
  ParticipanteDashboard,
  ReporteCursosResponse,
  ReporteFinanzasResponse,
  ReporteParticipantesResponse,
} from '@/services/dashboard.service';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  UsersIcon,
  UserIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const userRole = user?.rol?.slug || '';

  const [stats, setStats] = useState<EstadisticasCursosVacacionales | null>(
    null
  );
  const [cursosActivos, setCursosActivos] = useState<CursoActivo[]>([]);
  const [inscripcionesRecientes, setInscripcionesRecientes] = useState<
    InscripcionReciente[]
  >([]);
  const [participantes, setParticipantes] = useState<ParticipanteDashboard[]>(
    []
  );
  const [misDatos, setMisDatos] = useState<
    MisDatosTutor | MisDatosInstructor | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para reportes
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (userRole === 'administrador') {
        const [statsData, cursosData, inscripcionesData, participantesData] =
          await Promise.all([
            dashboardService.getEstadisticas().catch(() => null),
            dashboardService.getCursosActivos().catch(() => []),
            dashboardService.getInscripcionesRecientes().catch(() => []),
            dashboardService.getParticipantes(10).catch(() => []),
          ]);
        setStats(statsData);
        setCursosActivos(cursosData);
        setInscripcionesRecientes(inscripcionesData);
        setParticipantes(participantesData);
      } else if (userRole === 'instructor' || userRole === 'tutor') {
        const datos = await dashboardService.getMisDatos().catch(() => null);
        setMisDatos(datos as MisDatosTutor | MisDatosInstructor | null);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole) {
      loadData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [loadData, userRole, authLoading]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Guayaquil',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Funciones para generar reportes PDF
  const generarReporteCursos = async () => {
    setIsGeneratingReport(true);
    try {
      const data = await dashboardService.getReporteCursos({
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
      });

      const contenido = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Cursos</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; }
            .header h1 { color: #4f46e5; margin: 0; font-size: 22px; }
            .header p { margin: 5px 0; color: #666; font-size: 11px; }
            .resumen { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
            .resumen-item { background: #f3f4f6; padding: 10px; border-radius: 6px; text-align: center; }
            .resumen-item .valor { font-size: 20px; font-weight: bold; color: #4f46e5; }
            .resumen-item .label { font-size: 10px; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f9fafb; font-weight: 600; font-size: 11px; }
            td { font-size: 11px; }
            .estado { padding: 2px 8px; border-radius: 10px; font-size: 10px; }
            .estado-abierto { background: #d1fae5; color: #065f46; }
            .estado-en_proceso { background: #dbeafe; color: #1e40af; }
            .estado-cerrado { background: #f3f4f6; color: #374151; }
            .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REPORTE DE CURSOS</h1>
            <p>Cursos Vacacionales</p>
            ${
              fechaDesde || fechaHasta
                ? `<p>Período: ${fechaDesde || 'Inicio'} - ${
                    fechaHasta || 'Actual'
                  }</p>`
                : ''
            }
          </div>
          
          <div class="resumen">
            <div class="resumen-item">
              <div class="valor">${data.resumen.total_cursos}</div>
              <div class="label">Total Cursos</div>
            </div>
            <div class="resumen-item">
              <div class="valor">${data.resumen.cursos_abiertos}</div>
              <div class="label">Abiertos</div>
            </div>
            <div class="resumen-item">
              <div class="valor">${data.resumen.cursos_en_proceso}</div>
              <div class="label">En Proceso</div>
            </div>
            <div class="resumen-item">
              <div class="valor">${data.resumen.total_grupos}</div>
              <div class="label">Total Grupos</div>
            </div>
            <div class="resumen-item">
              <div class="valor">${data.resumen.total_inscripciones}</div>
              <div class="label">Total Inscripciones</div>
            </div>
            <div class="resumen-item">
              <div class="valor">${data.resumen.cursos_cerrados}</div>
              <div class="label">Cerrados</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Precio</th>
                <th>Cupo</th>
                <th>Grupos</th>
                <th>Inscritos</th>
              </tr>
            </thead>
            <tbody>
              ${data.cursos
                .map(
                  (c) => `
                <tr>
                  <td>${c.nombre}</td>
                  <td>${c.tipo || '-'}</td>
                  <td><span class="estado estado-${c.estado}">${
                    c.estado
                  }</span></td>
                  <td>${c.fecha_inicio || '-'}</td>
                  <td>${c.fecha_fin || '-'}</td>
                  <td>$${Number(c.precio || 0).toFixed(2)}</td>
                  <td>${c.cupo_actual}/${c.cupo_maximo}</td>
                  <td>${c.grupos_count}</td>
                  <td>${c.inscripciones_count}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generado el ${new Date().toLocaleDateString('es-EC', {
              timeZone: 'America/Guayaquil',
            })} a las ${new Date().toLocaleTimeString('es-EC', {
        timeZone: 'America/Guayaquil',
      })}</p>
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
    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generarReporteFinanzas = async () => {
    setIsGeneratingReport(true);
    try {
      const data = await dashboardService.getReporteFinanzas({
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
      });

      const contenido = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Finanzas</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #059669; padding-bottom: 15px; }
            .header h1 { color: #059669; margin: 0; font-size: 22px; }
            .header p { margin: 5px 0; color: #666; font-size: 11px; }
            .resumen { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
            .resumen-item { background: #f3f4f6; padding: 10px; border-radius: 6px; text-align: center; }
            .resumen-item .valor { font-size: 18px; font-weight: bold; color: #059669; }
            .resumen-item .label { font-size: 10px; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f9fafb; font-weight: 600; font-size: 11px; }
            td { font-size: 11px; }
            .estado { padding: 2px 8px; border-radius: 10px; font-size: 10px; }
            .estado-pagada { background: #d1fae5; color: #065f46; }
            .estado-pendiente { background: #fef3c7; color: #92400e; }
            .estado-vencida { background: #fee2e2; color: #991b1b; }
            .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #9ca3af; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REPORTE DE FINANZAS</h1>
            <p>Cursos Vacacionales</p>
            ${
              fechaDesde || fechaHasta
                ? `<p>Período: ${fechaDesde || 'Inicio'} - ${
                    fechaHasta || 'Actual'
                  }</p>`
                : ''
            }
          </div>
          
          <div class="resumen">
            <div class="resumen-item">
              <div class="valor">${data.resumen.total_facturas}</div>
              <div class="label">Total Facturas</div>
            </div>
            <div class="resumen-item">
              <div class="valor">$${Number(
                data.resumen.total_facturado || 0
              ).toFixed(2)}</div>
              <div class="label">Total Facturado</div>
            </div>
            <div class="resumen-item">
              <div class="valor">$${Number(
                data.resumen.total_pagado || 0
              ).toFixed(2)}</div>
              <div class="label">Total Pagado</div>
            </div>
            <div class="resumen-item">
              <div class="valor">$${Number(
                data.resumen.total_pendiente || 0
              ).toFixed(2)}</div>
              <div class="label">Total Pendiente</div>
            </div>
            <div class="resumen-item">
              <div class="valor">${data.resumen.facturas_pagadas}</div>
              <div class="label">Facturas Pagadas</div>
            </div>
            <div class="resumen-item">
              <div class="valor">${data.resumen.facturas_pendientes}</div>
              <div class="label">Facturas Pendientes</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Concepto</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.facturas
                .map(
                  (f) => `
                <tr>
                  <td>${f.numero || '-'}</td>
                  <td>${f.cliente}</td>
                  <td>${f.concepto || '-'}</td>
                  <td>${f.fecha_emision || '-'}</td>
                  <td><span class="estado estado-${f.estado}">${
                    f.estado
                  }</span></td>
                  <td class="text-right">$${Number(f.total || 0).toFixed(
                    2
                  )}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generado el ${new Date().toLocaleDateString('es-EC', {
              timeZone: 'America/Guayaquil',
            })} a las ${new Date().toLocaleTimeString('es-EC', {
        timeZone: 'America/Guayaquil',
      })}</p>
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
    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generarReporteParticipantes = async () => {
    setIsGeneratingReport(true);
    try {
      const data = await dashboardService.getReporteParticipantes({
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
      });

      const contenido = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Participantes</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #7c3aed; padding-bottom: 15px; }
            .header h1 { color: #7c3aed; margin: 0; font-size: 22px; }
            .header p { margin: 5px 0; color: #666; font-size: 11px; }
            .resumen { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .resumen-item { background: #f3f4f6; padding: 10px; border-radius: 6px; text-align: center; }
            .resumen-item .valor { font-size: 20px; font-weight: bold; color: #7c3aed; }
            .resumen-item .label { font-size: 10px; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f9fafb; font-weight: 600; font-size: 11px; }
            td { font-size: 11px; }
            .estado { padding: 2px 8px; border-radius: 10px; font-size: 10px; }
            .estado-activo { background: #d1fae5; color: #065f46; }
            .estado-inactivo { background: #f3f4f6; color: #374151; }
            .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REPORTE DE PARTICIPANTES</h1>
            <p>Cursos Vacacionales</p>
            ${
              fechaDesde || fechaHasta
                ? `<p>Período: ${fechaDesde || 'Inicio'} - ${
                    fechaHasta || 'Actual'
                  }</p>`
                : ''
            }
          </div>
          
          <div class="resumen">
            <div class="resumen-item">
              <div class="valor">${data.resumen.total_participantes}</div>
              <div class="label">Total Participantes</div>
            </div>
            <div class="resumen-item">
              <div class="valor">${data.resumen.participantes_activos}</div>
              <div class="label">Activos</div>
            </div>
            <div class="resumen-item">
              <div class="valor">${data.resumen.participantes_inactivos}</div>
              <div class="label">Inactivos</div>
            </div>
            <div class="resumen-item">
              <div class="valor">${data.resumen.con_inscripciones}</div>
              <div class="label">Con Inscripciones</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Edad</th>
                <th>Género</th>
                <th>Categoría</th>
                <th>Tutor</th>
                <th>Inscripciones</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${data.participantes
                .map(
                  (p) => `
                <tr>
                  <td>${p.nombre}</td>
                  <td>${p.cedula || '-'}</td>
                  <td>${p.edad || '-'}</td>
                  <td>${p.genero || '-'}</td>
                  <td>${p.categoria || '-'}</td>
                  <td>${p.tutor || '-'}</td>
                  <td>${p.inscripciones_activas}</td>
                  <td><span class="estado estado-${p.estado}">${
                    p.estado
                  }</span></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generado el ${new Date().toLocaleDateString('es-EC', {
              timeZone: 'America/Guayaquil',
            })} a las ${new Date().toLocaleTimeString('es-EC', {
        timeZone: 'America/Guayaquil',
      })}</p>
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
    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Dashboard para ADMINISTRADOR
  if (userRole === 'administrador') {
    const statCards = [
      {
        label: 'Cursos Abiertos',
        value: stats?.cursos.abiertos || 0,
        total: stats?.cursos.total || 0,
        icon: AcademicCapIcon,
        bgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
      },
      {
        label: 'Inscripciones Activas',
        value: stats?.inscripciones.activas || 0,
        total: stats?.inscripciones.este_mes || 0,
        subtitle: 'este mes',
        icon: ClipboardDocumentCheckIcon,
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
      },
      {
        label: 'Deportistas',
        value: stats?.deportistas.activos || 0,
        total: stats?.deportistas.total || 0,
        icon: UserGroupIcon,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
      },
      {
        label: 'Instructores',
        value: stats?.instructores.activos || 0,
        total: stats?.instructores.total || 0,
        icon: UserIcon,
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-600',
      },
    ];

    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Dashboard - Administración
              </h1>
              <p className="text-xs text-gray-500 capitalize">{dateStr}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {isLoading ? '...' : stat.value}
                    </p>
                    <p className="text-xs text-gray-400">
                      {stat.subtitle || `de ${stat.total} total`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4">
                <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-medium text-gray-900">
                  Cursos Activos
                </h2>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                </div>
              ) : cursosActivos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  No hay cursos activos
                </p>
              ) : (
                <div className="space-y-2">
                  {cursosActivos.map((curso) => (
                    <div
                      key={curso.id_curso}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {curso.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {curso.grupos_count} grupos ·{' '}
                          {curso.inscripciones_count} inscritos
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            curso.estado === 'abierto'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {curso.estado}
                        </span>
                        <div className="mt-1">
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                            <div
                              className="h-1.5 bg-indigo-500 rounded-full"
                              style={{
                                width: `${curso.porcentaje_ocupacion}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-400">
                            {curso.porcentaje_ocupacion}% ocupado
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardDocumentCheckIcon className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-medium text-gray-900">
                  Inscripciones Recientes
                </h2>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                </div>
              ) : inscripcionesRecientes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  No hay inscripciones recientes
                </p>
              ) : (
                <div className="space-y-2">
                  {inscripcionesRecientes.slice(0, 5).map((inscripcion) => (
                    <div
                      key={inscripcion.id_inscripcion}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {inscripcion.deportista || 'Sin nombre'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {inscripcion.curso} - {inscripcion.grupo}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          inscripcion.estado === 'activa'
                            ? 'bg-emerald-50 text-emerald-600'
                            : inscripcion.estado === 'completada'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {inscripcion.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <UsersIcon className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">
                Resumen de Grupos
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">
                  {stats?.grupos.activos || 0}
                </p>
                <p className="text-xs text-gray-600">Activos</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">
                  {stats?.grupos.completos || 0}
                </p>
                <p className="text-xs text-gray-600">Completos</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">
                  {stats?.grupos.total || 0}
                </p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-medium text-gray-900">
                  Últimos Participantes Registrados
                </h2>
              </div>
              <Link
                href="/deportistas"
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                Ver todos →
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
              </div>
            ) : participantes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No hay participantes registrados
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-500 pb-2">
                        Nombre
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 pb-2">
                        Edad
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 pb-2">
                        Categoría
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 pb-2">
                        Tutor
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 pb-2">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantes.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50">
                        <td className="py-2 text-sm font-medium text-gray-900">
                          {p.nombre}
                        </td>
                        <td className="py-2 text-sm text-gray-600">
                          {p.edad || '-'}
                        </td>
                        <td className="py-2 text-sm text-gray-600">
                          {p.categoria || '-'}
                        </td>
                        <td className="py-2 text-sm text-gray-600">
                          {p.tutor || '-'}
                        </td>
                        <td className="py-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              p.estado === 'activo'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {p.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sección de Reportes */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <DocumentChartBarIcon className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">
                Generar Reportes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={generarReporteCursos}
                disabled={isGeneratingReport}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <AcademicCapIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Reporte Cursos</span>
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>

              <button
                onClick={generarReporteFinanzas}
                disabled={isGeneratingReport}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <CurrencyDollarIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Reporte Finanzas</span>
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>

              <button
                onClick={generarReporteParticipantes}
                disabled={isGeneratingReport}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <UserGroupIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Reporte Participantes
                </span>
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
            </div>

            {isGeneratingReport && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                Generando reporte...
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Dashboard para INSTRUCTOR
  if (userRole === 'instructor') {
    const datos = misDatos as MisDatosInstructor | null;

    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Dashboard - Instructor
              </h1>
              <p className="text-xs text-gray-500 capitalize">{dateStr}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50">
                  <UsersIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Mis Grupos</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {isLoading ? '...' : datos?.grupos.total || 0}
                  </p>
                  <p className="text-xs text-gray-400">
                    {datos?.grupos.activos || 0} activos
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <UserGroupIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Estudiantes</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {isLoading ? '...' : datos?.participantes_total || 0}
                  </p>
                  <p className="text-xs text-gray-400">en todos mis grupos</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <CalendarDaysIcon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Asistencias</p>
                  <p className="text-xl font-semibold text-gray-900">Hoy</p>
                  <p className="text-xs text-gray-400">registrar asistencia</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-medium text-gray-900">
                  Mis Grupos Asignados
                </h2>
              </div>
              <Link
                href="/mis-grupos"
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                Ver todos →
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
              </div>
            ) : !datos?.grupos.lista || datos.grupos.lista.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No tienes grupos asignados
              </p>
            ) : (
              <div className="space-y-2">
                {datos.grupos.lista.slice(0, 5).map((grupo) => (
                  <Link
                    key={grupo.id}
                    href={`/mis-grupos/${grupo.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {grupo.nombre}
                      </p>
                      <p className="text-xs text-gray-500">{grupo.curso}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {grupo.participantes}/{grupo.cupo_maximo}
                      </p>
                      <p className="text-xs text-gray-400">estudiantes</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Dashboard para TUTOR
  if (userRole === 'tutor') {
    const datos = misDatos as MisDatosTutor | null;

    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Dashboard - Tutor
              </h1>
              <p className="text-xs text-gray-500 capitalize">{dateStr}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <UserGroupIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Mis Participantes</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {isLoading ? '...' : datos?.participantes.total || 0}
                  </p>
                  <p className="text-xs text-gray-400">
                    {datos?.participantes.activos || 0} activos
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <ClipboardDocumentCheckIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Inscripciones</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {isLoading ? '...' : datos?.inscripciones.activas || 0}
                  </p>
                  <p className="text-xs text-gray-400">activas</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <DocumentTextIcon className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Facturas Pendientes</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {isLoading ? '...' : datos?.facturas.pendientes || 0}
                  </p>
                  <p className="text-xs text-gray-400">por pagar</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50">
                  <CurrencyDollarIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Monto Pendiente</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {isLoading
                      ? '...'
                      : formatCurrency(datos?.facturas.monto_pendiente || 0)}
                  </p>
                  <p className="text-xs text-gray-400">total a pagar</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4 text-gray-400" />
                  <h2 className="text-sm font-medium text-gray-900">
                    Mis Participantes
                  </h2>
                </div>
                <Link
                  href="/mis-participantes"
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Ver todos →
                </Link>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                </div>
              ) : !datos?.participantes.lista ||
                datos.participantes.lista.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-2">
                    No tienes participantes registrados
                  </p>
                  <Link
                    href="/mis-participantes"
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Agregar participante
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {datos.participantes.lista.slice(0, 5).map((participante) => (
                    <div
                      key={participante.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {participante.nombre}
                        </p>
                        {participante.edad && (
                          <p className="text-xs text-gray-500">
                            {participante.edad} años
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-gray-400" />
                  <h2 className="text-sm font-medium text-gray-900">
                    Resumen de Inscripciones
                  </h2>
                </div>
                <Link
                  href="/mis-inscripciones"
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Ver todas →
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">
                    {datos?.inscripciones.activas || 0}
                  </p>
                  <p className="text-xs text-gray-600">Activas</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {datos?.inscripciones.completadas || 0}
                  </p>
                  <p className="text-xs text-gray-600">Completadas</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">
                    {datos?.inscripciones.total || 0}
                  </p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Dashboard genérico (otros roles)
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500 capitalize">{dateStr}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Bienvenido al Sistema de Cursos Vacacionales
          </h2>
          <p className="text-sm text-gray-500">
            {isLoading ? 'Cargando...' : `Hola, ${user?.nombre || 'Usuario'}`}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
