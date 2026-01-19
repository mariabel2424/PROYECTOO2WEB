'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Alert } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    // Capturar el redirect URL de los parámetros
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      // Redirigir a la URL guardada o al dashboard
      router.push(redirectUrl || '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Imagen de fondo a la izquierda */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/fondo-login.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Formulario a la derecha */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 bg-white">
        <div className="w-full max-w-sm p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-500 mt-1">Accede a tu cuenta</p>
          </div>

          {redirectUrl && (
            <Alert variant="info" className="mb-4">
              Inicia sesión para continuar con la inscripción
            </Alert>
          )}

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo electrónico"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="border-gray-300" />
                <span className="text-gray-500">Recordarme</span>
              </label>
              <Link
                href="/recuperar-password"
                className="text-gray-500 hover:text-gray-900 transition"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-gray-900 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
