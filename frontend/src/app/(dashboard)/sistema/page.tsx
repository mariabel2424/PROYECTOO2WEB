'use client';

import Link from 'next/link';
import {
  Cog6ToothIcon,
  UsersIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout';

export default function SistemaPage() {
  const secciones = [
    {
      titulo: 'Usuarios',
      descripcion: 'Gestión de usuarios del sistema',
      href: '/sistema/usuarios',
      icon: UsersIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      titulo: 'Roles',
      descripcion: 'Administración de roles y permisos',
      href: '/sistema/roles',
      icon: ShieldCheckIcon,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      titulo: 'Configuración',
      descripcion: 'Configuración general del sistema',
      href: '/sistema/configuracion',
      icon: Cog6ToothIcon,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <WrenchScrewdriverIcon className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Sistema</h1>
            <p className="text-xs text-gray-500">
              Configuración y administración
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {secciones.map((seccion) => (
            <Link
              key={seccion.href}
              href={seccion.href}
              className="block p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div
                className={`inline-flex p-2.5 rounded-lg ${seccion.bgColor} mb-3`}
              >
                <seccion.icon className={`h-5 w-5 ${seccion.iconColor}`} />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">
                {seccion.titulo}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {seccion.descripcion}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
