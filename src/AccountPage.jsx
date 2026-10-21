/* Shopper account: login / register, then profile, saved cart, wishlist and order history.  Classes: ac- (account.css) + ct- (cart.css). */
import { useEffect, useState } from 'react'
import { api } from './api.js'
import { inr } from './data.js'
import { navigate } from './router.js'
import { login, logout, register, saveProfile, toggleWish, useAccount } from './accountStore.js'

const STATUS = { new: 'Received', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }
const fmt = (d) => new Date(d.replace(' ', 'T') + 'Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function AuthForms() {
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      if (mode === 'login') await login(f.email, f.password)
      else await register({ name: f.name, email: f.email, phone: f.phone, password: f.password })
    } catch (x) {
      setErr(x.message)
    }
    setBusy(false)
  }
  return (
    <section className="ct-card ac-auth">
      <div className="ac-tabs" role="tablist">
        {[['login', 'Login'], ['register', 'Create account']].map(([k, t]) => (
          <button key={k} type="button" role="tab" aria-selected={mode === k} className={mode === k ? 'on' : ''} onClick={() => { setMode(k); setErr('') }}>
            {t}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="ac-form">
        {mode === 'register' && (
          <label>
            Full name
            <input required value={f.name} onChange={up('name')} autoComplete="name" maxLength={100} />
          </label>
        )}
        <label>
          Email
          <input required type="email" value={f.email} onChange={up('email')} autoComplete="email" />
        </label>
        {mode === 'register' && (
          <label>
            Mobile number
            <input value={f.phone} onChange={up('phone')} inputMode="numeric" maxLength={10} placeholder="10-digit number" autoComplete="tel" />
          </label>
        )}
        <label>
          Password
          <input required type="password" minLength={mode === 'register' ? 8 : 1} value={f.password} onChange={up('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          {mode === 'register' && <small>At least 8 characters</small>}
        </label>
        {err && <p className="ac-err" role="alert">{err}</p>}
        <button className="ct-btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}</button>
      </form>
    </section>
  )
}

function Profile({ customer }) {
  const [f, setF] = useState({ name: customer.name, phone: customer.phone, address: customer.address, city: customer.city, pincode: customer.pincode })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const save = async (e) => {
    e.preventDefault()
    setMsg('')
    setErr('')
    try {
      await saveProfile(f)
      setMsg('Saved')
    } catch (x) {
      setErr(x.message)
    }
  }
  return (
    <form onSubmit={save} className="ac-form ac-two">
      <label>Full name<input required value={f.name} onChange={up('name')} maxLength={100} /></label>
      <label>Email<input value={customer.email} disabled /></label>
      <label>Mobile<input value={f.phone} onChange={up('phone')} inputMode="numeric" maxLength={10} /></label>
      <label>Pincode<input value={f.pincode} onChange={up('pincode')} inputMode="numeric" maxLength={6} /></label>
      <label className="wide">Delivery address<textarea rows={3} value={f.address} onChange={up('address')} maxLength={500} /></label>
      <label>City<input value={f.city} onChange={up('city')} maxLength={100} /></label>
      <div className="wide">
        {err && <p className="ac-err" role="alert">{err}</p>}
        {msg && <p className="ac-ok">{msg}</p>}
        <button className="ct-btn ac-save">Save details</button>
      </div>
    </form>
  )
}

function Orders({ token }) {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    api('/customer/orders', { token }).then((r) => setRows(r.data)).catch((e) => setErr(e.message))
  }, [token])
  if (err) return <p className="ac-err">{err}</p>
  if (!rows) return <p className="ac-muted">Loading…</p>
  if (!rows.length) return <p className="ac-muted">No orders yet. When you place an order it shows up here.</p>
  return (
    <div className="ac-orders">
      {rows.map((o) => (
        <article key={o.id} className="ac-order">
          <header>
            <b>{o.orderNo}</b>
            <span className={'ac-st ' + o.status}>{STATUS[o.status]}</span>
            <small>{fmt(o.createdAt)}</small>
            <strong>{inr(o.total)}</strong>
          </header>
          <ul>
            {o.items.map((x) => (
              <li key={x.id + (x.opt || '')}>
                {x.name}{x.opt ? ` (${x.opt})` : ''} × {x.qty}<span>{inr(x.price * x.qty)}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

const Items = ({ list, empty, onRemove }) =>
  !list.length ? (
    <p className="ac-muted">{empty}</p>
  ) : (
    <div className="ac-items">
      {list.map((x) => (
        <article key={x.id} className="ac-item">
          {x.img && <img src={x.img} alt="" loading="lazy" />}
          <div>
            <b>{x.url ? <a href={x.url}>{x.name}</a> : x.name}</b>
            <span>{x.price ? inr(x.price) : ''}{x.qty ? ` × ${x.qty}` : ''}</span>
          </div>
          {onRemove && <button type="button" onClick={() => onRemove(x)}>Remove</button>}
        </article>
      ))}
    </div>
  )

export default function AccountPage({ cart }) {
  const { token, customer, ready, wishlist } = useAccount()
  const [tab, setTab] = useState('orders')
  if (token && !customer && !ready) return <div className="ct-page"><p className="ac-muted">Loading…</p></div>
  return (
    <div className="ct-page">
      <div className="ct-head">
        <h1>{customer ? 'My Account' : 'Login'}</h1>
        <p>{customer ? `Hello, ${customer.name.split(' ')[0]}` : 'Login to see your orders, saved cart and wishlist.'}</p>
      </div>
      {!customer ? (
        <AuthForms />
      ) : (
        <section className="ct-card ac-main">
          <div className="ac-tabs" role="tablist">
            {[['orders', 'Orders'], ['cart', `Cart (${cart.count})`], ['wish', `Wishlist (${wishlist.length})`], ['profile', 'Profile']].map(([k, t]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
                {t}
              </button>
            ))}
            <button type="button" className="ac-out" onClick={() => { logout(); navigate('/') }}>Logout</button>
          </div>
          <div className="ac-body">
            {tab === 'orders' && <Orders token={token} />}
            {tab === 'cart' && (
              <>
                <Items list={cart.items} empty="Your cart is empty." onRemove={(x) => cart.remove(x.id)} />
                {cart.items.length > 0 && <a className="ct-btn ac-go" href="/cart">Go to cart · {inr(cart.total)}</a>}
              </>
            )}
            {tab === 'wish' && <Items list={wishlist} empty="Tap the heart on a spare part to save it here." onRemove={toggleWish} />}
            {tab === 'profile' && <Profile customer={customer} />}
          </div>
        </section>
      )}
    </div>
  )
}
