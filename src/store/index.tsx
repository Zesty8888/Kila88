import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { Product, CartItem, Order } from '@/types'
import { normalizeProduct, normalizeOrder } from '@/types'
import { api, setToken, clearToken, getToken } from '@/lib/api'

/* ─── Toast ─── */
interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

/* ─── User ─── */
interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  points?: number
}

/* ─── State ─── */
interface StoreState {
  user: User | null
  cart: CartItem[]
  favorites: string[]
  orders: Order[]
  toasts: Toast[]
  loading: boolean
}

/* ─── Actions ─── */
type StoreAction =
  | { type: 'SET_USER'; user: User | null }
  | { type: 'LOGOUT' }
  | { type: 'SET_CART'; cart: CartItem[] }
  | { type: 'ADD_TO_CART'; product: Product; quantity: number }
  | { type: 'UPDATE_CART_QTY'; productId: string; quantity: number }
  | { type: 'REMOVE_FROM_CART'; productId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_FAVORITES'; favorites: string[] }
  | { type: 'TOGGLE_FAVORITE'; productId: string }
  | { type: 'SET_ORDERS'; orders: Order[] }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'SET_LOADING'; loading: boolean }

/* ─── Initial state ─── */
const initialState: StoreState = {
  user: null,
  cart: [],
  favorites: [],
  orders: [],
  toasts: [],
  loading: !!getToken(),
}

/* ─── Reducer ─── */
function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user, loading: false }

    case 'LOGOUT':
      return { ...state, user: null, cart: [], favorites: [], orders: [], loading: false }

    case 'SET_CART':
      return { ...state, cart: action.cart }

    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => String(i.product.id) === String(action.product.id))
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i =>
            String(i.product.id) === String(action.product.id)
              ? { ...i, quantity: i.quantity + action.quantity }
              : i
          ),
        }
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.product, quantity: action.quantity }],
      }
    }

    case 'UPDATE_CART_QTY':
      if (action.quantity <= 0) {
        return { ...state, cart: state.cart.filter(i => String(i.product.id) !== action.productId) }
      }
      return {
        ...state,
        cart: state.cart.map(i =>
          String(i.product.id) === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => String(i.product.id) !== action.productId) }

    case 'CLEAR_CART':
      return { ...state, cart: [] }

    case 'SET_FAVORITES':
      return { ...state, favorites: action.favorites }

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.productId)
          ? state.favorites.filter(id => id !== action.productId)
          : [...state.favorites, action.productId],
      }

    case 'SET_ORDERS':
      return { ...state, orders: action.orders }

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] }

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }

    case 'SET_LOADING':
      return { ...state, loading: action.loading }

    default:
      return state
  }
}

/* ─── Context ─── */
const StoreContext = createContext<{
  state: StoreState
  dispatch: React.Dispatch<StoreAction>
} | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState)

  // Auto-login if token exists
  useEffect(() => {
    if (getToken()) {
      api.get('/auth/me').then(res => {
        if (res.success && res.data?.user) {
          const u = res.data.user
          dispatch({
            type: 'SET_USER',
            user: { id: String(u.id), name: u.name, email: u.email, phone: u.phone || '', avatar: u.avatar || '', points: u.points },
          })
          // Load cart
          api.get('/cart').then(r => {
            if (r.success && r.data?.cart) {
              dispatch({
                type: 'SET_CART',
                cart: r.data.cart.map((c: any) => ({ product: normalizeProduct(c.product), quantity: c.quantity })),
              })
            }
          })
          // Load favorites
          api.get('/favorites').then(r => {
            if (r.success && r.data?.ids) {
              dispatch({ type: 'SET_FAVORITES', favorites: r.data.ids.map(String) })
            }
          })
          // Load orders
          api.get('/orders').then(r => {
            if (r.success && r.data?.orders) {
              dispatch({ type: 'SET_ORDERS', orders: r.data.orders.map(normalizeOrder) })
            }
          })
        } else {
          clearToken()
          dispatch({ type: 'SET_USER', user: null })
        }
      }).catch(() => {
        clearToken()
        dispatch({ type: 'SET_USER', user: null })
      })
    }
  }, [])

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

