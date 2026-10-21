/* Staff admin (/admin). Staff log in with the backend's staff accounts; what each person sees depends on the role:
   admin       -> Orders, Customers
   hr_admin    -> Staff accounts
   super_admin -> everything
   (The server enforces the same rules, this only hides screens a role cannot use.) */
import { Fragment, useCallback, useEffect, useState } from 'react'
import { api } from './api.js'
import { inr } from './data.js'

const KEY = 'aakash-staff-v1'
const ROLE_NAME = { super_admin: 'Super Admin', admin: 'Admin', hr_admin: 'HR Admin' }
const STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled']
const TABS = {
  orders: ['Orders', ['admin', 'super_admin']],
  customers: ['Customers', ['admin', 'super_admin']],
  staff: ['Staff', ['hr_admin', 'super_admin']],
}
const when = (d) => new Date(d.replace(' ', 'T') + 'Z').toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const rd = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function Login({ onIn }) {
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const d = (await api('/auth/login', { method: 'POST', body: f })).data
      try {
        localStorage.setItem(KEY, d.token)
      } catch {
        /* ignore */
      }
      onIn(d.token, d.user)
    } catch (x) {
      setErr(x.message)
    }
    setBusy(false)
  }
  return (
    <section className="ct-card ad-login">
      <form className="ac-form" onSubmit={submit}>
        <label>Email<input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="username" /></label>
        <label>Password<input required type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></label>
        {err && <p className="ac-err" role="alert">{err}</p>}
        <button className="ct-btn" disabled={busy}>{busy ? 'Please wait…' : 'Login'}</button>
      </form>
    </section>
  )
}

function Pager({ p, set }) {
  if (!p || p.pages <= 1) return null
  return (
    <div className="ad-pager">
      <button className="ad-btn" disabled={p.page <= 1} onClick={() => set(p.page - 1)}>‹ Prev</button>
      <span>Page {p.page} of {p.pages}</span>
      <button className="ad-btn" disabled={p.page >= p.pages} onClick={() => set(p.page + 1)}>Next ›</button>
    </div>
  )
}

