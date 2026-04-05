import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  currentQuery?: string;
}

export default function Pagination({ currentPage, totalCount, pageSize, currentQuery }: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRange = (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalCount);

  if (totalCount === 0) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (currentQuery) params.set('q', currentQuery);
    params.set('p', page.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="relative inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-hover"
          >
            Anterior
          </Link>
        ) : <div />}
        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="relative ml-3 inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-surface-hover"
          >
            Siguiente
          </Link>
        ) : <div />}
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{startRange}</span> a{' '}
            <span className="font-semibold text-foreground">{endRange}</span> de{' '}
            <span className="font-semibold text-foreground">{totalCount}</span> resultados
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Link
              href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-surface-hover focus:z-20 focus:outline-offset-0 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              <span className="sr-only">Anterior</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </Link>
            
            <div className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border focus:outline-offset-0">
              Página {currentPage} de {totalPages}
            </div>

            <Link
              href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-surface-hover focus:z-20 focus:outline-offset-0 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
            >
              <span className="sr-only">Siguiente</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
