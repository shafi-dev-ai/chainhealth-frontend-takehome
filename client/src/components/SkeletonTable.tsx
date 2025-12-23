type SkeletonTableProps = {
  rows?: number
  columns?: number
}

function SkeletonTable({ rows = 6, columns = 6 }: SkeletonTableProps) {
  const rowItems = Array.from({ length: rows })
  const colItems = Array.from({ length: columns })

  return (
    <div className="table-container">
      <div className="table-skeleton">
        {rowItems.map((_, rowIndex) => (
          <div
            className="skeleton-row"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            key={`row-${rowIndex}`}
          >
            {colItems.map((__, colIndex) => (
              <span className="skeleton-cell" key={`cell-${rowIndex}-${colIndex}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SkeletonTable
