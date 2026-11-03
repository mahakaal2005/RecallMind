import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { api } from '../api/client'

const links = [
  { to: '/', label: 'Library' },
  { to: '/add', label: 'Add' },
  { to: '/upload', label: 'Upload' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/stats', label: 'Stats' },
  { to: '/search', label: 'Search' },
  { to: '/help', label: 'Help Me' },
  { to: '/journal', label: 'Journal' },
  { to: '/activity', label: 'Activity' },
]

export default function Layout() {
  const [db, setDb] = useState('checking')

  useEffect(() => {
    api
      .get('/health')
      .then(({ data }) => setDb(data.db))
      .catch(() => setDb('offline'))
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          RecallMind
        </NavLink>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <span className={`status status-${db}`} title="API / database status">
          {db === 'connected' ? 'API online' : db === 'checking' ? 'Checking…' : `API ${db}`}
        </span>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
