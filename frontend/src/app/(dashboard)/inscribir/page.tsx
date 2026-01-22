'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Card, Button, Alert, Spinner, Select } from '@/components/ui';
import { CursoStep, ImageUploader } from '@/components/inscribir';
import { cursosService, inscripcionesService } from '@/services/cursos.service';
import { deportistasService } from '@/services/deportistas.service';
import {
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { Curso, GrupoCurso, Deportista } from '@/types';

type Step = 'participante' | 'curso' | 'pago' | 'confirmacion';

function InscribirContent() {
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
    comprobante_pago: '',
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(n);

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
    
    if (!pagoData.comprobante_pago) {
      setError('Por favor sube el comprobante de pago');
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
        comprobante_pago: pagoData.comprobante_pago,
        metodo_pago: pagoData.metodo_pago,
        referencia: pagoData.referencia,
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
            <CursoStep
              cursos={cursos}
              grupos={grupos}
              selectedCurso={selectedCurso}
              selectedGrupo={selectedGrupo}
              loadingGrupos={loadingGrupos}
              onCursoSelect={handleCursoSelect}
              onGrupoSelect={setSelectedGrupo}
              onBack={() => setStep('participante')}
              onContinue={() => setStep('pago')}
            />
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
                  { value: 'transferencia', label: 'Transferencia Bancaria' },
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Número de referencia o transacción"
                />
              </div>

              <ImageUploader
                onImageUpload={(url) =>
                  setPagoData({ ...pagoData, comprobante_pago: url })
                }
                currentImage={pagoData.comprobante_pago}
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={pagoData.observaciones}
                  onChange={(e) =>
                    setPagoData({ ...pagoData, observaciones: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Información adicional sobre el pago"
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
                <Button 
                  onClick={handleSubmit} 
                  isLoading={submitting}
                  disabled={!pagoData.comprobante_pago}
                >
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

export default function InscribirPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    }>
      <InscribirContent />
    </Suspense>
  );
}
