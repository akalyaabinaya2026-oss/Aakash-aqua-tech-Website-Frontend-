/* Cart page – sand-cream card + deep-blue → teal pill button (same look as the Home "About us" card).
   Every class is prefixed ct- (styles in cart.css). */
import { useEffect, useRef, useState } from 'react'
import { WA, inr, hrefOf } from './data.js'
import { api } from './api.js'
import { useAccount } from './accountStore.js'

/* number that rolls from its old value to the new one */
function useCountUp(target, ms = 700) {
  const [v, setV] = useState(0)
  const cur = useRef(0)
  useEffect(() => {
    const a = cur.current
    const t0 = performance.now()
    let raf
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ms)
      cur.current = a + (target - a) * (1 - Math.pow(1 - k, 3))
      setV(cur.current)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12h17m-6-6 6 6-6 6" />
  </svg>
)

const ORBS = [
  ['-14px', '8%', '30px', '7s'],
  ['96%', '3%', '46px', '9s'],
  ['101%', '46%', '26px', '6s'],
  ['34%', '98%', '34px', '8s'],
  ['-18px', '70%', '22px', '10s'],
]

export default function CartPage({ cart }) {
  const { items, setQty, remove, clear, count, total } = cart
  const [out, setOut] = useState([])
  const [burst, setBurst] = useState(0)
  const shown = useCountUp(total)

  const del = (id) => {
    setOut((o) => [...o, id])
    setTimeout(() => {
      remove(id)
      setOut((o) => o.filter((x) => x !== id))
    }, 380)
  }

  const { token, customer } = useAccount()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', phone: '', address: '', city: '', pincode: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState(null) // { no, url, saved }
  const up = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }))

  // pre-fill the form from the account
  useEffect(() => {
    if (customer) setF((v) => ({ name: v.name || customer.name, phone: v.phone || customer.phone, address: v.address || customer.address, city: v.city || customer.city, pincode: v.pincode || customer.pincode }))
  }, [customer])

  const waText = (no) => {
    const lines = items.map((x, i) => `${i + 1}. ${x.name}${x.opt ? ' (' + x.opt + ')' : ''} x${x.qty} - ${inr(x.price * x.qty)}`)
    return `${no ? 'Order ' + no + '\n' : ''}I want to order:\n${lines.join('\n')}\nTotal: ${inr(total)}\nName: ${f.name}\nMobile: ${f.phone}\nAddress: ${[f.address, f.city, f.pincode].filter(Boolean).join(', ')}`
  }

  /* saves the order in the database (so it shows in the customer's history and in the admin panel) and opens WhatsApp.
     If the server cannot be reached the WhatsApp order still goes out. */
  const order = async (e) => {
    e.preventDefault()
    setErr('')
    if (!/^[6-9]\d{9}$/.test(f.phone)) return setErr('Please enter a valid 10-digit mobile number.')
    if (f.pincode && !/^\d{6}$/.test(f.pincode)) return setErr('Pincode must be 6 digits.')
    setBusy(true)
    const w = window.open('about:blank', '_blank') // opened inside the click so the browser does not block it
    let no = ''
    let saved = false
    try {
      const r = await api('/orders', {
        method: 'POST',
        token,
        body: {
          name: f.name.trim(),
          phone: f.phone,
          address: f.address.trim(),
          city: f.city.trim(),
          pincode: f.pincode,
          items: items.map((x) => ({ id: String(x.id), name: x.name, price: x.price, qty: x.qty, ...(x.opt ? { opt: x.opt } : {}), ...(x.img ? { img: x.img } : {}), ...(x.url ? { url: x.url } : {}) })),
        },
      })
      no = r.data.orderNo
      saved = true
    } catch (x) {
      if (!x.offline) {
        setBusy(false)
        if (w) w.close()
        return setErr(x.message)
      }
    }
    const url = `${WA}?text=${encodeURIComponent(waText(no))}`
    if (w) w.location.href = url
    setBurst((b) => b + 1)
    setPlaced({ no, url, saved })
    if (saved) clear()
    setBusy(false)
  }

  if (placed)
    return (
      <div className="ct-page">
        <div className="ct-head">
          <h1>Thank you</h1>
        </div>
        <section className="ct-card" style={{ padding: '2rem 1.8rem', maxWidth: 520 }}>
          <div className="ac-done">
                  <b>{placed.saved ? 'Order placed' : 'Sent to WhatsApp'}</b>
                  {placed.no && <p>Your order number is <strong>{placed.no}</strong></p>}
                  <p className="ac-hint">
                    {placed.saved
                      ? customer
                        ? <>Track it under <a href="/account">My Account</a>. Our team will call you to confirm.</>
                        : <>Our team will call you to confirm. <a href="/account">Create an account</a> to track your orders.</>
                      : 'We could not save the order online, but your WhatsApp message has the full details.'}
                  </p>
                  <a className="ct-btn" href={placed.url} target="_blank" rel="noopener noreferrer">Open WhatsApp</a>
                </div>
        </section>
      </div>
    )

  return (
    <div className="ct-page">
      {ORBS.map(([x, y, s, t], i) => (
        <span key={i} className="ct-orb" style={{ '--x': x, '--y': y, '--s': s, '--t': t }} aria-hidden="true" />
      ))}

      <div className="ct-head">
        <h1>Your Cart</h1>
        <p>{count ? `${count} item${count > 1 ? 's' : ''} ready for free installation` : 'Nothing here yet'}</p>
      </div>

      {!items.length ? (
        <section className="ct-card ct-empty">
          <div className="ct-drop" aria-hidden="true">
            <i style={{ '--k': 0 }} />
            <i style={{ '--k': 1 }} />
            <svg viewBox="0 0 24 24">
              <defs>
                <linearGradient id="ctg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0b3f66" />
                  <stop offset="1" stopColor="#0d8d97" />
                </linearGradient>
              </defs>
              <path d="M12 2.5S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5z" fill="url(#ctg)" />
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Add a purifier or a spare part and it will show up here.</p>
          <a className="ct-btn" href={hrefOf('ro')}>
            Browse purifiers <Arrow />
          </a>
        </section>
      ) : (
        <div className="ct-grid">
          <section className="ct-card ct-list" aria-label="Cart items">
            {items.map((x, i) => (
              <article className={'ct-row' + (out.includes(x.id) ? ' out' : '')} style={{ '--i': i }} key={x.id}>
                <div className="ct-img">
                  <img src={x.img} alt={x.name} loading="lazy" />
                </div>
                <div className="ct-info">
                  <h3>{x.url ? <a href={x.url}>{x.name}</a> : x.name}</h3>
                  {x.opt && <small>{x.opt}</small>}
                  <span className="ct-each">
                    {inr(x.price)}
                    {x.mrp > x.price && <s>{inr(x.mrp)}</s>}
                  </span>
                  <div className="ct-qty">
                    <button aria-label="Decrease quantity" onClick={() => setQty(x.id, x.qty - 1)}>
                      −
                    </button>
                    <b key={x.qty}>{x.qty}</b>
                    <button aria-label="Increase quantity" onClick={() => setQty(x.id, x.qty + 1)}>
                      +
                    </button>
                  </div>
                </div>
                <div className="ct-side">
                  <b key={x.qty} className="ct-line">
                    {inr(x.price * x.qty)}
                  </b>
                  <button className="ct-rm" onClick={() => del(x.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
            <button className="ct-clear" onClick={clear}>
              Clear cart
            </button>
          </section>

          <aside className="ct-card ct-sum" aria-label="Order summary">
            <h2>Order summary</h2>
            <dl>
              <div>
                <dt>Subtotal ({count})</dt>
                <dd>{inr(Math.round(shown))}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd className="ok">Free</dd>
              </div>
              <div>
                <dt>Installation</dt>
                <dd className="ok">Free</dd>
              </div>
            </dl>
            <div className="ct-total">
              <span>Total</span>
              <b>{inr(Math.round(shown))}</b>
            </div>
            <small className="ct-tax">Inclusive of all taxes</small>

            {open ? (
              <form className="ac-checkout" onSubmit={order}>
                <input required placeholder="Full name" aria-label="Full name" value={f.name} onChange={up('name')} maxLength={100} autoComplete="name" />
                <input required placeholder="Mobile number" aria-label="Mobile number" value={f.phone} onChange={up('phone')} inputMode="numeric" maxLength={10} autoComplete="tel" />
                <textarea required rows={2} placeholder="Delivery address" aria-label="Delivery address" value={f.address} onChange={up('address')} maxLength={500} autoComplete="street-address" />
                <div className="row">
                  <input placeholder="City" aria-label="City" value={f.city} onChange={up('city')} maxLength={100} />
                  <input placeholder="Pincode" aria-label="Pincode" value={f.pincode} onChange={up('pincode')} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
                </div>
                {err && <p className="ac-err" role="alert">{err}</p>}
                {!customer && (
                  <p className="ac-hint">
                    <a href="/account">Login</a> to keep this order in your order history.
                  </p>
                )}
                <div className="ct-cta">
                  <button className="ct-btn pulse" disabled={busy}>
                    {busy ? 'Placing order…' : 'Place order on WhatsApp'} <Arrow />
                  </button>
                  {burst > 0 && (
                    <span className="ct-burst" key={burst} aria-hidden="true">
                      {Array.from({ length: 14 }, (_, i) => (
                        <i key={i} style={{ '--a': i * (360 / 14) + 'deg', '--d': 70 + (i % 3) * 26 + 'px' }} />
                      ))}
                    </span>
                  )}
                </div>
              </form>
            ) : (
              <div className="ct-cta">
                <button className="ct-btn pulse" onClick={() => setOpen(true)}>
                  Proceed to order <Arrow />
                </button>
              </div>
            )}
            <a className="ct-btn ghost" href={hrefOf('ro')}>
              Continue shopping
            </a>
            <ul className="ct-trust">
              <li>Free installation</li>
              <li>Free shipping</li>
              <li>Easy EMI</li>
            </ul>
          </aside>
        </div>
      )}
    </div>
  )
}