// Prev / next buttons for a `pagination` block returned by the API.
export default function Pager({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null
  const { page, totalPages, total } = pagination
  return (
    <div className="pager">
      <button className="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span className="muted">
        Page {page} of {totalPages} · {total} total
      </span>
      <button className="secondary" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  )
}
