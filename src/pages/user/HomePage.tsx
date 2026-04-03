import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Zap, TrendingUp, Sparkles, Smartphone, Shirt, Home as HomeIcon } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { api } from '@/lib/api'
import { normalizeProduct } from '@/types'
import type { Product } from '@/types'
import { Rating } from '@/components/ui/rating'
import { Badge } from '@/components/ui/badge'

const banners = [
  { id: 1, image: '/images/hero-banner-1.png', title: '春季焕新季' },
  { id: 2, image: '/images/hero-banner-2.png', title: '数码狂欢节' },
  { id: 3, image: '/images/hero-banner-3.png', title: '美妆盛典' },
]

const categories = [
  { id: 'all', name: '全部', icon: 'Grid3X3' },
  { id: '电子产品', name: '电子产品', icon: 'Smartphone' },
  { id: '服装', name: '服装', icon: 'Shirt' },
  { id: '美妆', name: '美妆', icon: 'Sparkles' },
  { id: '家居', name: '家居', icon: 'Home' },
]

const categoryIcons: Record<string, React.ReactNode> = {
  'Grid3X3': <Sparkles className="h-5 w-5" />,
  'Smartphone': <Smartphone className="h-5 w-5" />,
  'Shirt': <Shirt className="h-5 w-5" />,
  'Sparkles': <Sparkles className="h-5 w-5" />,
  'Home': <HomeIcon className="h-5 w-5" />,
}

export function HomePage() {
  const navigate = useNavigate()
  const [currentBanner, setCurrentBanner] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // Fetch products from API
  useEffect(() => {
    api.get('/products?sale=true&limit=8').then(res => {
      if (res.success && res.data?.products) {
        setSaleProducts(res.data.products.map(normalizeProduct))
      }
    })
    api.get('/products?sort=sales&limit=9').then(res => {
      if (res.success && res.data?.products) {
        setRecommendedProducts(res.data.products.map(normalizeProduct))
      }
    })
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header with Search */}
      <header className="sticky top-0 z-30 gradient-primary px-4 pb-4 pt-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-primary-foreground tracking-wide">LUXE Mall</h1>
            <span className="text-xs text-primary-foreground/70">发现品质生活</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card/95 px-3 py-2.5 shadow-elegant backdrop-blur-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索商品、品牌..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button onClick={handleSearch} className="rounded-lg gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                搜索
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4">
        {/* Banner Carousel */}
        <section className="mt-4">
          <div className="relative overflow-hidden rounded-2xl shadow-elegant">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {banners.map(banner => (
                <div key={banner.id} className="w-full flex-shrink-0">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-4">
              <p className="text-sm font-bold text-primary-foreground">{banners[currentBanner].title}</p>
            </div>
            <div className="absolute bottom-3 right-4 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBanner(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentBanner
                      ? 'w-6 bg-primary-foreground'
                      : 'w-1.5 bg-primary-foreground/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mt-6">
          <div className="grid grid-cols-5 gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.id)}`)}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-card p-3 transition-smooth hover:shadow-elegant"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {categoryIcons[cat.icon]}
                </div>
                <span className="text-xs font-medium text-foreground">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Flash Sale */}
        {saleProducts.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">限时特价</h2>
                <Badge variant="destructive">HOT</Badge>
              </div>
              <button
                onClick={() => navigate('/search?sale=true')}
                className="flex items-center gap-0.5 text-xs text-muted-foreground transition-smooth hover:text-primary"
              >
                查看全部 <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {saleProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="w-36 flex-shrink-0 overflow-hidden rounded-xl bg-card transition-smooth hover:shadow-card-hover"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-smooth hover:scale-105"
                      loading="lazy"
                    />
                    {product.originalPrice && (
                      <div className="absolute left-2 top-2 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-1 text-left text-xs font-medium text-foreground">{product.name}</p>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Products */}
        <section className="mt-6 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">为你推荐</h2>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {recommendedProducts.map(product => (
              <button
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="overflow-hidden rounded-xl bg-card text-left transition-smooth hover:shadow-card-hover"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-smooth hover:scale-105"
                    loading="lazy"
                  />
                  {product.tags?.[0] && (
                    <div className="absolute left-2 top-2 rounded-md gradient-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                      {product.tags[0]}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium text-foreground leading-snug">
                    {product.name}
                  </p>
                  <div className="mt-2">
                    <Rating value={product.rating} size="sm" />
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {product.sales > 1000 ? `${(product.sales / 1000).toFixed(1)}k` : product.sales}已售
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
