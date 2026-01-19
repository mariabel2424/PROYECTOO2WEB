'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import {
  Button,
  Table,
  Pagination,
  Modal,
  ConfirmModal,
} from '@/components/ui';
import { usePagination } from '@/hooks/usePagination';
import { gruposCursoService, cursosService } from '@/services/cursos.service';
import { instructoresService } from '@/services/usuarios.service';
import type { GrupoCurso, Curso, Usuario } from '@/types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  EyeIcon,
  ClockIcon,
  AcademicCapIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const DIAS_SEMANA = [
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' },
  { value: '7', label: 'Domingo' },
];

export default function GruposPage() {
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [instructores, setInstructores] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoCurso | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoCurso | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [formData, setFormData] = useState({
    nombre: '',
    id_curso: '',
    cupo_maximo: '',
    hora_inicio: '',
    hora_fin: '',
    dias_semana: [] as string[],
    estado: 'activo',
    id_instructor: '',
  });

  useEffect(() => {
    Promise.all([
      cursosService.getAll({ per_page: 100 }),
      instructoresService.getDisponibles(),
    ])
      .then(([cursosRes, instructoresRes]) => {
        setCursos(cursosRes.data);
        setInstructores(instructoresRes);
      })
      .catch(console.error);
  }, []);

  const fetchGrupos = useCallback(
    (params: Parameters<typeof gruposCursoService.getAll>[0]) =>
      gruposCursoService.getAll(params),
    []
  );

  const {
    data,
    isLoading,
    page,
    perPage,
    total,
    lastPage,
    search,
    sortBy,
    sortOrder,
    goToPage,
    changePerPage,
    handleSearch,
    handleSort,
    refetch,
  } = usePagination<GrupoCurso>(fetchGrupos);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        nombre: formData.nombre,
        id_curso: Number(formData.id_curso),
        cupo_maximo: Number(formData.cupo_maximo),
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        dias_semana: formData.dias_semana,
        estado: formData.estado,
        id_instructor: formData.id_instructor
          ? Number(formData.id_instructor)
          : undefined,
      };
      if (editingGrupo) {
        await gruposCursoService.update(editingGrupo.id_grupo, payload);
      } else {
        await gruposCursoService.create(payload);
      }
      setShowModal(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error guardando grupo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (grupo: GrupoCurso) => {
    setEditingGrupo(grupo);
    setFormData({
      nombre: grupo.nombre,
      id_curso: grupo.id_curso?.toString() || '',
      cupo_maximo: grupo.cupo_maximo?.toString() || '',
      hora_inicio: grupo.hora_inicio || '',
      hora_fin: grupo.hora_fin || '',
      dias_semana: (grupo.dias_semana || []).map(String),
      estado: grupo.estado || 'activo',
      id_instructor: grupo.id_instructor?.toString() || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await gruposCursoService.delete(deleteId);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const handleOpenInstructorModal = (grupo: GrupoCurso) => {
    setSelectedGrupo(grupo);
    setSelectedInstructorId(grupo.id_instructor?.toString() || '');
    setShowInstructorModal(true);
  };

  const handleAsignarInstructor = async () => {
    if (!selectedGrupo) return;
    setIsAssigning(true);
    try {
      if (selectedInstructorId) {
        await gruposCursoService.asignarInstructor(
          selectedGrupo.id_grupo,
          Number(selectedInstructorId)
        );
      } else if (selectedGrupo.id_instructor) {
        await gruposCursoService.quitarInstructor(
          selectedGrupo.id_grupo,
          selectedGrupo.id_instructor
        );
      }
      setShowInstructorModal(false);
      refetch();
    } catch (error) {
      console.error('Error asignando instructor:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const resetForm = () => {
    setEditingGrupo(null);
    setFormData({
      nombre: '',
      id_curso: '',
      cupo_maximo: '',
      hora_inicio: '',
      hora_fin: '',
      dias_semana: [],
      estado: 'activo',
      id_instructor: '',
    });
  };

  const toggleDia = (dia: string) => {
    setFormData((prev) => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter((d) => d !== dia)
        : [...prev.dias_semana, dia],
    }));
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-emerald-50 text-emerald-600';
      case 'completo':
        return 'bg-blue-50 text-blue-600';
      case 'inactivo':
        return 'bg-gray-100 text-gray-500';
      case 'cancelado':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Grupo',
      sortable: true,
      render: (item: GrupoCurso) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
            <UserGroupIcon className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {item.nombre}
          </span>
        </div>
      ),
    },
    {
      key: 'curso',
      header: 'Curso',
      render: (item: GrupoCurso) => (
        <span className="text-sm text-gray-600">
          {item.curso?.nombre || '-'}
        </span>
      ),
    },
    {
      key: 'instructor',
      header: 'Instructor',
      render: (item: GrupoCurso) => (
        <div className="flex items-center gap-2">
          {item.instructor ? (
            <>
              <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-indigo-600">
                  {item.instructor.nombre?.charAt(0)}
                  {item.instructor.apellido?.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {item.instructor.nombre} {item.instructor.apellido}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400 italic">Sin asignar</span>
          )}
        </div>
      ),
    },
    {
      key: 'horario',
      header: 'Horario',
      render: (item: GrupoCurso) => (
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
            <span>
              {item.hora_inicio} - {item.hora_fin}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {item.dias_semana_nombres || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'cupo',
      header: 'Cupo',
      render: (item: GrupoCurso) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900">
            {item.cupo_actual || 0} / {item.cupo_maximo}
          </span>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: GrupoCurso) => (
        <span
          className={`text-xs px-2 py-1 rounded-full ${getEstadoStyle(
            item.estado
          )}`}
        >
          {item.estado}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      render: (item: GrupoCurso) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => router.push(`/cursos/grupos/${item.id_grupo}`)}
            title="Ver participantes e instructor"
            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <UsersIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedGrupo(item);
              setShowDetailModal(true);
            }}
            title="Ver detalle"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleOpenInstructorModal(item)}
            title="Asignar instructor"
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <UserPlusIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEdit(item)}
            title="Editar"
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id_grupo)}
            title="Eliminar"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Grupos de Curso
              </h1>
              <p className="text-xs text-gray-500">{total} registros</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Nuevo Grupo
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar grupo..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <Table
            columns={columns}
            data={data}
            keyExtractor={(item) => item.id_grupo}
            isLoading={isLoading}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
          <div className="border-t border-gray-100">
            <Pagination
              page={page}
              lastPage={lastPage}
              total={total}
              perPage={perPage}
              onPageChange={goToPage}
              onPerPageChange={changePerPage}
            />
          </div>
        </div>

        {/* Modal de detalle */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Detalle del Grupo"
          size="md"
        >
          {selectedGrupo && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                  <UserGroupIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedGrupo.nombre}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedGrupo.curso?.nombre}
                  </p>
                </div>
              </div>

              {/* Instructor */}
              <div className="p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AcademicCapIcon className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-600">
                    Instructor
                  </span>
                </div>
                {selectedGrupo.instructor ? (
                  <p className="text-sm text-gray-900">
                    {selectedGrupo.instructor.nombre}{' '}
                    {selectedGrupo.instructor.apellido}
                    {selectedGrupo.instructor.especialidad && (
                      <span className="text-gray-500 ml-1">
                        ({selectedGrupo.instructor.especialidad})
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-indigo-700 italic">
                    Sin instructor asignado
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Horario</p>
                  <p className="text-gray-900">
                    {selectedGrupo.hora_inicio} - {selectedGrupo.hora_fin}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Días</p>
                  <p className="text-gray-900">
                    {selectedGrupo.dias_semana_nombres || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Cupo</p>
                  <p className="text-gray-900">
                    {selectedGrupo.cupo_actual || 0} /{' '}
                    {selectedGrupo.cupo_maximo}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Estado</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getEstadoStyle(
                      selectedGrupo.estado
                    )}`}
                  >
                    {selectedGrupo.estado}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal de asignar instructor */}
        <Modal
          isOpen={showInstructorModal}
          onClose={() => setShowInstructorModal(false)}
          title="Asignar Instructor"
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Grupo</p>
              <p className="font-medium text-gray-900">
                {selectedGrupo?.nombre}
              </p>
              <p className="text-sm text-gray-500">
                {selectedGrupo?.curso?.nombre}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Instructor
              </label>
              <select
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Sin instructor</option>
                {instructores.map((inst) => (
                  <option key={inst.id_usuario} value={inst.id_usuario}>
                    {inst.nombre} {inst.apellido}
                    {inst.especialidad && ` - ${inst.especialidad}`}
                  </option>
                ))}
              </select>
            </div>

            {selectedGrupo?.instructor && !selectedInstructorId && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-700">
                  Se quitará el instructor actual:{' '}
                  {selectedGrupo.instructor.nombre}{' '}
                  {selectedGrupo.instructor.apellido}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowInstructorModal(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAsignarInstructor}
                disabled={isAssigning}
              >
                {isAssigning ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal de formulario */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`${editingGrupo ? 'Editar' : 'Nuevo'} Grupo`}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nombre del Grupo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Curso *
              </label>
              <select
                value={formData.id_curso}
                onChange={(e) =>
                  setFormData({ ...formData, id_curso: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                required
              >
                <option value="">Seleccionar curso</option>
                {cursos.map((c) => (
                  <option key={c.id_curso} value={c.id_curso}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Instructor
              </label>
              <select
                value={formData.id_instructor}
                onChange={(e) =>
                  setFormData({ ...formData, id_instructor: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">Sin instructor</option>
                {instructores.map((inst) => (
                  <option key={inst.id_usuario} value={inst.id_usuario}>
                    {inst.nombre} {inst.apellido}
                    {inst.especialidad && ` - ${inst.especialidad}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Hora Inicio *
                </label>
                <input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, hora_inicio: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Hora Fin *
                </label>
                <input
                  type="time"
                  value={formData.hora_fin}
                  onChange={(e) =>
                    setFormData({ ...formData, hora_fin: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Días de la Semana *
              </label>
              <div className="flex flex-wrap gap-2">
                {DIAS_SEMANA.map((dia) => (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => toggleDia(dia.value)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      formData.dias_semana.includes(dia.value)
                        ? 'bg-purple-50 border-purple-200 text-purple-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cupo Máximo *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cupo_maximo}
                  onChange={(e) =>
                    setFormData({ ...formData, cupo_maximo: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({ ...formData, estado: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="completo">Completo</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Guardando...'
                  : editingGrupo
                  ? 'Actualizar'
                  : 'Crear'}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="¿Eliminar grupo?"
          message="Esta acción no se puede deshacer. El grupo será eliminado permanentemente."
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}
