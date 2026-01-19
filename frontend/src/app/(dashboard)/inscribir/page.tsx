'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Alert, Spinner, Select } from '@/components/ui';
import { cursosService, inscripcionesService } from '@/services/cursos.service';
import { deportistasService } from '@/services/deportistas.service';
import {
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { Curso, GrupoCurso, Deportista } from '@/types';

type Step = 'participante' | 'curso' | 'pago' | 'confirmacion';

export default function InscribirPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>('participante');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [participantes, setParticipantes] = useState<Deportista[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [grupos, setGrupos] = useState<GrupoCurso[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);

  const [selectedParticipante, setSelectedParticipante] = useState<
    number | null
  >(null);
  const [selectedCurso, setSelectedCurso] = useState<number | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<number | null>(null);
  const [pagoData, setPagoData] = useState({
    metodo_pago: 'transferencia',
    referencia: '',
    observaciones: '',
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(n);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  const formatTime = (t: string) => {
    if (!t) return '';
    const [hr, min] = t.split(':');
    const h = parseInt(hr);
    return `${h % 12 || 12}:${min} ${h >= 12 ? 'PM' : 'AM'}`;
  };
  const getDias = (dias: string[] | number[] | undefined) => {
    if (!dias?.length) return 'Por definir';
    const map: Record<string, string> = {
      '0': 'Dom',
      '1': 'Lun',
      '2': 'Mar',
      '3': 'Mié',
      '4': 'Jue',
      '5': 'Vie',
      '6': 'Sáb',
    };
    return dias.map((d) => map[String(d)] || String(d)).join(', ');
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [partData, cursosData] = await Promise.all([
        deportistasService.getMisParticipantes(),
        cursosService.getCursosAbiertos(),
      ]);
      setParticipantes(Array.isArray(partData) ? partData : []);
      setCursos(cursosData || []);

      const cursoParam = searchParams.get('curso');
      if (cursoParam) {
        const cursoId = parseInt(cursoParam);
        setSelectedCurso(cursoId);
        const gruposData = await cursosService.getGruposPublico(cursoId);
        setGrupos(gruposData || []);
        const grupoParam = searchParams.get('grupo');
        if (grupoParam) setSelectedGrupo(parseInt(grupoParam));
      }
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCursoSelect = async (cursoId: number) => {
    setSelectedCurso(cursoId);
    setSelectedGrupo(null);
    setLoadingGrupos(true);
    try {
      const gruposData = await cursosService.getGruposPublico(cursoId);
      setGrupos(gruposData || []);
    } catch {
      setGrupos([]);
    } finally {
      setLoadingGrupos(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedParticipante || !selectedCurso || !selectedGrupo) {
      setError('Completa todos los campos');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await inscripcionesService.create({
        id_curso: selectedCurso,
        id_grupo: selectedGrupo,
        id_deportista: selectedParticipante,
        generar_factura: true,
        observaciones: pagoData.observaciones || undefined,
      });
      setSuccess(
        '¡Inscripción realizada! El administrador verificará tu pago.'
      );
      setStep('confirmacion');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al inscribir');
    } finally {
      setSubmitting(false);
    }
  };

  const cursoSel = cursos.find((c) => c.id_curso === selectedCurso);
  const grupoSel = grupos.find((g) => g.id_grupo === selectedGrupo);
  const partSel = participantes.find(
    (p) => p.id_deportista === selectedParticipante
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (participantes.length === 0) {
    return (
      <DashboardLayout>
        <Card className="text-center py-12">
          <UserGroupIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Primero registra un participante
          </h3>
          <p className="text-gray-500 mb-6">
            Debes registrar a tu hijo antes de inscribirlo
          </p>
          <Button onClick={() => router.push('/mis-participantes')}>
            Ir a Mis Participantes
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <AcademicCapIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Inscribir en Curso</h1>
            <p className="text-xs text-gray-500">
              Inscribe a tu hijo en un curso vacacional
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Steps */}
        <div className="flex items-center justify-between px-2">
          {(['participante', 'curso', 'pago', 'confirmacion'] as Step[]).map(
            (s, i) => {
              const labels = ['Participante', 'Curso', 'Pago', 'Confirmación'];
              const isActive = s === step;
              const isDone =
                (s === 'participante' && selectedParticipante) ||
                (s === 'curso' && selectedGrupo) ||
                (s === 'pago' && step === 'confirmacion');
              return (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isDone
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {isDone && !isActive ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      isActive ? 'text-indigo-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {labels[i]}
                  </span>
                  {i < 3 && <div className="w-8 h-0.5 mx-2 bg-gray-200" />}
                </div>
              );
            }
          )}
        </div>

        <Card className="p-6">
          {/* Step 1 */}
          {step === 'participante' && (
            <div className="space-y-4">
              <h2 className="font-medium">¿A quién deseas inscribir?</h2>
              <div className="space-y-2">
                {participantes.map((p) => (
                  <button
                    key={p.id_deportista}
                    onClick={() => setSelectedParticipante(p.id_deportista)}
                    className={`w-full p-4 text-left border rounded-lg ${
                      selectedParticipante === p.id_deportista
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {p.nombres} {p.apellidos}
                        </p>
                        <p className="text-sm text-gray-500">
                          {p.categoria?.nombre || 'Sin categoría'}
                        </p>
                      </div>
                      {selectedParticipante === p.id_deportista && (
                        <CheckCircleIcon className="h-6 w-6 text-indigo-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep('curso')}
                  disabled={!selectedParticipante}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 'curso' && (
            <div className="space-y-4">
              <h2 className="font-medium">Selecciona el curso y horario</h2>
              <div className="space-y-2">
                {cursos.map((c) => (
                  <button
                    key={c.id_curso}
                    onClick={() => handleCursoSelect(c.id_curso)}
                    className={`w-full p-4 text-left border rounded-lg ${
                      selectedCurso === c.id_curso
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{c.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(c.fecha_inicio)} -{' '}
                          {formatDate(c.fecha_fin)}
                        </p>
                      </div>
                      <p className="font-semibold text-indigo-600">
                        {formatCurrency(c.precio || 0)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {selectedCurso && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Horario</label>
                  {loadingGrupos ? (
                    <Spinner />
                  ) : grupos.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No hay horarios
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {grupos.map((g) => {
                        const cupos = g.cupo_maximo - (g.cupo_actual || 0);
                        const full = cupos <= 0;
                        return (
                          <button
                            key={g.id_grupo}
                            onClick={() =>
                              !full && setSelectedGrupo(g.id_grupo)
                            }
                            disabled={full}
                            className={`w-full p-3 text-left border rounded-lg ${
                              full
                                ? 'opacity-50'
                                : selectedGrupo === g.id_grupo
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm">
                                  {g.nombre}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatTime(g.hora_inicio || '')} -{' '}
                                  {formatTime(g.hora_fin || '')} |{' '}
                                  {getDias(g.dias_semana)}
                                </p>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  full
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {full ? 'Lleno' : `${cupos} cupos`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setStep('participante')}
                >
                  Atrás
                </Button>
                <Button
                  onClick={() => setStep('pago')}
                  disabled={!selectedGrupo}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 'pago' && (
            <div className="space-y-4">
              <h2 className="font-medium">Información de Pago</h2>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Participante:</span>
                  <span className="font-medium">
                    {partSel?.nombres} {partSel?.apellidos}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Curso:</span>
                  <span className="font-medium">{cursoSel?.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Horario:</span>
                  <span className="font-medium">{grupoSel?.nombre}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {formatCurrency(cursoSel?.precio || 0)}
                  </span>
                </div>
              </div>
              <Select
                label="Método de pago"
                value={pagoData.metodo_pago}
                onChange={(e) =>
                  setPagoData({ ...pagoData, metodo_pago: e.target.value })
                }
                options={[
                  { value: 'transferencia', label: 'Transferencia' },
                  { value: 'efectivo', label: 'Efectivo' },
                  { value: 'tarjeta', label: 'Tarjeta' },
                ]}
              />
              <div>
                <label className="block text-sm font-medium mb-1">
                  Referencia de pago
                </label>
                <input
                  type="text"
                  value={pagoData.referencia}
                  onChange={(e) =>
                    setPagoData({ ...pagoData, referencia: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Número de transferencia"
                />
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                Tu inscripción quedará pendiente hasta que el administrador
                verifique el pago.
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => setStep('curso')}>
                  Atrás
                </Button>
                <Button onClick={handleSubmit} isLoading={submitting}>
                  Confirmar Inscripción
                </Button>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 'confirmacion' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                ¡Inscripción Registrada!
              </h2>
              <p className="text-gray-600 mb-6">
                El administrador verificará tu pago y recibirás confirmación.
              </p>
              <div className="p-4 bg-gray-50 rounded-lg text-left text-sm mb-6 max-w-sm mx-auto">
                <p>
                  <span className="text-gray-600">Participante:</span>{' '}
                  {partSel?.nombres} {partSel?.apellidos}
                </p>
                <p>
                  <span className="text-gray-600">Curso:</span>{' '}
                  {cursoSel?.nombre}
                </p>
                <p>
                  <span className="text-gray-600">Grupo:</span>{' '}
                  {grupoSel?.nombre}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="secondary"
                  onClick={() => router.push('/mis-participantes')}
                >
                  Ver Participantes
                </Button>
                <Button onClick={() => router.push('/dashboard')}>
                  Ir al Dashboard
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
