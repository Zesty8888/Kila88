import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { Product, CartItem, Order } from '@/types'

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
}

/* ─── State ─── */
interface StoreState {
  user: User | null
  cart: CartItem[]
  favorites: string[]
  orders: Order[]
  toasts: Toast[]
}

/* ─── Actions ─── */
type StoreAction =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TO_CART'; product: Product; quantity: number }
  | { type: 'UPDATE_CART_QTY'; productId: string; quantity: number }
  | { type: 'REMOVE_FROM_CART'; productId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_FAVORITE'; productId: string }
  | { type: 'PLACE_ORDER'; order: Order }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }

/* ─── LocalStorage helpers ─── */
const STORAGE_KEY = 'luxe_mall_state'

function loadState(): Partial<StoreState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

function saveState(state: StoreState) {
  try {
    const { toasts: _t, ...rest } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  } catch { /* ignore */ }
}

/* ─── Initial state ─── */
const saved = loadState()
const initialState: StoreState = {
  user: saved.user || null,
  cart: saved.cart || [],
  favorites: saved.favorites || [],
  orders: saved.orders || [],
  toasts: [],
}

/* ─── Reducer ─── */
function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.user }

    case 'LOGOUT':
      return { ...state, user: null, cart: [], favorites: [], orders: [] }

    case 'ADD_TO_CART': {
      const existing = state.cart.find(i => i.product.id === action.product.id)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.product.id === action.product.id
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
        return { ...state, cart: state.cart.filter(i => i.product.id !== action.productId) }
      }
      return {
        ...state,
        cart: state.cart.map(i =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => i.product.id !== action.productId) }

    case 'CLEAR_CART':
      return { ...state, cart: [] }

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.productId)
          ? state.favorites.filter(id => id !== action.productId)
          : [...state.favorites, action.productId],
      }

    case 'PLACE_ORDER':
      return { ...state, orders: [action.order, ...state.orders], cart: [] }

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] }

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }

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

  useEffect(() => { saveState(state) }, [state])

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
    addToCart: (product: Product, quantity: number = 1) =>
      dispatch({ type: 'ADD_TO_CART', product, quantity }),
    updateQuantity: (productId: string, quantity: number) =>
      dispatch({ type: 'UPDATE_CART_QTY', productId, quantity }),
    removeFromCart: (productId: string) =>
      dispatch({ type: 'REMOVE_FROM_CART', productId }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
  }
}

export function useFavorites() {
  const { state, dispatch } = useStore()
  return {
    favorites: state.favorites,
    isFavorite: (id: string) => state.favorites.includes(id),
    toggleFavorite: (id: string) => dispatch({ type: 'TOGGLE_FAVORITE', productId: id }),
  }
}

export function useUser() {
  const { state, dispatch } = useStore()
  return {
    user: state.user,
    isAuthenticated: !!state.user,
    login: (name: string, email: string) => {
      dispatch({
        type: 'LOGIN',
        user: {
          id: Date.now().toString(),
          name,
          email,
          phone: '138****8888',
          avatar: '',
        },
      })
    },
    logout: () => dispatch({ type: 'LOGOUT' }),
  }
}

export function useOrders() {
  const { state, dispatch } = useStore()
  return {
    orders: state.orders,
    placeOrder: (order: Order) => dispatch({ type: 'PLACE_ORDER', order }),
  }
}