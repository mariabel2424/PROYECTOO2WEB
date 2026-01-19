'use client';

import Link from 'next/link';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout';

export default function FinanzasPage() {
  const secciones = [
    {
      titulo: 'Pagos',
      descripcion: 'Gestión de pagos y cobros',
      href: '/finanzas/pagos',
      icon: CreditCardIcon,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      titulo: 'Facturas',
      descripcion: 'Administración de facturas',
      href: '/finanzas/facturas',
      icon: DocumentTextIcon,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CurrencyDollarIcon className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Finanzas</h1>
            <p className="text-xs text-gray-500">
              Gestión financiera del sistema
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
