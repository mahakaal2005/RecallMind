import { useEffect, useState } from 'react'
import { api } from '../api/client'

const EMPTY_SUMMARY = { totalEvents: 0, byType: [], byDay: [] }

const labelEventType = (eventType) => eventType.replaceAll(':', ' · ')

const fetchActivity = async () => {
  const results = await Promise.allSettled([
    api.get('/activity/log?lines=50'),
    api.get('/activity/summary'),
    api.get('/system/info'),
  ])
  const errors = []
  const [logResult, summaryResult, systemResult] = results
  const valueOr = (result, fallback, label) => {
    if (result.status === 'fulfilled') return result.value.data
    errors.push(`${label}: ${result.reason.message}`)
    return fallback
  }

  return {
    errors,
    activity: {
      lines: valueOr(logResult, { lines: [] }, 'Activity log').lines || [],
      summary: valueOr(summaryResult, EMPTY_SUMMARY, 'Activity summary'),
      system: valueOr(systemResult, null, 'System information'),
    },
  }
}

export default function Activity() {
  const [activity, setActivity] = useState({ lines: [], summary: EMPTY_SUMMARY, system: null })
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let stale = false
    fetchActivity().then(({ activity: nextActivity, errors: nextErrors }) => {
      if (stale) return
      setActivity(nextActivity)
      setErrors(nextErrors)
      setLoading(false)
    })
    return () => {
      stale = true
    }
  }, [])

  const refreshActivity = async () => {
    setRefreshing(true)
    const { activity: nextActivity, errors: nextErrors } = await fetchActivity()
    setActivity(nextActivity)
    setErrors(nextErrors)
    setRefreshing(false)
  }

  const { lines, summary, system } = activity
  const maxDayCount = Math.max(1, ...summary.byDay.map((day) => day.count))

  return (
    <section className="stack">
      <div className="row-between">
        <div>
          <h1>Activity</h1>
          <p className="muted">Recent application events and the local system that powers RecallMind.</p>
        </div>
        <button className="secondary" onClick={refreshActivity} disabled={loading || refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {errors.map((error) => <p className="error" role="alert" key={error}>{error}</p>)}
      {loading && <p className="muted">Loading activity…</p>}

      {!loading && (
        <>
          <section className="metric-grid" aria-label="Activity metrics">
            <Metric label="All events" value={summary.totalEvents} />
            {summary.byType.map((item) => (
              <Metric key={item.eventType} label={labelEventType(item.eventType)} value={item.count} />
            ))}
          </section>

          <section className="card">
            <h2>Last 7 days</h2>
            {summary.byDay.length === 0 ? (
              <p className="muted">No activity has been recorded yet.</p>
            ) : (
              <div className="activity-chart" role="img" aria-label="Activity counts for the last seven days">
                {summary.byDay.map((day) => (
                  <div className="activity-bar-group" key={day.date}>
                    <span className="activity-bar-count">{day.count}</span>
                    <div className="activity-bar-track">
                      <div className="activity-bar" style={{ height: `${(day.count / maxDayCount) * 100}%` }} />
                    </div>
                    <span className="activity-bar-label">{day.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <h2>Activity log</h2>
            <pre className="activity-log">{lines.length ? lines.join('\n') : 'No activity has been recorded yet.'}</pre>
          </section>

          <SystemCard system={system} />
        </>
      )}
    </section>
  )
}

function Metric({ label, value }) {
  return (
    <article className="card metric">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function SystemCard({ system }) {
  if (!system) return null
  const rows = [
    ['Host', system.hostname],
    ['Platform', `${system.platform} · ${system.architecture}`],
    ['Release', system.release],
    ['Node', system.nodeVersion],
    ['CPU', `${system.cpus} × ${system.cpuModel}`],
    ['Memory', `${system.usedMemoryPercent} used (${system.freeMemory} free of ${system.totalMemory})`],
    ['Uptime', system.uptime],
  ]

  return (
    <section className="card">
      <h2>System</h2>
      <dl className="system-details">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || 'Unavailable'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
