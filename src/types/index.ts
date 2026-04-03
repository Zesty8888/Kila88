export interface Product {
  id: string | number
  name: string
  price: number
  originalPrice?: number | null
  original_price?: number | null
  description: string
  images: string[]
  category: string
  stock: number
  rating: number
  reviewCount?: number
  review_count?: number
  sales: number
  isOnSale?: boolean
  is_on_sale?: number | boolean
  tags?: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Review {
  id: string | number
  userName?: string
  user_name?: string
  avatar?: string
  user_avatar?: string
  productId?: string | number
  product_id?: string | number
  rating: number
  content?: string
  comment?: string
  date?: string
  created_at?: string
  reply?: string
}

export interface OrderItem {
  productId?: number
  name?: string
  image?: string
  product?: Product
  quantity: number
  price: number
}

export interface Order {
  id: string
  items: OrderItem[]
  totalPrice: number
  total_price?: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  createdAt?: string
  created_at?: string
  addressName?: string
  address_name?: string
  addressPhone?: string
  address_phone?: string
  addressDetail?: string
  address_detail?: string
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

// Normalize product from backend
export function normalizeProduct(p: any): Product {
  return {
    id: String(p.id),
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice ?? p.original_price ?? undefined,
    description: p.description || '',
    images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : []),
    category: p.category || '',
    stock: p.stock || 0,
    rating: p.rating || 4.5,
    reviewCount: p.reviewCount ?? p.review_count ?? 0,
    sales: p.sales || 0,
    isOnSale: !!(p.isOnSale ?? p.is_on_sale),
    tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? JSON.parse(p.tags) : []),
  }
}

// Normalize review from backend
export function normalizeReview(r: any): Review {
  return {
    id: String(r.id),
    userName: r.user_name ?? r.userName ?? '匿名',
    avatar: r.user_avatar ?? r.avatar ?? '',
    productId: String(r.product_id ?? r.productId ?? ''),
    rating: r.rating,
    content: r.comment ?? r.content ?? '',
    date: r.created_at ?? r.date ?? '',
  }
}

// Normalize order from backend
export function normalizeOrder(o: any): Order {
  return {
    id: o.id,
    items: Array.isArray(o.items)
      ? o.items.map((item: any) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
        }))
      : (typeof o.items === 'string' ? JSON.parse(o.items) : []),
    totalPrice: o.totalPrice ?? o.total_price ?? 0,
    status: o.status,
    createdAt: o.createdAt ?? o.created_at ?? '',
    addressName: o.addressName ?? o.address_name ?? '',
    addressPhone: o.addressPhone ?? o.address_phone ?? '',
    addressDetail: o.addressDetail ?? o.address_detail ?? '',
  }
}
