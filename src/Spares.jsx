/* Spares page: option list on the left, glass product cards on the right.
   Classes are prefixed sps- so nothing clashes with the other pages. */
import { Fragment, useRef, useState } from 'react'
import { PHONE, WA, inr } from './data.js'
import payImg from './assets/pay-methods.png'
import { TrustStrip } from './Cro.jsx'
import { mrpFor } from './pricing.js'
import { findSpare, spareInfo, spareTabs, spares } from './sparesData.js'
import { toggleWish, useAccount } from './accountStore.js'

const price = (p) => (p.price == null ? 'Price on request' : inr(p.price) + (p.max ? ' – ' + inr(p.max) : ''))

const Heart = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 8 3.5 4.8 6.8 4.8c2 0 3.5 1.1 5.2 3 1.7-1.9 3.2-3 5.2-3 3.3 0 5.2 3.2 4 6.4-1.7 4.7-9.2 9.3-9.2 9.3z" />
  </svg>
)

/* Splits a label into words + letters so every letter can ripple like a wave (CSS: .sps-w / .sps-ch) */
const Label = ({ text }) => {
  let c = 0
  return (
    <span className="sps-lbl" aria-hidden="true">
      {text.split(' ').map((w, wi) => (
        <Fragment key={wi}>
          <span className="sps-w">
            {[...w].map((ch, ci) => (
              <span className="sps-ch" style={{ '--c': c++ }} key={ci}>
                {ch}
              </span>
            ))}
          </span>{' '}
        </Fragment>
      ))}
    </span>
  )
}

