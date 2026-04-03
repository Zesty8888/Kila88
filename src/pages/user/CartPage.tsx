import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart, useOrders, useToast, useUser } from '@/store'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function CartPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated } = useUser()
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart()
  const { placeOrder } = useOrders()
  const [checkingOut, setCheckingOut] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    detail: '',
  })

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/20" />
        <p className="mt-4 text-base font-medium text-muted-foreground">请先登录</p>
        <Button variant="gradient" className="mt-6" onClick={() => navigate('/login')}>
          去登录
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/20" />
        <p className="mt-4 text-base font-medium text-muted-foreground">购物车是空的</p>
        <p className="mt-1 text-sm text-muted-foreground/60">去看看有什么好东西吧</p>
        <Button variant="gradient" className="mt-6" onClick={() => navigate('/')}>
          去购物
        </Button>
      </div>
    )
  }

  const handleCheckout = async () => {
    if (!address.name || !address.phone || !address.detail) {
      toast('请填写完整的收货信息', 'error')
      return
    }
    setCheckingOut(true)

    const result = await placeOrder(address.name, address.phone, address.detail)

    if (result.error) {
      toast(result.error, 'error')
      setCheckingOut(false)
      return
    }

    toast('订单提交成功！')
    setShowCheckoutModal(false)
    setCheckingOut(false)
    navigate('/profile')
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-card/95 px-4 pb-3 pt-6 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <h1 className="text-lg font-bold text-foreground">购物车 ({totalItems})</h1>
        </div>
      </header>

      {/* Cart Items */}
      <div className="mx-auto max-w-lg space-y-3 px-4 py-4">
        {items.map(item => (
          <div
            key={item.product.id}
            className="flex gap-3 rounded-2xl bg-card p-3 shadow-sm transition-smooth hover:shadow-elegant animate-scale-in"
          >
            <button
              onClick={() => navigate(`/product/${item.product.id}`)}
              className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl"
            >
              <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
            </button>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="line-clamp-2 text-sm font-medium text-foreground">{item.product.name}</p>
                <p className="mt-1 text-sm font-bold text-primary">{formatPrice(item.product.price)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(String(item.product.id), item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-foreground transition-smooth hover:bg-primary/10"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(String(item.product.id), item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-foreground transition-smooth hover:bg-primary/10"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={() => { removeFromCart(String(item.product.id)); toast('已移除商品') }}
                  className="text-muted-foreground transition-smooth hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">合计</p>
            <p className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</p>
          </div>
          <Button variant="gradient" size="xl" onClick={() => setShowCheckoutModal(true)}>
            结算 ({totalItems})
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setShowCheckoutModal(false)}>
          <div
            className="w-full max-w-lg rounded-t-3xl bg-card p-6 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground">确认订单</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">收货人</label>
                <input
                  type="text"
                  value={address.name}
                  onChange={e => setAddress(a => ({ ...a, name: e.target.value }))}
                  placeholder="请输入收货人姓名"
                  className="mt-1 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">联系电话</label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                  placeholder="请输入联系电话"
                  className="mt-1 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">收货地址</label>
                <input
                  type="text"
                  value={address.detail}
                  onChange={e => setAddress(a => ({ ...a, detail: e.target.value }))}
                  placeholder="请输入详细收货地址"
                  className="mt-1 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-4 rounded-xl bg-secondary/50 p-3 space-y-2">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1 flex-1">{item.product.name} x{item.quantity}</span>
                  <span className="font-medium text-foreground ml-2">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-border/50 pt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">合计</span>
                <span className="text-lg font-bold text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCheckoutModal(false)}>
                取消
              </Button>
              <Button variant="gradient" className="flex-1" onClick={handleCheckout} disabled={checkingOut}>
                {checkingOut ? '提交中...' : '确认下单'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
