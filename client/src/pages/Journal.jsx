import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import Pager from '../components/Pager'

const MOODS = ['inspired', 'neutral', 'struggling', 'proud']
const EMPTY_RESULT = { data: [], pagination: null }

export default function Journal() {
  const [searchParams] = useSearchParams()
  const prefilledEntryId = searchParams.get('entryId') || ''
  const prefilledLessonId = searchParams.get('lessonId') || ''
  const [entries, setEntries] = useState([])
  const [entriesError, setEntriesError] = useState('')
  const [selectedEntryId, setSelectedEntryId] = useState('')
  const [selectedLessonIds, setSelectedLessonIds] = useState([])
  const [text, setText] = useState('')
  const [mood, setMood] = useState('neutral')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [filterMood, setFilterMood] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState(EMPTY_RESULT)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let stale = false
    api
      .get('/knowledge?limit=50')
      .then(({ data }) => {
        if (stale) return
        setEntries(data)
        const prefilledEntry = data.find((entry) => entry._id === prefilledEntryId)
        if (!prefilledEntry) return
        setSelectedEntryId(prefilledEntry._id)
        if (prefilledEntry.lessons.some((lesson) => lesson._id === prefilledLessonId)) {
          setSelectedLessonIds([prefilledLessonId])
        }
      })
      .catch((error) => !stale && setEntriesError(error.message))
    return () => {
      stale = true
    }
  }, [prefilledEntryId, prefilledLessonId])

  useEffect(() => {
    let stale = false
    const params = new URLSearchParams({ page: String(page), limit: '10' })
    if (filterMood) params.set('mood', filterMood)

    api
      .get(`/reflections?${params}`)
      .then((body) => {
        if (stale) return
        setResult({ data: body.data, pagination: body.pagination })
        setListError('')
      })
      .catch((error) => !stale && setListError(error.message))
      .finally(() => !stale && setLoading(false))

    return () => {
      stale = true
    }
  }, [filterMood, page, refreshKey])

  const selectedEntry = entries.find((entry) => entry._id === selectedEntryId)

  const selectEntry = (event) => {
    setSelectedEntryId(event.target.value)
    setSelectedLessonIds([])
  }

  const toggleLesson = (lessonId) => {
    setSelectedLessonIds((current) => (
      current.includes(lessonId) ? current.filter((id) => id !== lessonId) : [...current, lessonId]
    ))
  }

  const saveReflection = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await api.post('/reflections', {
        text,
        mood,
        linkedLessons: selectedLessonIds.map((lessonId) => ({
          knowledgeEntryId: selectedEntryId,
          lessonId,
        })),
      })
      setText('')
      setMood('neutral')
      setSelectedEntryId('')
      setSelectedLessonIds([])
      setFilterMood('')
      setPage(1)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteReflection = async (id) => {
    if (!window.confirm('Delete this reflection?')) return
    setListError('')
    try {
      await api.delete(`/reflections/${id}`)
      if (result.data.length === 1 && page > 1) setPage((current) => current - 1)
      setRefreshKey((key) => key + 1)
    } catch (error) {
      setListError(error.message)
    }
  }

  return (
    <section className="stack">
      <div>
        <h1>Reflection journal</h1>
        <p className="muted">Capture how you applied a lesson, then revisit your thinking over time.</p>
      </div>

      <form className="card form" onSubmit={saveReflection}>
        <h2>Write a reflection</h2>
        {formError && <p className="error" role="alert">{formError}</p>}
        {entriesError && <p className="error" role="alert">Could not load lessons: {entriesError}</p>}
        <label>
          Reflection
          <textarea
            required
            maxLength={2000}
            rows={5}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="What happened when you put a lesson into practice?"
            disabled={saving}
          />
        </label>
        <label>
          Mood
          <select value={mood} onChange={(event) => setMood(event.target.value)} disabled={saving}>
            {MOODS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Link lessons <span className="muted">(optional)</span>
          <select value={selectedEntryId} onChange={selectEntry} disabled={saving || entries.length === 0}>
            <option value="">Choose an entry</option>
            {entries.map((entry) => <option key={entry._id} value={entry._id}>{entry.title} — {entry.source}</option>)}
          </select>
        </label>
        {selectedEntry && (
          <fieldset className="lesson-picker" disabled={saving}>
            <legend>Lessons from {selectedEntry.title}</legend>
            {selectedEntry.lessons.map((lesson) => (
              <label key={lesson._id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedLessonIds.includes(lesson._id)}
                  onChange={() => toggleLesson(lesson._id)}
                />
                <span>{lesson.lessonText}</span>
              </label>
            ))}
          </fieldset>
        )}
        <div className="row">
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save reflection'}</button>
        </div>
      </form>

      <section>
        <div className="row-between">
          <h2>Recent reflections</h2>
          <label className="inline-label">
            Mood
            <select
              value={filterMood}
              onChange={(event) => {
                setFilterMood(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All moods</option>
              {MOODS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        {listError && <p className="error" role="alert">{listError}</p>}
        {loading && <p className="muted">Loading reflections…</p>}
        {!loading && !listError && result.data.length === 0 && <p className="muted">No reflections yet. Your first one starts above.</p>}
        <div className="stack reflection-list">
          {result.data.map((reflection) => (
            <article key={reflection._id} className="card reflection-card">
              <div className="row-between">
                <span className="chip">{reflection.mood}</span>
                <time className="muted" dateTime={reflection.createdAt}>{new Date(reflection.createdAt).toLocaleString()}</time>
              </div>
              <p>{reflection.text}</p>
              {reflection.linked?.length > 0 && (
                <ul className="linked-lessons">
                  {reflection.linked.map((link) => (
                    <li key={`${reflection._id}-${link.lessonId}`}>
                      {link.deleted ? '(deleted)' : `${link.lessonText} (${link.title})`}
                    </li>
                  ))}
                </ul>
              )}
              <div><button className="secondary" onClick={() => deleteReflection(reflection._id)}>Delete</button></div>
            </article>
          ))}
        </div>
        <Pager pagination={result.pagination} onPage={setPage} />
      </section>
    </section>
  )
}