export default function Spares({ addCart }) {
  const [tab, setTab] = useState(() => {
    const t = new URLSearchParams(window.location.search).get('tab')
    return spareTabs.some(([k]) => k === t) ? t : spareTabs[0][0]
  })
  const { wishlist } = useAccount()
  const isLiked = (p) => wishlist.some((x) => x.id === 'sp-' + p.name)
  const [rip, setRip] = useState(null)
  const tabsRef = useRef(null)
  const list = spares.filter((s) => s.cat === tab)

  const pick = (e, k, idx) => {
    const r = e.currentTarget.getBoundingClientRect()
    setRip({
      k,
      id: Date.now(),
      x: e.detail ? e.clientX - r.left : r.width / 2,
      y: e.detail ? e.clientY - r.top : r.height / 2,
    })

    // splash: every option jolts sideways, the farther from the clicked one the later (a wave runs through the list)
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (k !== tab && !reduce && tabsRef.current) {
      const vertical = window.matchMedia('(max-width: 900px)').matches
      ;[...tabsRef.current.children].forEach((el, j) => {
        if (!el.animate) return
        const d = Math.abs(j - idx)
        const amp = Math.max(6, 20 - d * 2)
        el.animate(
          vertical
            ? [{ transform: 'translateY(0)' }, { transform: `translateY(${-amp}px)`, offset: 0.35 }, { transform: `translateY(${amp / 2}px)`, offset: 0.65 }, { transform: 'none' }]
            : [{ transform: 'translateX(0) skewX(0)' }, { transform: `translateX(${amp}px) skewX(-5deg)`, offset: 0.3 }, { transform: `translateX(${-amp / 2}px) skewX(3deg)`, offset: 0.62 }, { transform: 'none' }],
          { duration: 800, delay: d * 60, easing: 'cubic-bezier(.2,.8,.3,1)' }
        )
      })
    }
    setTab(k)
    try {
      window.history.replaceState(null, '', window.location.pathname + '?tab=' + k)
    } catch (err) {
      /* ignore */
    }
  }

  return (
    <div className="sp-page sps">
      <div className="sp-head">
        <h1>Spares</h1>
        <div className="sp-crumb">
          <a href="/">Home</a> › <span>Spares</span>
        </div>
      </div>

      <div className="sps-layout">
        {/* LEFT: option list – the rows themselves move as a wave */}
        <aside className="sps-side" aria-label="Spare categories">
          <div className="sps-tabs" ref={tabsRef}>
            {spareTabs.map(([k, t], i) => (
              <button
                key={k}
                type="button"
                style={{ '--i': i }}
                className={'sps-tab' + (tab === k ? ' on' : '')}
                aria-label={t}
                aria-pressed={tab === k}
                onClick={(e) => pick(e, k, i)}
              >
                <i className="sps-dot" aria-hidden="true" />
                <Label text={t} />
                <em className="sps-shine" aria-hidden="true" />
                {rip && rip.k === k && (
                  <span key={rip.id} className="sps-rip" style={{ left: rip.x, top: rip.y }} aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT: product cards */}
        <section className="sps-stage" aria-live="polite">
          <div className="sps-grid" key={tab}>
            {list.map((p) => (
              <article className="sps-card" key={p.name}>
                <span className="sps-tag">Spares</span>
                <button
                  type="button"
                  className={'sps-heart' + (isLiked(p) ? ' on' : '')}
                  aria-label="Save"
                  aria-pressed={isLiked(p)}
                  onClick={() => toggleWish({ id: 'sp-' + p.name, name: p.name, img: p.img, price: p.price, url: '/spare/' + p.slug })}
                >
                  <Heart />
                </button>

                <a className="sps-circle" href={'/spare/' + p.slug} aria-label={'View ' + p.name}>
                  <img src={p.img} alt={p.name} loading="lazy" />
                </a>

                <div className="sps-info">
                  <h3>
                    <a href={'/spare/' + p.slug}>
                      {p.name}
                    </a>
                  </h3>
                  <p>Olivar · RO purifier spare</p>
                  <div className="sps-row">
                    <span className="sps-pr">
                      {p.price != null && mrpFor(p.name, p.price) > 0 && <s>{inr(mrpFor(p.name, p.price))}</s>}
                      <b>{price(p)}</b>
                    </span>
                    {p.price == null ? (
                      <a
                        className="sps-add"
                        href={`${WA}?text=${encodeURIComponent('Enquiry: ' + p.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={'Enquire about ' + p.name}
                      >
                        ?
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="sps-add"
                        onClick={() => addCart({ id: 'sp-' + p.name, name: p.name, img: p.img, price: p.price, mrp: mrpFor(p.name, p.price) })}
                        aria-label={'Add ' + p.name + ' to cart'}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

/* Spare product page – same layout as the machine page: image fixed on the left, details scroll on the right */
export function SpareDetail({ slug, addCart }) {
  const p = findSpare(slug)
  const [q, setQ] = useState(1)
  if (!p)
    return (
      <div className="sp-page sp-empty">
        <h3>Spare not found</h3>
        <a className="sp-btn" href="/shop/spares">
          Back to spares
        </a>
      </div>
    )
  const info = spareInfo[p.cat]
  const mrp = p.price != null ? mrpFor(p.name, p.price) : 0
  const save = mrp > 0 ? Math.round(((mrp - p.price) / mrp) * 100) : 0
  const wa = `${WA}?text=${encodeURIComponent(`I want to buy ${p.name} (x${q})`)}`
  const rows = [
    ['Model', p.name],
    ['Brand', 'Olivar'],
    ['Category', 'Spares – ' + info.label],
    ...info.tech,
    ['Price', p.price == null ? 'On request — call ' + PHONE : price(p) + ' (inclusive of all taxes)'],
    ['Installation', 'Fitting by Aakash Pure Aqua Tech technicians on request'],
  ]
  const related = spares.filter((x) => x.cat === p.cat && x.slug !== p.slug)
  return (
    <div className="sp-page sp-pd">
      <div className="sp-crumb">
        <a href="/">Home</a> › <a href="/shop/spares">Spares</a> ›{' '}
        <a href={'/shop/spares?tab=' + p.cat}>{info.label}</a> › <span>{p.name}</span>
      </div>
      <div className="sp-pdl">
        <div className="sp-left">
          <div className="sp-pimg">
            <img src={p.img} alt={p.name} width="600" height="600" decoding="async" />
          </div>
        </div>
        <div className="sp-pinfo">
          <h1>{p.name}</h1>
          <p className="sp-desc">{info.about[0]}</p>
          <h2>Best Features</h2>
          <ul className="sp-bf">
            {info.features.map((f) => (
              <li key={f}>
                <span>✦</span>
                {f}
              </li>
            ))}
          </ul>

          <div className="sp-buybox">
            <h3>{p.name}</h3>
            <div className="sp-bp">
              <b>{price(p)}</b>
              {save > 0 && (
                <>
                  <s>MRP: {inr(mrp)}</s>
                  <em>Save {save}%</em>
                </>
              )}
            </div>
            <small>Tax included.</small>
            {p.max && <p className="sp-msg">Multiple variants available — call {PHONE} to choose the right option.</p>}
            <div className="sp-qty">
              <span>Quantity</span>
              <div>
                <button aria-label="Decrease quantity" onClick={() => setQ(Math.max(1, q - 1))}>
                  −
                </button>
                <b>{q}</b>
                <button aria-label="Increase quantity" onClick={() => setQ(q + 1)}>
                  +
                </button>
              </div>
            </div>
            <p className="sp-call">
              For product inquiries, call us now at <b>{PHONE}</b>
            </p>
            <a className="sp-btn full" href={wa} target="_blank" rel="noreferrer">
              {p.price == null ? 'Enquire on WhatsApp' : 'Buy it now'}
            </a>
            <div className="sp-pay">
              <span>Safe &amp; Secure Checkout</span>
              <img src={payImg} alt="Google Pay, PhonePe, Mastercard, Visa, Paytm, Cash on Delivery" width="535" height="80" loading="lazy" />
            </div>
            <TrustStrip />
            {p.price != null && (
              <button
                className="sp-btn ghost full"
                onClick={() =>
                  addCart(
                    { id: 'sp-' + p.name, name: p.name, img: p.img, price: p.price, mrp: mrpFor(p.name, p.price), url: '/spare/' + p.slug },
                    q,
                  )
                }
              >
                Add to cart
              </button>
            )}
            <a className="sp-btn ghost full" href={WA} target="_blank" rel="noreferrer">
              Request a call back
            </a>
            <details>
              <summary>Shipping &amp; Return policy</summary>
              <p>Free shipping on all orders over TN. Money guarantee and 24 hours service support.</p>
            </details>
          </div>

          <div className="sp-abt">
            <h2>About Product</h2>
            {info.about.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            <h2>Technical Details</h2>
            <div className="sp-tablewrap">
              <table className="sp-spec">
                <tbody>
                  {rows.map(([a, b]) => (
                    <tr key={a}>
                      <th>{a}</th>
                      <td>{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="sp-related" aria-labelledby="rel-h">
          <h2 id="rel-h">You may also like</h2>
          <div className="sp-rel-grid">
            {related.slice(0, 4).map((r) => (
              <a className="sp-rel" key={r.slug} href={'/spare/' + r.slug}>
                <img src={r.img} alt={r.name} width="300" height="300" loading="lazy" decoding="async" />
                <b>{r.name}</b>
                <span>{price(r)}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
