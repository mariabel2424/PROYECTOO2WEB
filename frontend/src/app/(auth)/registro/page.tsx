'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Alert } from '@/components/ui';

export default function RegistroPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    cedula: '',
    telefono: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      router.push('/mis-participantes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:block w-[30%] relative overflow-hidden">
        <Image
          src="/registro.jpg"
          alt=""
          fill
          className="object-top scale-125"
          priority
        />
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Crear cuenta
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Regístrate para inscribir a tus hijos en nuestros cursos
              vacacionales
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                name="nombre"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido"
                name="apellido"
                placeholder="Tu apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cédula"
                name="cedula"
                placeholder="1234567890"
                value={formData.cedula}
                onChange={handleChange}
              />
              <Input
                label="Teléfono"
                name="telefono"
                placeholder="0999999999"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Contraseña"
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              name="password_confirmation"
              placeholder="Repite tu contraseña"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Crear cuenta
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-indigo-600 hover:underline font-medium"
            >
              Inicia sesión
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            Al registrarte podrás inscribir a tus hijos en los cursos
            disponibles
          </p>
        </div>
      </div>
    </div>
  );
}
