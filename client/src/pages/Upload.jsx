import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const EMPTY_CAPTURE = { lessonText: '', source: '', category: '' }
const fileIsSupported = (file) => /\.(txt|md)$/i.test(file.name)

export default function Upload() {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [uploadedEntry, setUploadedEntry] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [capture, setCapture] = useState(EMPTY_CAPTURE)
  const [capturedEntry, setCapturedEntry] = useState(null)
  const [capturing, setCapturing] = useState(false)
  const [captureError, setCaptureError] = useState('')

  const chooseFile = (event) => {
    const nextFile = event.target.files?.[0]
    setUploadedEntry(null)
    setUploadError('')

    if (!nextFile) {
      setFile(null)
      return
    }
    if (!fileIsSupported(nextFile)) {
      setFile(null)
      setUploadError('Choose a .txt or .md file.')
      event.target.value = ''
      return
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null)
      setUploadError('Choose a file smaller than 2 MB.')
      event.target.value = ''
      return
    }
    setFile(nextFile)
  }

  const uploadFile = async (event) => {
    event.preventDefault()
    if (!file) {
      setUploadError('Choose a .txt or .md file first.')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadedEntry(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.upload('/knowledge/upload', formData)
      setUploadedEntry(data)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const setCaptureField = (field) => (event) => {
    setCapture((current) => ({ ...current, [field]: event.target.value }))
  }

  const quickCapture = async (event) => {
    event.preventDefault()
    setCapturing(true)
    setCaptureError('')
    setCapturedEntry(null)
    try {
      const { data } = await api.post('/knowledge/quick', capture)
      setCapturedEntry(data)
      setCapture(EMPTY_CAPTURE)
    } catch (error) {
      setCaptureError(error.message)
    } finally {
      setCapturing(false)
    }
  }

  return (
    <section className="stack">
      <div>
        <h1>Upload notes</h1>
        <p className="muted">Import a plain-text or Markdown note and turn each bullet point into a lesson.</p>
      </div>

      <form className="card form" onSubmit={uploadFile}>
        <div>
          <h2>Import a note file</h2>
          <p className="muted">Accepted formats: .txt and .md, up to 2 MB. Use lines beginning with “- ” or “* ” for lessons.</p>
        </div>
        {uploadError && <p className="error" role="alert">{uploadError}</p>}
        <label>
          Note file
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={chooseFile}
            disabled={uploading}
          />
        </label>
        {file && <p className="muted">Ready to upload: {file.name} ({Math.ceil(file.size / 1024)} KB)</p>}
        <div className="row">
          <button type="submit" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload and parse'}</button>
        </div>
      </form>

      {uploadedEntry && <EntryPreview entry={uploadedEntry} action="File imported" />}

      <form className="card form" onSubmit={quickCapture}>
        <div>
          <h2>Quick capture</h2>
          <p className="muted">Save one lesson immediately when a note file would be overkill.</p>
        </div>
        {captureError && <p className="error" role="alert">{captureError}</p>}
        <label>
          What did you learn?
          <textarea
            required
            maxLength={1000}
            rows={4}
            value={capture.lessonText}
            onChange={setCaptureField('lessonText')}
            placeholder="A concise lesson you want to remember"
            disabled={capturing}
          />
        </label>
        <label>
          Source
          <input
            required
            value={capture.source}
            onChange={setCaptureField('source')}
            placeholder="Book, conversation, article…"
            disabled={capturing}
          />
        </label>
        <label>
          Category <span className="muted">(optional)</span>
          <input
            value={capture.category}
            onChange={setCaptureField('category')}
            placeholder="e.g. productivity"
            disabled={capturing}
          />
        </label>
        <div className="row">
          <button type="submit" disabled={capturing}>{capturing ? 'Saving…' : 'Save quick capture'}</button>
        </div>
      </form>

      {capturedEntry && <EntryPreview entry={capturedEntry} action="Quick capture saved" />}
    </section>
  )
}

function EntryPreview({ entry, action }) {
  const lessonCount = entry.lessons?.length || 0
  return (
    <article className="card success-card" aria-live="polite">
      <p className="success-text">{action}</p>
      <h2>{entry.title}</h2>
      <p className="muted">{entry.source} · {entry.category} · {lessonCount} lesson{lessonCount === 1 ? '' : 's'}</p>
      <Link to={`/entries/${entry._id}`}>View entry</Link>
    </article>
  )
}
