'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout';
import { deportistasService } from '@/services/deportistas.service';
import { categoriasService } from '@/services/categorias.service';
import {
  Button,
  Card,
  Alert,
  Input,
  Select,
  Modal,
  Spinner,
  Badge,
} from '@/components/ui';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { Deportista, Categoria, DeportistaFormData } from '@/types';

const initialFormData: DeportistaFormData = {
  nombres: '',
  apellidos: '',
  cedula: '',
  fecha_nacimiento: '',
  genero: 'M',
  direccion: '',
  telefono: '',
  email: '',
  tipo_sangre: '',
  alergias: '',
  enfermedades: '',
  id_categoria: undefined,
};

export default function MisParticipantesPage() {
  const [participantes, setParticipantes] = useState<Deportista[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DeportistaFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const [participantesData, categoriasResponse] = await Promise.all([
        deportistasService.getMisParticipantes(),
        categoriasService.getAll(),
      ]);

      setParticipantes(participantesData || []);

      // Manejar respuesta de categorías (puede ser array o paginado)
      const catData = categoriasResponse as
        | { data?: Categoria[] }
        | Categoria[];
      if (Array.isArray(catData)) {
        setCategorias(catData);
      } else if (catData && 'data' in catData && Array.isArray(catData.data)) {
        setCategorias(catData.data);
      } else {
        setCategorias([]);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (participante: Deportista) => {
    // Formatear fecha a YYYY-MM-DD para el input date
    let fechaFormateada = '';
    if (participante.fecha_nacimiento) {
      const fecha = new Date(participante.fecha_nacimiento);
      fechaFormateada = fecha.toISOString().split('T')[0];
    }

    setFormData({
      nombres: participante.nombres,
      apellidos: participante.apellidos,
      cedula: participante.cedula || '',
      fecha_nacimiento: fechaFormateada,
      genero: participante.genero,
      direccion: participante.direccion || '',
      telefono: participante.telefono || '',
      email: participante.email || '',
      tipo_sangre: participante.tipo_sangre || '',
      alergias: participante.alergias || '',
      enfermedades: participante.enfermedades || '',
      id_categoria: participante.id_categoria,
    });
    setIsEditing(true);
    setEditingId(participante.id_deportista);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      if (isEditing && editingId) {
        await deportistasService.actualizarMiParticipante(editingId, formData);
        setSuccess('Participante actualizado correctamente');
      } else {
        await deportistasService.crearMiParticipante(formData);
        setSuccess('Participante registrado correctamente');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este participante?')) return;

    try {
      await deportistasService.eliminarMiParticipante(id);
      setSuccess('Participante eliminado');
      loadData();
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Mis Participantes
              </h1>
              <p className="text-xs text-gray-500">
                Registra a tus hijos para inscribirlos en cursos
              </p>
            </div>
          </div>
          <Button size="sm" onClick={openCreateModal}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Agregar
          </Button>
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

        {participantes.length === 0 ? (
          <Card className="text-center py-12">
            <UserGroupIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes participantes registrados
            </h3>
            <p className="text-gray-500 mb-6">
              Registra a tus hijos para poder inscribirlos en los cursos
            </p>
            <Button onClick={openCreateModal}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Registrar mi primer participante
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {participantes.map((p) => (
              <Card key={p.id_deportista} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {p.nombres} {p.apellidos}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {calcularEdad(p.fecha_nacimiento)} años •{' '}
                      {p.genero === 'M' ? 'Masculino' : 'Femenino'}
                    </p>
                    {p.categoria && (
                      <Badge variant="info">{p.categoria.nombre}</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id_deportista)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {(p.alergias || p.enfermedades) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {p.alergias && (
                      <p className="text-xs text-orange-600">
                        <span className="font-medium">Alergias:</span>{' '}
                        {p.alergias}
                      </p>
                    )}
                    {p.enfermedades && (
                      <p className="text-xs text-red-600">
                        <span className="font-medium">Condiciones:</span>{' '}
                        {p.enfermedades}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Modal para crear/editar participante */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={isEditing ? 'Editar Participante' : 'Registrar Participante'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha de Nacimiento"
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
              />
              <Select
                label="Género"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                options={[
                  { value: 'M', label: 'Masculino' },
                  { value: 'F', label: 'Femenino' },
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cédula (opcional)"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                placeholder="Si tiene"
              />
              <Select
                label="Categoría"
                name="id_categoria"
                value={formData.id_categoria?.toString() || ''}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Seleccionar categoría' },
                  ...categorias.map((c) => ({
                    value: c.id_categoria.toString(),
                    label: `${c.nombre}${
                      c.edad_minima && c.edad_maxima
                        ? ` (${c.edad_minima}-${c.edad_maxima} años)`
                        : ''
                    }`,
                  })),
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tipo de Sangre"
                name="tipo_sangre"
                value={formData.tipo_sangre}
                onChange={handleChange}
                placeholder="Ej: O+"
              />
              <Input
                label="Teléfono de emergencia"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alergias (si tiene)
              </label>
              <textarea
                name="alergias"
                value={formData.alergias}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe las alergias conocidas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condiciones médicas (si tiene)
              </label>
              <textarea
                name="enfermedades"
                value={formData.enfermedades}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe condiciones médicas importantes"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSaving}>
                {isEditing ? 'Guardar Cambios' : 'Registrar'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
