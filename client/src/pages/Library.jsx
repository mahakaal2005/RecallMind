import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import EntryCard from '../components/EntryCard'
import Pager from '../components/Pager'

// OWNER: Atul
const EMPTY = { category: '', source: '', tags: '' }

export default function Library() {
  const [draft, setDraft] = useState(EMPTY) // what's typed in the filter form
  const [filters, setFilters] = useState(EMPTY) // what's applied to the query
  const [sort, setSort] = useState('createdAt:desc')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ data: [], pagination: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const [sortBy, order] = sort.split(':')
    const params = new URLSearchParams({ page, limit: 9, sortBy, order })
    for (const [k, v] of Object.entries(filters)) if (v.trim()) params.set(k, v.trim())

    let stale = false
    setLoading(true)
    setError('')
    api
      .get(`/knowledge?${params}`)
      .then((body) => !stale && setResult(body))
      .catch((e) => !stale && setError(e.message))
      .finally(() => !stale && setLoading(false))
    return () => {
      stale = true
    }
  }, [filters, sort, page])

  const applyFilters = (e) => {
    e.preventDefault()
    setPage(1)
    setFilters(draft)
  }
  const clearFilters = () => {
    setDraft(EMPTY)
    setFilters(EMPTY)
    setPage(1)
  }
  const field = (name, placeholder) => (
    <input
      placeholder={placeholder}
      value={draft[name]}
      onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
    />
  )

  return (
    <section>
      <div className="row-between">
        <h1>Knowledge Library</h1>
        <Link to="/add">
          <button>+ Add entry</button>
        </Link>
      </div>

      <form className="card filters" onSubmit={applyFilters}>
        {field('category', 'Category')}
        {field('source', 'Source contains…')}
        {field('tags', 'Tags (comma-separated)')}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value)
            setPage(1)
          }}
          aria-label="Sort"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="title:asc">Title A–Z</option>
          <option value="title:desc">Title Z–A</option>
          <option value="source:asc">Source A–Z</option>
        </select>
        <button type="submit">Apply</button>
        <button type="button" className="secondary" onClick={clearFilters}>
          Clear
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && !error && result.data.length === 0 && (
        <p className="muted">No entries found. Try different filters or add one.</p>
      )}

      <div className="grid">
        {result.data.map((entry) => (
          <EntryCard key={entry._id} entry={entry} />
        ))}
      </div>
      <Pager pagination={result.pagination} onPage={setPage} />
    </section>
  )
}
