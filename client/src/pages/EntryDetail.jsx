import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'

// OWNER: Atul
// Reflections per lesson come from Vansh's GET /api/reflections/by-lesson/:lessonId.
// Until that endpoint exists (501) the fetch fails and the lesson just shows no reflections.
function Reflections({ lessonId }) {
  const [items, setItems] = useState([])
  useEffect(() => {
    api
      .get(`/reflections/by-lesson/${lessonId}`)
      .then(({ data }) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
  }, [lessonId])

  if (items.length === 0) return null
  return (
    <ul className="reflections">
      {items.map((r) => (
        <li key={r._id}>
          <span className="chip">{r.mood}</span> {r.text}
        </li>
      ))}
    </ul>
  )
}

export default function EntryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/knowledge/${id}`)
      .then(({ data }) => setEntry(data))
      .catch((e) => setError(e.message))
  }, [id])

  const remove = async () => {
    if (!window.confirm(`Delete "${entry.title}" and all its lessons?`)) return
    try {
      await api.delete(`/knowledge/${id}`)
      navigate('/')
    } catch (e) {
      setError(e.message)
    }
  }

  if (error) return <p className="error">{error}</p>
  if (!entry) return <p className="muted">Loading…</p>

  return (
    <section>
      <div className="row-between">
        <h1>{entry.title}</h1>
        <div className="row">
          <Link to={`/entries/${id}/edit`}>
            <button className="secondary">Edit</button>
          </Link>
          <button className="danger" onClick={remove}>
            Delete
          </button>
        </div>
      </div>
      <p className="muted">
        {entry.source} · {entry.sourceType}
      </p>
      <div className="chips">
        <span className="chip">{entry.category}</span>
        {entry.tags.map((t) => (
          <span key={t} className="chip chip-tag">
            #{t}
          </span>
        ))}
      </div>

      <h2>Lessons ({entry.lessons.length})</h2>
      {entry.lessons.length === 0 && <p className="muted">No lessons yet. Edit the entry to add some.</p>}
      {entry.lessons.map((l) => (
        <article key={l._id} className="card lesson">
          <p>{l.lessonText}</p>
          {l.context && <p className="muted">{l.context}</p>}
          <div className="recall">
            <div className="bar" role="img" aria-label={`Recall score ${l.recallScore} of 100`}>
              <div style={{ width: `${l.recallScore}%` }} />
            </div>
            <span className="muted">
              Recall {l.recallScore}/100 · remembered {l.timesRecalled}× · forgot {l.timesForgotten}×
              {l.pageNumber != null && ` · p. ${l.pageNumber}`}
            </span>
          </div>
          <Reflections lessonId={l._id} />
        </article>
      ))}
    </section>
  )
}
