'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { cursosService } from '@/services/cursos.service';

export default function EditarCursoPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    representante: '',
    email_representante: '',
    telefono_representante: '',
    tipo: 'vacacional' as 'vacacional' | 'permanente',
    precio: '',
    cupo_maximo: '',
    estado: 'abierto',
  });

  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const curso = await cursosService.getById(id);
        setFormData({
          nombre: curso.nombre || '',
          descripcion: curso.descripcion || '',
          fecha_inicio: curso.fecha_inicio || '',
          fecha_fin: curso.fecha_fin || '',
          representante: curso.representante || '',
          email_representante: curso.email_representante || '',
          telefono_representante: curso.telefono_representante || '',
          tipo: curso.tipo || 'vacacional',
          precio: String(curso.precio || ''),
          cupo_maximo: curso.cupo_maximo ? String(curso.cupo_maximo) : '',
          estado: curso.estado || 'abierto',
        });
      } catch (err) {
        setError('Error al cargar el curso');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchCurso();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await cursosService.update(id, {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        representante: formData.representante,
        email_representante: formData.email_representante || undefined,
        telefono_representante: formData.telefono_representante || undefined,
        tipo: formData.tipo,
        precio: formData.precio ? parseFloat(formData.precio) : undefined,
        cupo_maximo: formData.cupo_maximo
          ? parseInt(formData.cupo_maximo)
          : undefined,
      });
      router.push('/cursos');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar el curso';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Editar Curso Vacacional</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre del Curso"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Fecha Inicio"
                  name="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Fecha Fin"
                  name="fecha_fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  required
                />
              </div>
              <Select
                label="Tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                options={[
                  { value: 'vacacional', label: 'Vacacional' },
                  { value: 'permanente', label: 'Permanente' },
                ]}
              />
              <Input
                label="Representante"
                name="representante"
                value={formData.representante}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email Representante"
                  name="email_representante"
                  type="email"
                  value={formData.email_representante}
                  onChange={handleChange}
                />
                <Input
                  label="Teléfono Representante"
                  name="telefono_representante"
                  value={formData.telefono_representante}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Precio ($)"
                  name="precio"
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={handleChange}
                />
                <Input
                  label="Cupo Máximo"
                  name="cupo_maximo"
                  type="number"
                  value={formData.cupo_maximo}
                  onChange={handleChange}
                  placeholder="Sin límite"
                />
              </div>
              <Select
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                options={[
                  { value: 'abierto', label: 'Abierto' },
                  { value: 'cerrado', label: 'Cerrado' },
                  { value: 'en_proceso', label: 'En Proceso' },
                  { value: 'cancelado', label: 'Cancelado' },
                ]}
              />
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
