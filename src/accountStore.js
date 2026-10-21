/* Shopper account state (login token, profile, wishlist) shared by the header, cart, Spares and /account.
   Plain module store + useSyncExternalStore, so no extra library. Token lives in localStorage. */
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { api } from './api.js'

const TOKEN_KEY = 'aakash-customer-v1'
const WISH_KEY = 'aakash-wish-v1'
const rd = (k, d) => {
  try {
    const v = JSON.parse(localStorage.getItem(k))
    return v == null ? d : v
  } catch {
    return d
  }
}
const wr = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* private mode */
  }
}

let state = { token: rd(TOKEN_KEY, null), customer: null, ready: !rd(TOKEN_KEY, null), wishlist: rd(WISH_KEY, []) }
const subs = new Set()
const set = (patch) => {
  state = { ...state, ...patch }
  subs.forEach((f) => f())
}
const subscribe = (f) => (subs.add(f), () => subs.delete(f))
export const useAccount = () => useSyncExternalStore(subscribe, () => state)

const saveWish = (items) => {
  wr(WISH_KEY, items)
  set({ wishlist: items })
  if (state.token) api('/customer/wishlist', { method: 'PUT', token: state.token, body: { items } }).catch(() => {})
}
export const wishHas = (id) => state.wishlist.some((x) => x.id === id)
export const toggleWish = (it) =>
  saveWish(wishHas(it.id) ? state.wishlist.filter((x) => x.id !== it.id) : [...state.wishlist, { id: it.id, name: it.name, img: it.img, price: it.price, url: it.url }])

const enter = async ({ token, customer }) => {
  wr(TOKEN_KEY, token)
  set({ token, customer, ready: true })
  // merge the wishlist picked as a guest with the one saved on the account
  try {
    const server = (await api('/customer/wishlist', { token })).data
    const merged = [...server, ...state.wishlist.filter((x) => !server.some((s) => s.id === x.id))]
    saveWish(merged)
  } catch {
    /* ignore */
  }
}

export const register = async (b) => enter((await api('/customer/register', { method: 'POST', body: b })).data)
export const login = async (email, password) => enter((await api('/customer/login', { method: 'POST', body: { email, password } })).data)
export const logout = () => {
  wr(TOKEN_KEY, null)
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
  set({ token: null, customer: null, ready: true })
}
export const saveProfile = async (patch) => {
  const c = (await api('/customer/me', { method: 'PATCH', token: state.token, body: patch })).data
  set({ customer: c })
  return c
}

/* call once in <App/>: restores the session on page load and keeps the saved cart in step with the account */
export function useAccountBoot(cart) {
  const { token, customer } = useAccount()
  const synced = useRef(null) // customer id whose cart merge has started
  const merged = useRef(null) // customer id whose cart merge has finished (only then do we save changes)
  useEffect(() => {
    if (!token || customer) return
    api('/customer/me', { token })
      .then((r) => set({ customer: r.data, ready: true }))
      .catch((e) => (e.status === 401 ? logout() : set({ ready: true })))
  }, [token, customer])

  // on login: merge the guest cart with the saved cart once
  useEffect(() => {
    if (!customer || synced.current === customer.id) return
    synced.current = customer.id
    api('/customer/cart', { token }).then((r) => {
      const server = r.data
      const local = cart.items
      const all = [...server.map((s) => ({ ...s, qty: Math.max(s.qty || 1, (local.find((l) => l.id === s.id) || {}).qty || 0) })), ...local.filter((l) => !server.some((s) => s.id === l.id))]
      cart.replace(all)
      merged.current = customer.id
    }).catch(() => {})
  }, [customer]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!customer) synced.current = merged.current = null
  }, [customer])

  // afterwards: every cart change is saved to the account
  useEffect(() => {
    if (!customer || merged.current !== customer.id) return
    const t = setTimeout(() => api('/customer/cart', { method: 'PUT', token, body: { items: cart.items } }).catch(() => {}), 700)
    return () => clearTimeout(t)
  }, [cart.items, customer, token])
}
