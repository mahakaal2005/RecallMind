// Tiny fetch wrapper for the RecallMind API.
// Returns the parsed body ({ success, message, data, ... }) or throws Error(body.error).
//
//   const { data } = await api.get('/knowledge?page=1')
//   await api.post('/knowledge', { title, source, category, lessons })
//   await api.upload('/knowledge/upload', formData)

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, options)
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.success === false) {
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return body
}

const json = (method) => (path, data) =>
  request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  })

export const api = {
  get: (path) => request(path),
  post: json('POST'),
  put: json('PUT'),
  delete: (path) => request(path, { method: 'DELETE' }),
  // FormData upload — don't set Content-Type, the browser adds the multipart boundary
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
}
