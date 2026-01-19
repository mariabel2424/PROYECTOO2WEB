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
import { deportistasService } from '@/services/deportistas.service';
import { categoriasService } from '@/services/categorias.service';
import type { Categoria } from '@/types';

export default function EditarDeportistaPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    fecha_nacimiento: '',
    genero: 'M' as 'M' | 'F',
    direccion: '',
    telefono: '',
    email: '',
    peso: '',
    altura: '',
    tipo_sangre: '',
    alergias: '',
    enfermedades: '',
    id_categoria: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deportista, cats] = await Promise.all([
          deportistasService.getById(id),
          categoriasService.getAll(),
        ]);
        setCategorias(cats);
        setFormData({
          nombres: deportista.nombres || '',
          apellidos: deportista.apellidos || '',
          cedula: deportista.cedula || '',
          fecha_nacimiento: deportista.fecha_nacimiento || '',
          genero: deportista.genero || 'M',
          direccion: deportista.direccion || '',
          telefono: deportista.telefono || '',
          email: deportista.email || '',
          peso: deportista.peso ? String(deportista.peso) : '',
          altura: deportista.altura ? String(deportista.altura) : '',
          tipo_sangre: deportista.tipo_sangre || '',
          alergias: deportista.alergias || '',
          enfermedades: deportista.enfermedades || '',
          id_categoria: deportista.id_categoria
            ? String(deportista.id_categoria)
            : '',
        });
      } catch (err) {
        setError('Error al cargar el deportista');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
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
      await deportistasService.update(id, {
        ...formData,
        genero: formData.genero as 'M' | 'F',
        peso: formData.peso ? parseFloat(formData.peso) : undefined,
        altura: formData.altura ? parseFloat(formData.altura) : undefined,
        id_categoria: formData.id_categoria
          ? parseInt(formData.id_categoria)
          : undefined,
      });
      router.push('/deportistas');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar';
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
            <CardTitle>Editar Deportista</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
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
                  label="Cédula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                />
                <Input
                  label="Fecha de Nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Género"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  options={[
                    { value: 'M', label: 'Masculino' },
                    { value: 'F', label: 'Femenino' },
                  ]}
                />
                <Select
                  label="Categoría"
                  name="id_categoria"
                  value={formData.id_categoria}
                  onChange={handleChange}
                  placeholder="Seleccionar"
                  options={categorias.map((c) => ({
                    value: c.id_categoria,
                    label: c.nombre,
                  }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <Input
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Peso (kg)"
                  name="peso"
                  type="number"
                  step="0.1"
                  value={formData.peso}
                  onChange={handleChange}
                />
                <Input
                  label="Altura (cm)"
                  name="altura"
                  type="number"
                  step="0.1"
                  value={formData.altura}
                  onChange={handleChange}
                />
                <Input
                  label="Tipo de Sangre"
                  name="tipo_sangre"
                  value={formData.tipo_sangre}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alergias
                </label>
                <textarea
                  name="alergias"
                  value={formData.alergias}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enfermedades
                </label>
                <textarea
                  name="enfermedades"
                  value={formData.enfermedades}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
