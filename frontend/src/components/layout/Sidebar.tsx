'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { ComponentType, SVGProps } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children?: { label: string; href: string }[];
  roles?: string[]; // Roles que pueden ver este item
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Navegación del Sistema de Cursos Vacacionales
 *
 * Roles:
 * - administrador: Ve todo el sistema
 * - tutor: Ve sus participantes
 * - instructor: Ve sus grupos y puede tomar asistencia
 */
const allNavItems: NavItem[] = [
  // === DASHBOARD (TODOS) ===
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: ChartBarIcon,
  },

  // === ITEMS PARA TUTORES ===
  {
    label: 'Mis Participantes',
    href: '/mis-participantes',
    icon: UserGroupIcon,
    roles: ['tutor'],
  },
  {
    label: 'Mis Inscripciones',
    href: '/mis-inscripciones',
    icon: ClipboardDocumentListIcon,
    roles: ['tutor'],
  },
  {
    label: 'Inscribir en Curso',
    href: '/inscribir',
    icon: AcademicCapIcon,
    roles: ['tutor'],
  },

  // === ITEMS PARA INSTRUCTORES ===
  {
    label: 'Mis Grupos',
    href: '/mis-grupos',
    icon: UserGroupIcon,
    roles: ['instructor'],
  },

  // === ITEMS PARA ADMIN ===
  {
    label: 'Cursos',
    icon: AcademicCapIcon,
    roles: ['administrador'],
    children: [
      { label: 'Lista de Cursos', href: '/cursos' },
      { label: 'Grupos', href: '/cursos/grupos' },
      { label: 'Inscripciones', href: '/cursos/inscripciones' },
    ],
  },
  {
    label: 'Participantes',
    icon: UserGroupIcon,
    roles: ['administrador'],
    children: [
      { label: 'Categorías', href: '/deportistas/categorias' },
    ],
  },
  {
    label: 'Finanzas',
    icon: CurrencyDollarIcon,
    roles: ['administrador'],
    children: [{ label: 'Facturas', href: '/finanzas/facturas' }],
  },
  {
    label: 'Sistema',
    icon: Cog6ToothIcon,
    roles: ['administrador'],
    children: [
      { label: 'Usuarios', href: '/sistema/usuarios' },
      { label: 'Roles', href: '/sistema/roles' },
    ],
  },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Filtrar items según el rol del usuario
  const navItems = useMemo(() => {
    // Si está cargando, mostrar solo Dashboard
    if (isLoading || !user) {
      return allNavItems.filter(
        (item) => !item.roles || item.roles.length === 0
      );
    }

    const userRole = user?.rol?.slug || '';

    return allNavItems.filter((item) => {
      // Si no tiene roles definidos, es visible para todos
      if (!item.roles || item.roles.length === 0) return true;
      // Verificar si el rol del usuario está en la lista de roles permitidos
      return item.roles.includes(userRole);
    });
  }, [user, isLoading]);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      navItems.forEach((item) => {
        if (item.children?.some((child) => pathname.startsWith(child.href))) {
          setExpandedItems((prev) =>
            prev.includes(item.label) ? prev : [...prev, item.label]
          );
        }
      });
    }
  }, [pathname, isOpen, mounted, navItems]);

  const toggleExpand = (label: string) => {
    if (!isOpen) {
      onToggle();
      setExpandedItems([label]);
      return;
    }
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  if (!mounted) {
    return (
      <aside
        className="relative top-0 left-0 z-50 h-screen w-64 shrink-0"
        style={{ backgroundColor: '#1e1b4b' }}
      />
    );
  }

  if (isMobile && !isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg text-white shadow-lg"
        style={{ backgroundColor: '#1e1b4b' }}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onToggle} />
      )}

      <aside
        className={`
          ${
            isMobile ? 'fixed' : 'relative'
          } top-0 left-0 z-50 h-screen text-white
          flex flex-col transition-all duration-300 ease-in-out shrink-0
          ${isOpen ? 'w-64' : 'w-16'}
        `}
        style={{ backgroundColor: '#1e1b4b' }}
      >
        <div
          className={`flex items-center h-14 px-3 shrink-0 ${
            isOpen ? 'justify-between' : 'justify-center'
          }`}
        >
          {isOpen && (
            <span className="text-lg font-bold">Cursos Vacacionales</span>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isOpen ? (
              <ChevronLeftIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="h-2 shrink-0"></div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      title={!isOpen ? item.label : undefined}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                        ${isOpen ? '' : 'justify-center'}
                        ${
                          item.children.some((c) => isActive(c.href))
                            ? 'bg-indigo-600 text-white'
                            : 'text-white/80 hover:bg-white/10'
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {isOpen && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDownIcon
                            className={`h-4 w-4 transition-transform ${
                              expandedItems.includes(item.label)
                                ? 'rotate-180'
                                : ''
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {isOpen && expandedItems.includes(item.label) && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={`
                                block px-3 py-1.5 rounded-lg text-sm transition-all
                                ${
                                  pathname === child.href
                                    ? 'bg-indigo-500/50 text-white'
                                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                                }
                              `}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || '#'}
                    title={!isOpen ? item.label : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                      ${isOpen ? '' : 'justify-center'}
                      ${
                        item.href && isActive(item.href)
                          ? 'bg-indigo-600 text-white'
                          : 'text-white/80 hover:bg-white/10'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Info del usuario */}
        {isOpen && user && (
          <div className="px-3 py-3 border-t border-white/10">
            <p className="text-sm font-medium truncate">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-xs text-white/60 truncate">
              {user.rol?.nombre || 'Usuario'}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
