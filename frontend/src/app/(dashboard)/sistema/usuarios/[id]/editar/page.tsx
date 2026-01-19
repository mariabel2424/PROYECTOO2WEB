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
import { usuariosService, rolesService } from '@/services/usuarios.service';
import type { Rol } from '@/types';

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<Rol[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    cedula: '',
    telefono: '',
    direccion: '',
    id_rol: '',
    estado: 'activo',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuario, rolesData] = await Promise.all([
          usuariosService.getById(id),
          rolesService.getAll(),
        ]);
        setRoles(rolesData);
        setFormData({
          nombre: usuario.nombre || '',
          apellido: usuario.apellido || '',
          email: usuario.email || '',
          cedula: usuario.cedula || '',
          telefono: usuario.telefono || '',
          direccion: usuario.direccion || '',
          id_rol: usuario.id_rol ? String(usuario.id_rol) : '',
          estado: usuario.status || 'activo',
        });
      } catch (err) {
        setError('Error al cargar el usuario');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await usuariosService.update(id, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        cedula: formData.cedula || undefined,
        telefono: formData.telefono || undefined,
        direccion: formData.direccion || undefined,
        id_rol: formData.id_rol ? parseInt(formData.id_rol) : undefined,
        status: formData.estado as 'activo' | 'inactivo' | 'suspendido',
      });
      router.push('/sistema/usuarios');
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
            <CardTitle>Editar Usuario</CardTitle>
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
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Cédula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                />
                <Input
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
              <Input
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Rol"
                  name="id_rol"
                  value={formData.id_rol}
                  onChange={handleChange}
                  placeholder="Seleccionar rol"
                  options={roles.map((r) => ({
                    value: r.id_rol,
                    label: r.nombre,
                  }))}
                />
                <Select
                  label="Estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  options={[
                    { value: 'activo', label: 'Activo' },
                    { value: 'inactivo', label: 'Inactivo' },
                    { value: 'suspendido', label: 'Suspendido' },
                  ]}
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
