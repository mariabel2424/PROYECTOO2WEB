import { useState, useMemo } from 'react';
import { Button, Spinner } from '@/components/ui';
import { CursoCard } from './CursoCard';
import { GrupoCard } from './GrupoCard';
import { Pagination } from './Pagination';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Curso, GrupoCurso } from '@/types';

interface CursoStepProps {
  cursos: Curso[];
  grupos: GrupoCurso[];
  selectedCurso: number | null;
  selectedGrupo: number | null;
  loadingGrupos: boolean;
  onCursoSelect: (id: number) => void;
  onGrupoSelect: (id: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

const ITEMS_PER_PAGE = 5;

export function CursoStep({
  cursos,
  grupos,
  selectedCurso,
  selectedGrupo,
  loadingGrupos,
  onCursoSelect,
  onGrupoSelect,
  onBack,
  onContinue,
}: CursoStepProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCursos = useMemo(() => {
    if (!searchTerm.trim()) return cursos;
    
    const term = searchTerm.toLowerCase();
    return cursos.filter((curso) => {
      const nombre = curso.nombre?.toLowerCase() || '';
      const descripcion = curso.descripcion?.toLowerCase() || '';
      return nombre.includes(term) || descripcion.includes(term);
    });
  }, [cursos, searchTerm]);

  const totalPages = Math.ceil(filteredCursos.length / ITEMS_PER_PAGE);
  const paginatedCursos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCursos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCursos, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-gray-900">
          Selecciona el curso y horario
        </h2>
        {cursos.length > 0 && (
          <span className="text-sm text-gray-500">
            {filteredCursos.length} de {cursos.length} curso
            {cursos.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Search Bar */}
      {cursos.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar curso por nombre o descripción..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {filteredCursos.length === 0 && searchTerm ? (
        <div className="text-center py-12 text-gray-500">
          <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No se encontraron cursos</p>
          <p className="text-sm mt-1">
            Intenta con otros términos de búsqueda
          </p>
          <button
            onClick={clearSearch}
            className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : cursos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No hay cursos disponibles en este momento</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedCursos.map((curso) => (
              <CursoCard
                key={curso.id_curso}
                curso={curso}
                isSelected={selectedCurso === curso.id_curso}
                onSelect={onCursoSelect}
                searchTerm={searchTerm}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {selectedCurso && (
        <div className="space-y-2 pt-4 border-t">
          <label className="text-sm font-medium text-gray-900">
            Selecciona un horario
          </label>
          {loadingGrupos ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : grupos.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">
              No hay horarios disponibles para este curso
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {grupos.map((grupo) => (
                  <GrupoCard
                    key={grupo.id_grupo}
                    grupo={grupo}
                    isSelected={selectedGrupo === grupo.id_grupo}
                    onSelect={onGrupoSelect}
                  />
                ))}
              </div>
              {grupos.length > 3 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  {grupos.length} horarios disponibles
                </p>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          Atrás
        </Button>
        <Button onClick={onContinue} disabled={!selectedGrupo}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
