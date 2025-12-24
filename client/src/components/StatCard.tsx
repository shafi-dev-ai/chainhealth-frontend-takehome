type StatCardProps = {
  label: string
  value: string | number
  note?: string
}

function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="label">{label}</p>
      <p className="value">{value}</p>
      {note ? <p className="meta">{note}</p> : null}
    </div>
  )
}

export default StatCard
