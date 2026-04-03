import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { normalizeProduct } from '@/types'
import type { Product } from '@/types'
import { Rating } from '@/components/ui/rating'

const categories = [
  { id: 'all', name: '全部' },
  { id: '电子产品', name: '电子产品' },
  { id: '服装', name: '服装' },
  { id: '美妆', name: '美妆' },
  { id: '家居', name: '家居' },
  { id: '运动', name: '运动' },
]

export function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialQuery = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || 'all'
  const isSaleOnly = searchParams.get('sale') === 'true'

  const [query, setQuery] = useState(initialQuery)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'sales'>('default')
  const [showFilter, setShowFilter] = useState(false)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch from API when filters change
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (activeCategory && activeCategory !== 'all') params.set('category', activeCategory)
    if (sortBy !== 'default') params.set('sort', sortBy)
    if (isSaleOnly) params.set('sale', 'true')

    api.get(`/products?${params.toString()}`).then(res => {
      if (res.success && res.data?.products) {
        setResults(res.data.products.map(normalizeProduct))
      }
      setLoading(false)
    })
  }, [query, activeCategory, sortBy, isSaleOnly])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 px-4 pb-3 pt-6 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索商品..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={cn(
                'rounded-xl p-2.5 transition-smooth',
                showFilter ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              )}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Category chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-smooth',
                  activeCategory === cat.id
                    ? 'gradient-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort filters */}
          {showFilter && (
            <div className="mt-3 flex gap-2 animate-fade-in">
              {([
                ['default', '综合'],
                ['sales', '销量优先'],
                ['price-asc', '价格低到高'],
                ['price-desc', '价格高到低'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs transition-smooth',
                    sortBy === key
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Results */}
      <div className="mx-auto max-w-lg px-4 py-4">
        <p className="mb-3 text-xs text-muted-foreground">
          {loading ? '搜索中...' : `共找到 ${results.length} 件商品`}
        </p>

        {!loading && results.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <Search className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">未找到相关商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map(product => (
              <button
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="overflow-hidden rounded-xl bg-card text-left transition-smooth hover:shadow-card-hover animate-scale-in"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-smooth hover:scale-105"
                    loading="lazy"
                  />
                  {product.isOnSale && product.originalPrice && (
                    <div className="absolute left-2 top-2 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</p>
                  <div className="mt-1.5">
                    <Rating value={product.rating} size="sm" />
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {product.sales > 1000 ? `${(product.sales / 1000).toFixed(1)}k` : product.sales}已售
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
