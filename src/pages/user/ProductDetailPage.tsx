import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Heart, Minus, Plus, ShoppingCart, Star, MessageSquare, Share2 } from 'lucide-react'
import { useCart, useFavorites, useToast, useUser } from '@/store'
import { formatPrice, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Rating } from '@/components/ui/rating'
import { Badge } from '@/components/ui/badge'
import { getProductById, getReviewsByProductId } from '@/data/mock'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isAuthenticated } = useUser()
  const [quantity, setQuantity] = useState(1)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  const product = id ? getProductById(id) : undefined
  const reviews = id ? getReviewsByProductId(id) : []
  const favorite = id ? isFavorite(id) : false

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">商品不存在</p>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    addToCart(product, quantity)
    toast(`已加入购物车 x${quantity}`)
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    addToCart(product, quantity)
    navigate('/cart')
  }

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (id) {
      toggleFavorite(id)
      toast(favorite ? '已取消收藏' : '已加入收藏')
    }
  }

  const handleShare = () => {
    toast('链接已复制到剪贴板', 'info')
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Floating Header */}
      <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-4 pt-4 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-sm transition-smooth hover:bg-card"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-sm transition-smooth hover:bg-card"
          >
            <Share2 className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={handleToggleFavorite}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-sm transition-smooth hover:bg-card"
          >
            <Heart className={cn('h-5 w-5 transition-smooth', favorite ? 'fill-destructive text-destructive' : 'text-foreground')} />
          </button>
        </div>
      </header>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.images[activeImageIdx]}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIdx(i)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === activeImageIdx ? 'w-6 bg-primary' : 'w-2 bg-card/60'
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-lg px-4">
        {/* Price & Name */}
        <div className="mt-4 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && (
              <Badge variant="destructive">
                省{formatPrice(product.originalPrice - product.price)}
              </Badge>
            )}
          </div>
          <h1 className="mt-3 text-lg font-bold text-foreground leading-tight">{product.name}</h1>
          <div className="mt-2 flex items-center gap-4">
            <Rating value={product.rating} size="sm" showValue />
            <span className="text-xs text-muted-foreground">{product.reviewCount} 评价</span>
            <span className="text-xs text-muted-foreground">{product.sales} 已售</span>
          </div>
          {product.tags && product.tags.length > 0 && (
            <div className="mt-3 flex gap-2">
              {product.tags.map(tag => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="mt-3 rounded-2xl bg-card p-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">商品详情</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">库存</span>
              <span className={cn('text-xs font-medium', product.stock < 50 ? 'text-destructive' : 'text-foreground')}>
                {product.stock} 件
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">分类</span>
              <span className="text-xs font-medium text-foreground">{product.category}</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">用户评价 ({reviews.length})</h3>
            </div>
            {reviews.length > 3 && (
              <span className="text-xs text-muted-foreground">查看全部</span>
            )}
          </div>
          {reviews.length > 0 ? (
            <div className="mt-3 space-y-4">
              {reviews.slice(0, 4).map(review => (
                <div key={review.id} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {review.userName.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{review.userName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }, (_, i) => (
                        <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
                  {review.reply && (
                    <div className="mt-2 rounded-lg bg-secondary/50 p-2.5">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-primary">商家回复：</span>
                        {review.reply}
                      </p>
                    </div>
                  )}
                  <p className="mt-1 text-[10px] text-muted-foreground/60">{review.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-center text-sm text-muted-foreground">暂无评价</p>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground transition-smooth hover:bg-primary/10"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-foreground">{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-foreground transition-smooth hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button variant="outline" className="flex-1 gap-2" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" /> 加入购物车
          </Button>
          <Button variant="gradient" className="flex-1" onClick={handleBuyNow}>
            立即购买
          </Button>
        </div>
      </div>
    </div>
  )
}