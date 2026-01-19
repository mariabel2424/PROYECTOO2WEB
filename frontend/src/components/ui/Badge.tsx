'use client';

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}

// Helper para estados comunes
export function EstadoBadge({ estado }: { estado?: string | null }) {
  if (!estado) {
    return <Badge variant="default">-</Badge>;
  }

  const getVariant = (): BadgeProps['variant'] => {
    switch (estado.toLowerCase()) {
      case 'activo':
      case 'pagada':
      case 'verificado':
      case 'finalizado':
      case 'disponible':
        return 'success';
      case 'pendiente':
      case 'en_curso':
      case 'programado':
        return 'warning';
      case 'inactivo':
      case 'cancelado':
      case 'anulada':
      case 'rechazado':
      case 'suspendido':
        return 'danger';
      default:
        return 'default';
    }
  };

  return <Badge variant={getVariant()}>{estado}</Badge>;
}
