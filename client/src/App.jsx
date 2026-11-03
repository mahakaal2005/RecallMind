import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Library from './pages/Library'
import EntryForm from './pages/EntryForm'
import EntryDetail from './pages/EntryDetail'
import Upload from './pages/Upload'
import Quiz from './pages/Quiz'
import Stats from './pages/Stats'
import Search from './pages/Search'
import Help from './pages/Help'
import Journal from './pages/Journal'
import Activity from './pages/Activity'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Library />} />
          <Route path="/add" element={<EntryForm />} />
          <Route path="/entries/:id" element={<EntryDetail />} />
          <Route path="/entries/:id/edit" element={<EntryForm />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/search" element={<Search />} />
          <Route path="/help" element={<Help />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="*" element={<h1>Page not found</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
