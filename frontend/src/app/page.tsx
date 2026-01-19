'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cursosService } from '@/services/cursos.service';
import { authService } from '@/services/auth.service';
import type { Curso, GrupoCurso } from '@/types';

const PRIMARY = '#1e1b4b';
const ACCENT = '#4f46e5';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(n);
}

function formatTime(t: string) {
  if (!t) return '';
  const parts = t.split(':');
  const hr = parseInt(parts[0]);
  const min = parts[1];
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const h12 = hr % 12 || 12;
  return h12 + ':' + min + ' ' + ampm;
}

function getDias(dias: string[] | number[] | undefined) {
  if (!dias || dias.length === 0) return 'Por definir';
  const map: Record<string, string> = {
    '0': 'Dom',
    '1': 'Lun',
    '2': 'Mar',
    '3': 'Mie',
    '4': 'Jue',
    '5': 'Vie',
    '6': 'Sab',
  };
  return dias.map((d) => map[String(d)] || String(d)).join(', ');
}

function CursoCard({
  curso,
  onVer,
  onIns,
}: {
  curso: Curso;
  onVer: (c: Curso) => void;
  onIns: (id: number) => void;
}) {
  const cupos = (curso.cupo_maximo || 0) - (curso.cupo_actual || 0);
  const tipoClass =
    curso.tipo === 'vacacional'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-indigo-100 text-indigo-800';
  const cuposClass = cupos <= 5 ? 'text-red-600' : 'text-green-600';

  return (
    <div className="bg-white border border-gray-200 hover:border-gray-300 transition">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className={'text-xs font-medium px-2 py-1 ' + tipoClass}>
            {curso.tipo === 'vacacional' ? 'VACACIONAL' : 'PERMANENTE'}
          </span>
          {curso.cupo_maximo && (
            <span className={'text-xs font-medium ' + cuposClass}>
              {cupos} cupos
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          {curso.nombre}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {curso.descripcion || 'Curso de formacion vacacional.'}
        </p>
        <div className="text-xs text-gray-500 mb-4">
          {formatDate(curso.fecha_inicio)} - {formatDate(curso.fecha_fin)}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-lg font-semibold">
            {formatCurrency(curso.precio || 0)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onVer(curso)}
              className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Ver mas
            </button>
            <button
              onClick={() => onIns(curso.id_curso)}
              className="px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: ACCENT }}
            >
              Inscribirse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [selCurso, setSelCurso] = useState<Curso | null>(null);
  const [grupos, setGrupos] = useState<GrupoCurso[]>([]);
  const [loadingG, setLoadingG] = useState(false);
  const [selGrupo, setSelGrupo] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuth(authService.isAuthenticated());
    cursosService
      .getCursosAbiertos()
      .then(setCursos)
      .catch(() => setCursos([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleVer(curso: Curso) {
    setSelCurso(curso);
    setSelGrupo(null);
    setLoadingG(true);
    try {
      const g = await cursosService.getGruposPublico(curso.id_curso);
      setGrupos(g || []);
    } catch {
      setGrupos([]);
    } finally {
      setLoadingG(false);
    }
  }

  function handleIns(cursoId: number, grupoId?: number) {
    if (isAuth) {
      const p = new URLSearchParams({ curso: String(cursoId) });
      if (grupoId) p.append('grupo', String(grupoId));
      // Redirigir a la página de inscripción para tutores
      router.push('/inscribir?' + p.toString());
    } else {
      router.push('/registro');
    }
  }

  const filtered = useMemo(() => {
    return cursos.filter((c) => {
      const matchS =
        c.nombre.toLowerCase().includes(search.toLowerCase()) ||
        c.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        false;
      return matchS && (filter === 'todos' || c.tipo === filter);
    });
  }, [cursos, search, filter]);

  const getFilterClass = (f: string) => {
    if (filter === f) {
      return f === 'vacacional'
        ? 'border-amber-600 bg-amber-600 text-white'
        : 'border-indigo-600 bg-indigo-600 text-white';
    }
    return 'border-gray-200 bg-white text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 w-full bg-white z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <Link
              href="/"
              className="text-base font-semibold"
              style={{ color: PRIMARY }}
            >
              Cursos Vacacionales
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#cursos" className="text-gray-600 hover:text-gray-900">
                Cursos
              </a>
              <a href="#proceso" className="text-gray-600 hover:text-gray-900">
                Proceso
              </a>
              <a href="#contacto" className="text-gray-600 hover:text-gray-900">
                Contacto
              </a>
            </div>
            <div className="flex items-center gap-2">
              {isAuth ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-white text-sm font-medium"
                  style={{ backgroundColor: PRIMARY }}
                >
                  Mi Panel
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hidden sm:block"
                  >
                    Iniciar sesion
                  </Link>
                  <Link
                    href="/registro"
                    className="px-4 py-2 text-white text-sm font-medium"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    Registrarse
                  </Link>
                </>
              )}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100 text-sm">
              <a
                href="#cursos"
                className="block py-2 text-gray-600"
                onClick={() => setMenuOpen(false)}
              >
                Cursos
              </a>
              <a
                href="#proceso"
                className="block py-2 text-gray-600"
                onClick={() => setMenuOpen(false)}
              >
                Proceso
              </a>
              <a
                href="#contacto"
                className="block py-2 text-gray-600"
                onClick={() => setMenuOpen(false)}
              >
                Contacto
              </a>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-14" style={{ backgroundColor: PRIMARY }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-indigo-300 text-sm font-medium mb-3">
              Inscripciones Abiertas 2026
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Cursos Vacacionales para Niños y Jovenes
            </h1>
            <p className="text-indigo-200 mb-8">
              Actividades deportivas, artisticas y recreativas con instructores
              certificados.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#cursos"
                className="px-6 py-3 bg-white text-sm font-medium text-center"
                style={{ color: PRIMARY }}
              >
                Ver Cursos
              </a>
              {!isAuth && (
                <Link
                  href="/registro"
                  className="px-6 py-3 border border-white/30 text-white text-sm font-medium text-center hover:bg-white/10"
                >
                  Crear Cuenta
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="proceso" className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Proceso de Inscripcion
            </h2>
            <p className="text-gray-500 text-sm">3 pasos simples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div
                className="w-12 h-12 flex items-center justify-center text-white text-lg font-semibold mx-auto mb-4"
                style={{ backgroundColor: PRIMARY }}
              >
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Registrate</h3>
              <p className="text-sm text-gray-500">
                Crea tu cuenta como padre o tutor
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-12 h-12 flex items-center justify-center text-white text-lg font-semibold mx-auto mb-4"
                style={{ backgroundColor: PRIMARY }}
              >
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Registra a tu hijo
              </h3>
              <p className="text-sm text-gray-500">
                Agrega los datos del participante
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-12 h-12 flex items-center justify-center text-white text-lg font-semibold mx-auto mb-4"
                style={{ backgroundColor: PRIMARY }}
              >
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Inscribelo</h3>
              <p className="text-sm text-gray-500">
                Selecciona el curso y paga
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="cursos" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cursos Disponibles
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('todos')}
                className={
                  'px-4 py-2.5 text-sm font-medium border transition ' +
                  getFilterClass('todos')
                }
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('vacacional')}
                className={
                  'px-4 py-2.5 text-sm font-medium border transition ' +
                  getFilterClass('vacacional')
                }
              >
                Vacacionales
              </button>
              <button
                onClick={() => setFilter('permanente')}
                className={
                  'px-4 py-2.5 text-sm font-medium border transition ' +
                  getFilterClass('permanente')
                }
              >
                Permanentes
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-indigo-600 animate-spin rounded-full" />
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.slice(0, 5).map((c) => (
                  <CursoCard
                    key={c.id_curso}
                    curso={c}
                    onVer={handleVer}
                    onIns={handleIns}
                  />
                ))}
              </div>
              {filtered.length > 5 && (
                <div className="mt-8 text-center">
                  <Link
                    href="/cursos"
                    className="inline-block px-6 py-3 text-sm font-medium text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Ver todos los cursos ({filtered.length})
                  </Link>
                </div>
              )}
            </>
          
          ) : (
            <div className="text-center py-16 bg-white border border-gray-200">
              <p className="text-gray-900 font-medium mb-1">
                No hay cursos disponibles
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Registrate para recibir notificaciones
              </p>
              <Link
                href="/registro"
                className="inline-block px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: PRIMARY }}
              >
                Registrarme
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Por que elegirnos
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200">
              <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Instructores Certificados
              </h3>
              <p className="text-sm text-gray-500">
                Personal capacitado con experiencia.
              </p>
            </div>
            <div className="p-6 border border-gray-200">
              <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Grupos Reducidos
              </h3>
              <p className="text-sm text-gray-500">
                Maximo 15 ninos por grupo.
              </p>
            </div>
            <div className="p-6 border border-gray-200">
              <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 mb-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Horarios Flexibles
              </h3>
              <p className="text-sm text-gray-500">
                Multiples opciones disponibles.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-16 px-4 sm:px-6"
        style={{ backgroundColor: PRIMARY }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Listo para inscribir a tu hijo?
          </h2>
          <p className="text-indigo-200 mb-6 text-sm">
            Los cupos son limitados.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuth ? (
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white text-sm font-medium"
                style={{ color: PRIMARY }}
              >
                Ir a Mi Panel
              </Link>
            ) : (
              <>
                <Link
                  href="/registro"
                  className="px-6 py-3 bg-white text-sm font-medium"
                  style={{ color: PRIMARY }}
                >
                  Crear Cuenta
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 border border-white/30 text-white text-sm font-medium hover:bg-white/10"
                >
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="contacto" className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Contacto
              </h2>
              <p className="text-gray-500 text-sm mb-6">Tienes preguntas?</p>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span>info@cursos-vacacionales.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <span>+593 99 999 9999</span>
                </div>
              </div>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Tu mensaje"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-white text-sm font-medium"
                style={{ backgroundColor: PRIMARY }}
              >
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 sm:px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-gray-500">
            2026 Cursos Vacacionales
          </span>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700">
              Terminos
            </a>
            <a href="#" className="hover:text-gray-700">
              Privacidad
            </a>
          </div>
        </div>
      </footer>

      {selCurso && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSelCurso(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-xl">
              <div
                className="p-6 border-b"
                style={{ backgroundColor: PRIMARY }}
              >
                <button
                  onClick={() => setSelCurso(null)}
                  className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-white/20 text-white mb-2">
                  {selCurso.tipo === 'vacacional' ? 'VACACIONAL' : 'PERMANENTE'}
                </span>
                <h2 className="text-xl font-semibold text-white">
                  {selCurso.nombre}
                </h2>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Fechas</p>
                    <p className="text-sm font-medium">
                      {formatDate(selCurso.fecha_inicio)} -{' '}
                      {formatDate(selCurso.fecha_fin)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Cupos</p>
                    <p className="text-sm font-medium">
                      {selCurso.cupo_actual || 0} /{' '}
                      {selCurso.cupo_maximo || 'Ilimitado'}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Descripcion</h3>
                  <p className="text-sm text-gray-600">
                    {selCurso.descripcion || 'Curso de formacion vacacional.'}
                  </p>
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Horarios</h3>
                  {loadingG ? (
                    <div className="flex justify-center py-6">
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-600 animate-spin rounded-full" />
                    </div>
                  ) : grupos.length > 0 ? (
                    <div className="space-y-2">
                      {grupos.map((g) => {
                        const cupos = g.cupo_maximo - (g.cupo_actual || 0);
                        const isFull = cupos <= 0;
                        const isSel = selGrupo === g.id_grupo;
                        const btnClass = isFull
                          ? 'opacity-50 cursor-not-allowed'
                          : isSel
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300';
                        const cuposClass = isFull
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700';
                        return (
                          <button
                            key={g.id_grupo}
                            onClick={() =>
                              !isFull && setSelGrupo(isSel ? null : g.id_grupo)
                            }
                            disabled={isFull}
                            className={
                              'w-full p-3 text-left border transition ' +
                              btnClass
                            }
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-sm">
                                  {g.nombre}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTime(g.hora_inicio || '')} -{' '}
                                  {formatTime(g.hora_fin || '')} |{' '}
                                  {getDias(g.dias_semana)}
                                </p>
                              </div>
                              <span
                                className={
                                  'text-xs font-medium px-2 py-1 ' + cuposClass
                                }
                              >
                                {isFull ? 'Lleno' : cupos + ' cupos'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50">
                      No hay horarios
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Precio</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(selCurso.precio || 0)}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleIns(selCurso.id_curso, selGrupo || undefined)
                    }
                    disabled={grupos.length > 0 && !selGrupo}
                    className="px-6 py-2.5 text-white text-sm font-medium disabled:opacity-50"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {isAuth ? 'Inscribirse' : 'Registrarse'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
