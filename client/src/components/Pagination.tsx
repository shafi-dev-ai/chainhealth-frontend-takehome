import type { Pagination as PaginationType } from '../types'

type PaginationProps = {
  pagination: PaginationType | null
  onPageChange: (page: number) => void
}

function Pagination({ pagination, onPageChange }: PaginationProps) {
  if (!pagination || pagination.totalPages <= 1) {
    return null
  }

  const { page, totalPages, hasMore } = pagination

  return (
    <div className="pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="current">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={!hasMore}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