function Orders({ token }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [res, setRes] = useState(null)
  const [open, setOpen] = useState(null)
  const [err, setErr] = useState('')
  const load = useCallback(() => {
    const qs = new URLSearchParams({ page, limit: 15, ...(q ? { search: q } : {}), ...(status ? { status } : {}) })
    api('/orders?' + qs, { token }).then((r) => (setRes(r), setErr(''))).catch((e) => setErr(e.message))
  }, [token, q, status, page])
  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])
  const update = async (o, patch) => {
    try {
      await api('/orders/' + o.id, { method: 'PATCH', token, body: { status: o.status, note: o.note, ...patch } })
      load()
    } catch (e) {
      setErr(e.message)
    }
  }
  return (
    <section className="ct-card" style={{ padding: '1.4rem 1.6rem' }}>
      <div className="ac-bar">
        <input placeholder="Search order no, name, phone" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {err && <p className="ac-err">{err}</p>}
      <div className="ad-wrap">
        <table className="ad-table">
          <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th><th /></tr></thead>
          <tbody>
            {res && res.data.length === 0 && <tr><td colSpan={6}>No orders found.</td></tr>}
            {res && res.data.map((o) => (
              <Fragment key={o.id}>
                <tr className={open === o.id ? 'open' : ''}>
                  <td><b>{o.orderNo}</b></td>
                  <td>{when(o.createdAt)}</td>
                  <td>{o.name}<br /><small>{o.phone}</small></td>
                  <td>{inr(o.total)}</td>
                  <td>
                    <select className="ad-sel" value={o.status} onChange={(e) => update(o, { status: e.target.value })} aria-label="Order status">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><button className="ad-btn" onClick={() => setOpen(open === o.id ? null : o.id)}>{open === o.id ? 'Hide' : 'View'}</button></td>
                </tr>
                {open === o.id && (
                  <tr className="open"><td colSpan={6}>
                    <div className="ad-detail">
                      <ul>{o.items.map((x) => <li key={x.id + (x.opt || '')}>{x.name}{x.opt ? ` (${x.opt})` : ''} × {x.qty} — {inr(x.price * x.qty)}</li>)}</ul>
                      <div>
                        <p><b>Deliver to:</b> {[o.address, o.city, o.pincode].filter(Boolean).join(', ') || '—'}</p>
                        <textarea rows={2} defaultValue={o.note} placeholder="Internal note" onBlur={(e) => e.target.value !== o.note && update(o, { note: e.target.value })} />
                      </div>
                    </div>
                  </td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <Pager p={res && res.pagination} set={setPage} />
    </section>
  )
}

function Customers({ token }) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    const qs = new URLSearchParams({ page, limit: 15, ...(q ? { search: q } : {}) })
    const t = setTimeout(() => api('/customers?' + qs, { token }).then(setRes).catch((e) => setErr(e.message)), 250)
    return () => clearTimeout(t)
  }, [token, q, page])
  return (
    <section className="ct-card" style={{ padding: '1.4rem 1.6rem' }}>
      <div className="ac-bar"><input placeholder="Search name, email, phone" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} /></div>
      {err && <p className="ac-err">{err}</p>}
      <div className="ad-wrap">
        <table className="ad-table">
          <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>City</th><th>Orders</th><th>Joined</th></tr></thead>
          <tbody>
            {res && res.data.length === 0 && <tr><td colSpan={6}>No customers yet.</td></tr>}
            {res && res.data.map((c) => (
              <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.city}</td><td>{c.orders}</td><td>{when(c.createdAt)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager p={res && res.pagination} set={setPage} />
    </section>
  )
}

function Staff({ token, me }) {
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')
  const [page, setPage] = useState(1)
  const roles = me.role === 'super_admin' ? ['super_admin', 'admin', 'hr_admin'] : ['admin', 'hr_admin'] // HR cannot hand out super admin
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'admin' })
  const load = useCallback(() => api('/users?limit=50&page=' + page, { token }).then((r) => (setRes(r), setErr(''))).catch((e) => setErr(e.message)), [token, page])
  useEffect(() => { load() }, [load])
  const run = async (fn) => {
    try {
      await fn()
      load()
    } catch (e) {
      setErr(e.message)
    }
  }
  const add = (e) => {
    e.preventDefault()
    run(async () => {
      await api('/users', { method: 'POST', token, body: f })
      setF({ name: '', email: '', password: '', role: 'admin' })
    })
  }
  const locked = (u) => me.role === 'hr_admin' && u.role === 'super_admin' // the server refuses it too
  return (
    <section className="ct-card" style={{ padding: '1.4rem 1.6rem' }}>
      <form className="ac-bar" onSubmit={add}>
        <input required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required type="password" minLength={8} placeholder="Password (8+ characters)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" />
        <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} aria-label="Role">
          {roles.map((r) => <option key={r} value={r}>{ROLE_NAME[r]}</option>)}
        </select>
        <button className="ad-btn solid">Add staff</button>
      </form>
      {err && <p className="ac-err">{err}</p>}
      <div className="ad-wrap">
        <table className="ad-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr></thead>
          <tbody>
            {res && res.data.map((u) => (
              <tr key={u.id}>
                <td>{u.name}{u.id === me.id && ' (you)'}</td>
                <td>{u.email}</td>
                <td>
                  <select className="ad-sel" value={u.role} disabled={locked(u) || u.id === me.id} aria-label="Role" onChange={(e) => run(() => api('/users/' + u.id, { method: 'PATCH', token, body: { role: e.target.value } }))}>
                    {['super_admin', 'admin', 'hr_admin'].filter((r) => roles.includes(r) || r === u.role).map((r) => <option key={r} value={r}>{ROLE_NAME[r]}</option>)}
                  </select>
                </td>
                <td>{u.active ? 'Active' : 'Disabled'}</td>
                <td>
                  {!locked(u) && u.id !== me.id && (
                    <>
                      <button className="ad-btn" onClick={() => run(() => api('/users/' + u.id, { method: 'PATCH', token, body: { active: !u.active } }))}>{u.active ? 'Disable' : 'Enable'}</button>{' '}
                      <button className="ad-btn danger" onClick={() => window.confirm(`Delete ${u.name}?`) && run(() => api('/users/' + u.id, { method: 'DELETE', token }))}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager p={res && res.pagination} set={setPage} />
    </section>
  )
}

export default function AdminPage() {
  const [token, setToken] = useState(rd)
  const [me, setMe] = useState(null)
  const [tab, setTab] = useState(null)
  const out = () => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    setToken(null)
    setMe(null)
  }
  useEffect(() => {
    if (!token || me) return
    api('/auth/me', { token }).then((r) => setMe(r.data)).catch(out)
  }, [token, me])
  const tabs = me ? Object.entries(TABS).filter(([, [, roles]]) => roles.includes(me.role)) : []
  const cur = tab && tabs.some(([k]) => k === tab) ? tab : tabs[0] && tabs[0][0]
  return (
    <div className="ad-page">
      <h1>Admin</h1>
      {!token ? (
        <Login onIn={(t, u) => (setToken(t), setMe(u))} />
      ) : !me ? (
        <p className="ac-muted">Loading…</p>
      ) : (
        <>
          <div className="ad-top">
            <div className="ac-tabs" style={{ border: 0, margin: 0 }}>
              {tabs.map(([k, [t]]) => (
                <button key={k} className={cur === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>
              ))}
            </div>
            <span className="who">{me.name} · {ROLE_NAME[me.role]}<button onClick={out}>Logout</button></span>
          </div>
          {cur === 'orders' && <Orders token={token} />}
          {cur === 'customers' && <Customers token={token} />}
          {cur === 'staff' && <Staff token={token} me={me} />}
        </>
      )}
    </div>
  )
}
