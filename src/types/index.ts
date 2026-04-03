export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  images: string[]
  category: string
  stock: number
  rating: number
  reviewCount: number
  sales: number
  isOnSale?: boolean
  tags?: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Review {
  id: string
  userName: string
  avatar: string
  productId: string
  rating: number
  content: string
  date: string
  reply?: string
}

export interface OrderItem {
  product: Product
  quantity: number
  price: number
}

export interface Order {
  id: string
  items: OrderItem[]
  totalPrice: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  addressName: string
  addressPhone: string
  addressDetail: string
}

export interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}