/* Tiny fetch wrapper for the backend API. Set VITE_API_URL (e.g. https://api.yourdomain.in/api) for production. */
export const API = (import.meta.env?.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

export async function api(path, { method = 'GET', token, body } = {}) {
  let res
  try {
    res = await fetch(API + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    const e = new Error('Cannot reach the server. Please check your connection and try again.')
    e.offline = true
    throw e
  }
  let json = null
  try {
    json = await res.json()
  } catch {
    /* empty body */
  }
  if (!res.ok || (json && json.success === false)) {
    const detail = json && Array.isArray(json.errors) && json.errors[0] ? ` (${json.errors[0].message || json.errors[0]})` : ''
    const e = new Error(((json && json.message) || 'Something went wrong') + (json && json.errors && !json.message?.includes(':') ? detail : ''))
    e.status = res.status
    e.errors = json && json.errors
    throw e
  }
  return json
}
