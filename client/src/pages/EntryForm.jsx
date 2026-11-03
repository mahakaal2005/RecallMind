import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'

// OWNER: Atul — add (/add) and edit (/entries/:id/edit) share this form
const SOURCE_TYPES = ['book', 'article', 'podcast', 'video', 'personal', 'other']
const blankLesson = () => ({ lessonText: '', context: '', pageNumber: '' })
const BLANK = { title: '', source: '', sourceType: 'book', category: '', tags: '', lessons: [blankLesson()] }

export default function EntryForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(BLANK)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api
      .get(`/knowledge/${id}`)
      .then(({ data }) =>
        setForm({
          title: data.title,
          source: data.source,
          sourceType: data.sourceType,
          category: data.category,
          tags: data.tags.join(', '),
          lessons: data.lessons.map((l) => ({
            _id: l._id, // keeps recall stats on the server
            lessonText: l.lessonText,
            context: l.context || '',
            pageNumber: l.pageNumber ?? '',
          })),
        })
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const set = (name) => (e) => setForm({ ...form, [name]: e.target.value })
  const setLesson = (i, name, value) =>
    setForm({ ...form, lessons: form.lessons.map((l, j) => (j === i ? { ...l, [name]: value } : l)) })
  const removeLesson = (i) => setForm({ ...form, lessons: form.lessons.filter((_, j) => j !== i) })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      lessons: form.lessons.map((l) => ({
        ...l,
        pageNumber: l.pageNumber === '' ? undefined : Number(l.pageNumber),
      })),
    }
    try {
      const { data } = id ? await api.put(`/knowledge/${id}`, payload) : await api.post('/knowledge', payload)
      navigate(`/entries/${data._id}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) return <p className="muted">Loading…</p>

  return (
    <form className="card form" onSubmit={submit}>
      <h1>{id ? 'Edit entry' : 'Add entry'}</h1>
      {error && <p className="error">{error}</p>}

      <label>
        Title
        <input required value={form.title} onChange={set('title')} />
      </label>
      <label>
        Source (book, article, podcast…)
        <input required value={form.source} onChange={set('source')} />
      </label>
      <div className="row">
        <label>
          Type
          <select value={form.sourceType} onChange={set('sourceType')}>
            {SOURCE_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Category
          <input required value={form.category} onChange={set('category')} />
        </label>
      </div>
      <label>
        Tags (comma-separated)
        <input value={form.tags} onChange={set('tags')} />
      </label>

      <h2>Lessons</h2>
      {form.lessons.map((l, i) => (
        <div key={l._id || i} className="lesson-row">
          <textarea
            required
            rows={2}
            placeholder="What did you learn?"
            value={l.lessonText}
            onChange={(e) => setLesson(i, 'lessonText', e.target.value)}
          />
          <input
            placeholder="Why it matters (optional)"
            value={l.context}
            onChange={(e) => setLesson(i, 'context', e.target.value)}
          />
          <div className="row">
            <input
              type="number"
              min="0"
              placeholder="Page"
              value={l.pageNumber}
              onChange={(e) => setLesson(i, 'pageNumber', e.target.value)}
            />
            <button type="button" className="secondary" onClick={() => removeLesson(i)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="secondary"
        onClick={() => setForm({ ...form, lessons: [...form.lessons, blankLesson()] })}
      >
        + Add lesson
      </button>

      <div className="row">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : id ? 'Save changes' : 'Create entry'}
        </button>
        <button type="button" className="secondary" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </form>
  )
}
