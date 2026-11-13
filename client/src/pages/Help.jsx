import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

// OWNER: Rajan — Situational retrieval "Help Me With..."
export default function Help() {
  const navigate = useNavigate()
  const [problem, setProblem] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [serverMessage, setServerMessage] = useState('')

  const exampleProblems = [
    'I keep procrastinating on my important assignments',
    'How do I build a habit and stick with it every day?',
    'I feel overwhelmed by too many tasks and distractions',
    'How to remember what I read and apply it in real life',
  ]

  const handleRetrieve = async (e) => {
    if (e) e.preventDefault()
    if (!problem.trim()) return

    setLoading(true)
    setError('')
    setServerMessage('')

    try {
      const res = await api.post('/knowledge/retrieve', {
        problem: problem.trim(),
        limit: 6,
      })
      setResults(res.data || [])
      setServerMessage(res.message || '')
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPrompt = (promptText) => {
    setProblem(promptText)
  }

  const handleWriteReflection = (lesson) => {
    navigate(`/journal?entryId=${lesson.entryId}&lessonId=${lesson.lessonId}`)
  }

  return (
    <section className="stack">
      <div>
        <h1>Help Me With…</h1>
        <p className="muted">
          Describe a real-life situation, struggle, or question. RecallMind searches your knowledge base using text matching and relevance scoring to retrieve the most actionable lessons.
        </p>
      </div>

      <form className="card form" onSubmit={handleRetrieve}>
        <h2>What are you dealing with?</h2>
        {error && <p className="error" role="alert">{error}</p>}

        <label>
          Describe your problem or goal
          <textarea
            required
            rows={4}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g. I keep putting off my project until the last minute and struggle to focus..."
            disabled={loading}
          />
        </label>

        {/* Quick prompt suggestions */}
        <div style={{ marginTop: 2 }}>
          <p className="muted" style={{ fontSize: '0.85rem', margin: '0 0 6px' }}>
            Or try an example prompt:
          </p>
          <div className="chips">
            {exampleProblems.map((p) => (
              <button
                key={p}
                type="button"
                className="chip chip-tag"
                style={{ cursor: 'pointer', textAlign: 'left' }}
                onClick={() => handleQuickPrompt(p)}
                disabled={loading}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="row" style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading || !problem.trim()}>
            {loading ? 'Retrieving lessons…' : 'Retrieve Relevant Lessons'}
          </button>
        </div>
      </form>

      {/* RESULTS DISPLAY */}
      {results !== null && (
        <section className="stack">
          <div className="row-between">
            <h2>Retrieved Lessons</h2>
            {serverMessage && <span className="muted" style={{ fontSize: '0.9rem' }}>{serverMessage}</span>}
          </div>

          {results.length === 0 ? (
            <div className="card">
              <p className="muted">
                No matching lessons found for your query. Try rephrasing or adding relevant notes to your library.
              </p>
            </div>
          ) : (
            <div className="stack">
              {results.map((lesson, idx) => (
                <article key={lesson.lessonId || idx} className="card">
                  <div className="row-between">
                    <div>
                      <span className="chip" style={{ marginRight: 8 }}>
                        Match #{idx + 1}
                      </span>
                      {lesson.category && (
                        <span className="chip chip-tag">
                          {lesson.category}
                        </span>
                      )}
                    </div>
                    {lesson.relevanceScore !== undefined && (
                      <span className="muted" style={{ fontSize: '0.85rem' }}>
                        Relevance: <strong>{lesson.relevanceScore}</strong>
                      </span>
                    )}
                  </div>

                  <div style={{ margin: '12px 0 8px' }}>
                    <blockquote
                      style={{
                        margin: 0,
                        paddingLeft: 12,
                        borderLeft: '3px solid var(--accent)',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      {lesson.lessonText}
                    </blockquote>
                  </div>

                  {lesson.context && (
                    <p className="muted" style={{ margin: '6px 0 12px', fontSize: '0.9rem' }}>
                      <strong>Context:</strong> {lesson.context}
                    </p>
                  )}

                  <div className="row-between" style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <div>
                      <span className="muted" style={{ fontSize: '0.85rem' }}>
                        From: <strong>{lesson.title}</strong> ({lesson.source})
                      </span>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="secondary"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                        onClick={() => handleWriteReflection(lesson)}
                      >
                        ✍️ Write a Reflection
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  )
}