/* ─── Convenience hooks ─── */
export function useToast() {
  const { dispatch } = useStore()
  return (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString()
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3000)
  }
}

export function useCart() {
  const { state, dispatch } = useStore()
  return {
    items: state.cart,
    totalItems: state.cart.reduce((s, i) => s + i.quantity, 0),
    totalPrice: state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0),
    addToCart: async (product: Product, quantity: number = 1) => {
      dispatch({ type: 'ADD_TO_CART', product, quantity })
      await api.post('/cart', { productId: Number(product.id), quantity })
    },
    updateQuantity: async (productId: string, quantity: number) => {
      dispatch({ type: 'UPDATE_CART_QTY', productId, quantity })
      if (quantity <= 0) {
        await api.delete(`/cart/${productId}`)
      } else {
        await api.put(`/cart/${productId}`, { quantity })
      }
    },
    removeFromCart: async (productId: string) => {
      dispatch({ type: 'REMOVE_FROM_CART', productId })
      await api.delete(`/cart/${productId}`)
    },
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
  }
}

export function useFavorites() {
  const { state, dispatch } = useStore()
  return {
    favorites: state.favorites,
    isFavorite: (id: string) => state.favorites.includes(String(id)),
    toggleFavorite: async (id: string) => {
      dispatch({ type: 'TOGGLE_FAVORITE', productId: String(id) })
      await api.post(`/favorites/${id}`, {})
    },
  }
}

export function useUser() {
  const { state, dispatch } = useStore()
  return {
    user: state.user,
    loading: state.loading,
    isAuthenticated: !!state.user,
    login: async (email: string, password: string): Promise<string | null> => {
      const res = await api.post('/auth/login', { email, password })
      if (!res.success) return res.error || '登录失败'
      setToken(res.data.token)
      const u = res.data.user
      dispatch({
        type: 'SET_USER',
        user: { id: String(u.id), name: u.name, email: u.email, phone: u.phone || '', avatar: u.avatar || '', points: u.points },
      })
      // Sync cart, favorites, orders
      api.get('/cart').then(r => {
        if (r.success && r.data?.cart) {
          dispatch({ type: 'SET_CART', cart: r.data.cart.map((c: any) => ({ product: normalizeProduct(c.product), quantity: c.quantity })) })
        }
      })
      api.get('/favorites').then(r => {
        if (r.success && r.data?.ids) {
          dispatch({ type: 'SET_FAVORITES', favorites: r.data.ids.map(String) })
        }
      })
      api.get('/orders').then(r => {
        if (r.success && r.data?.orders) {
          dispatch({ type: 'SET_ORDERS', orders: r.data.orders.map(normalizeOrder) })
        }
      })
      return null
    },
    register: async (name: string, email: string, password: string, phone?: string): Promise<string | null> => {
      const res = await api.post('/auth/register', { name, email, password, phone })
      if (!res.success) return res.error || '注册失败'
      setToken(res.data.token)
      const u = res.data.user
      dispatch({
        type: 'SET_USER',
        user: { id: String(u.id), name: u.name, email: u.email, phone: u.phone || '', avatar: '', points: 100 },
      })
      return null
    },
    logout: () => {
      clearToken()
      dispatch({ type: 'LOGOUT' })
    },
  }
}

export function useOrders() {
  const { state, dispatch } = useStore()
  return {
    orders: state.orders,
    placeOrder: async (addressName: string, addressPhone: string, addressDetail: string): Promise<{ orderId?: string; error?: string }> => {
      const res = await api.post('/orders', { addressName, addressPhone, addressDetail })
      if (!res.success) return { error: res.error || '下单失败' }
      // Refresh orders
      dispatch({ type: 'CLEAR_CART' })
      const ordersRes = await api.get('/orders')
      if (ordersRes.success && ordersRes.data?.orders) {
        dispatch({ type: 'SET_ORDERS', orders: ordersRes.data.orders.map(normalizeOrder) })
      }
      return { orderId: res.data?.orderId }
    },
    refreshOrders: async () => {
      const res = await api.get('/orders')
      if (res.success && res.data?.orders) {
        dispatch({ type: 'SET_ORDERS', orders: res.data.orders.map(normalizeOrder) })
      }
    },
  }
}
