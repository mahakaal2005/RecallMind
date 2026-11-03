import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import EntryCard from '../components/EntryCard'
import Pager from '../components/Pager'

// OWNER: Atul
export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const page = Number(params.get('page')) || 1
  const [text, setText] = useState(q)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!q) {
      setResult(null)
      return
    }
    let stale = false
    setLoading(true)
    setError('')
    api
      .get(`/knowledge/search?${new URLSearchParams({ q, page, limit: 9 })}`)
      .then((body) => !stale && setResult(body))
      .catch((e) => !stale && setError(e.message))
      .finally(() => !stale && setLoading(false))
    return () => {
      stale = true
    }
  }, [q, page])

  const submit = (e) => {
    e.preventDefault()
    if (text.trim()) setParams({ q: text.trim() })
  }

  return (
    <section>
      <h1>Search</h1>
      <form className="row" onSubmit={submit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search lessons, titles, sources…"
          aria-label="Search"
        />
        <button type="submit">Search</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Searching…</p>}
      {result && !loading && (
        <p className="muted">
          {result.pagination.total} result(s) for “{q}”, best match first
        </p>
      )}

      <div className="grid">
        {result?.data.map((entry) => (
          <EntryCard key={entry._id} entry={entry} />
        ))}
      </div>
      <Pager
        pagination={result?.pagination}
        onPage={(p) => setParams({ q, page: p })}
      />
    </section>
  )
}
