import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

// OWNER: Rajan — Recall analytics & spaced-repetition statistics
export default function Stats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let stale = false
    setLoading(true)
    api
      .get('/quiz/stats')
      .then((res) => {
        if (stale) return
        setStats(res.data)
        setError('')
      })
      .catch((err) => {
        if (!stale) setError(err.message)
      })
      .finally(() => {
        if (!stale) setLoading(false)
      })

    return () => {
      stale = true
    }
  }, [])

  return (
    <section className="stack">
      <div className="row-between">
        <div>
          <h1>Recall Analytics</h1>
          <p className="muted">
            Track your retention, learning streak, and areas that need more practice.
          </p>
        </div>
        <div>
          <Link to="/quiz" style={{ textDecoration: 'none' }}>
            <button type="button">Quiz Weak Lessons</button>
          </Link>
        </div>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">Calculating aggregation statistics…</p>}

      {!loading && stats && (
        <>
          {/* Key Metric Tiles */}
          <div className="metric-grid">
            <div className="card metric">
              <span>Average Recall Score</span>
              <strong
                style={{
                  color:
                    stats.averageRecall >= 70
                      ? 'var(--success)'
                      : stats.averageRecall >= 40
                        ? 'var(--accent)'
                        : 'var(--danger)',
                }}
              >
                {stats.averageRecall}%
              </strong>
              <div className="bar">
                <div style={{ width: `${Math.min(100, stats.averageRecall)}%` }} />
              </div>
            </div>

            <div className="card metric">
              <span>Daily Quiz Streak</span>
              <strong>🔥 {stats.streak} {stats.streak === 1 ? 'day' : 'days'}</strong>
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                Consecutive days quizzing
              </span>
            </div>

            <div className="card metric">
              <span>Total Lessons Stored</span>
              <strong>{stats.totalLessons}</strong>
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                Across all knowledge entries
              </span>
            </div>

            <div className="card metric">
              <span>Never Tested</span>
              <strong style={{ color: stats.neverTestedCount > 0 ? 'var(--accent)' : 'var(--text)' }}>
                {stats.neverTestedCount}
              </strong>
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                Lessons pending first quiz
              </span>
            </div>

            <div className="card metric">
              <span>Quizzes Completed</span>
              <strong>{stats.totalQuizzesCompleted}</strong>
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                Total completed recall tests
              </span>
            </div>
          </div>

          {/* Weakest Categories Drilldown */}
          <section className="card form">
            <h2>Weakest Categories</h2>
            <p className="muted">
              These categories have the lowest average recall scores. Focus your study sessions here.
            </p>

            {(!stats.weakestCategories || stats.weakestCategories.length === 0) ? (
              <p className="muted">No category data available yet.</p>
            ) : (
              <div className="stack" style={{ marginTop: 8 }}>
                {stats.weakestCategories.map((item) => (
                  <div key={item.category} className="lesson-row">
                    <div className="row-between">
                      <strong>{item.category.toUpperCase()}</strong>
                      <span className="chip" style={{ fontWeight: 600 }}>
                        {item.avgRecall}% recall ({item.lessonCount} {item.lessonCount === 1 ? 'lesson' : 'lessons'})
                      </span>
                    </div>

                    <div className="bar" style={{ marginTop: 6 }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(5, item.avgRecall))}%`,
                          background:
                            item.avgRecall >= 60
                              ? 'var(--success)'
                              : item.avgRecall >= 30
                                ? 'var(--accent)'
                                : 'var(--danger)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  )
}
