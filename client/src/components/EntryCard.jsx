import { Link } from 'react-router-dom'

// One knowledge entry as a card; links to the detail page.
export default function EntryCard({ entry }) {
  return (
    <Link to={`/entries/${entry._id}`} className="card entry-card">
      <h3>{entry.title}</h3>
      <p className="muted">
        {entry.source} · {entry.sourceType} · {entry.lessons.length} lesson
        {entry.lessons.length === 1 ? '' : 's'}
      </p>
      <div className="chips">
        <span className="chip">{entry.category}</span>
        {entry.tags.map((t) => (
          <span key={t} className="chip chip-tag">
            #{t}
          </span>
        ))}
      </div>
    </Link>
  )
}
