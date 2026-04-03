import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Heart, Settings, MapPin, Clock, Package, Truck, CheckCircle, XCircle, LogOut, Bell, Lock, User as UserIcon } from 'lucide-react'
import { useUser, useFavorites, useOrders, useToast } from '@/store'
import { formatPrice, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getProductById } from '@/data/mock'

const statusConfig = {
  pending: { label: '待付款', icon: Clock, color: 'text-warning' },
  paid: { label: '待发货', icon: Package, color: 'text-primary' },
  shipped: { label: '运输中', icon: Truck, color: 'text-primary' },
  delivered: { label: '已完成', icon: CheckCircle, color: 'text-success' },
  cancelled: { label: '已取消', icon: XCircle, color: 'text-muted-foreground' },
}

export function ProfilePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, logout } = useUser()
  const { favorites } = useFavorites()
  const { orders } = useOrders()
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'settings'>('orders')

  const handleLogout = () => {
    logout()
    toast('已退出登录', 'info')
    navigate('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="gradient-primary px-4 pb-8 pt-8">
          <div className="mx-auto max-w-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 text-2xl text-primary-foreground">
                ?
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary-foreground">未登录</h2>
                <p className="text-sm text-primary-foreground/70">登录后享受更多服务</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-lg px-4 -mt-4">
          <div className="rounded-2xl bg-card p-6 shadow-elegant text-center">
            <p className="text-sm text-muted-foreground mb-4">登录后可以查看订单、收藏和个人信息</p>
            <Button variant="gradient" onClick={() => navigate('/login')}>
              立即登录
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const favoriteProducts = favorites
    .map(id => getProductById(id))
    .filter(Boolean)

  return (
    <div className="min-h-screen pb-4">
      {/* Profile Header */}
      <div className="gradient-primary px-4 pb-8 pt-8">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 text-2xl font-bold text-primary-foreground">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-foreground">{user.name}</h2>
              <p className="text-sm text-primary-foreground/70">{user.email}</p>
            </div>
          </div>
          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-4 rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm">
            <button onClick={() => setActiveTab('orders')} className="text-center">
              <p className="text-xl font-bold text-primary-foreground">{orders.length}</p>
              <p className="text-xs text-primary-foreground/70">全部订单</p>
            </button>
            <button onClick={() => setActiveTab('favorites')} className="text-center">
              <p className="text-xl font-bold text-primary-foreground">{favorites.length}</p>
              <p className="text-xs text-primary-foreground/70">我的收藏</p>
            </button>
            <div className="text-center">
              <p className="text-xl font-bold text-primary-foreground">3</p>
              <p className="text-xs text-primary-foreground/70">优惠券</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4">
        {/* Quick Order Status */}
        <div className="-mt-4 rounded-2xl bg-card p-4 shadow-elegant">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">我的订单</h3>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(['pending', 'paid', 'shipped', 'delivered'] as const).map(status => {
              const config = statusConfig[status]
              const count = orders.filter(o => o.status === status).length
              const Icon = config.icon
              return (
                <button key={status} className="flex flex-col items-center gap-1.5 rounded-xl py-2 transition-smooth hover:bg-secondary">
                  <div className="relative">
                    <Icon className={cn('h-6 w-6', config.color)} />
                    {count > 0 && (
                      <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full gradient-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {count}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{config.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex gap-1 rounded-xl bg-secondary p-1">
          {([
            { key: 'orders' as const, label: '订单' },
            { key: 'favorites' as const, label: '收藏' },
            { key: 'settings' as const, label: '设置' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-smooth',
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="mt-4 space-y-3">
            {orders.length === 0 ? (
              <div className="rounded-2xl bg-card p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/20" />
                <p className="mt-3 text-sm text-muted-foreground">暂无订单</p>
                <Button variant="gradient" size="sm" className="mt-4" onClick={() => navigate('/')}>
                  去购物
                </Button>
              </div>
            ) : (
              orders.map(order => {
                const config = statusConfig[order.status]
                return (
                  <div key={order.id} className="rounded-2xl bg-card p-4 shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{order.id}</span>
                      <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="line-clamp-1 text-sm text-foreground">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                          </div>
                          <p className="text-sm font-medium text-foreground">{formatPrice(item.price)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                      <span className="text-xs text-muted-foreground">{order.createdAt}</span>
                      <span className="text-sm font-bold text-foreground">合计 {formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="mt-4">
            {favoriteProducts.length === 0 ? (
              <div className="rounded-2xl bg-card p-8 text-center">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground/20" />
                <p className="mt-3 text-sm text-muted-foreground">还没有收藏的商品</p>
                <Button variant="gradient" size="sm" className="mt-4" onClick={() => navigate('/')}>
                  去逛逛
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {favoriteProducts.map(product => product && (
                  <button
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="overflow-hidden rounded-xl bg-card text-left transition-smooth hover:shadow-card-hover animate-scale-in"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-smooth hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-sm font-medium text-foreground">{product.name}</p>
                      <p className="mt-1 text-sm font-bold text-primary">{formatPrice(product.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="mt-4 rounded-2xl bg-card overflow-hidden">
            {[
              { icon: UserIcon, label: '个人信息', desc: '修改头像、昵称' },
              { icon: MapPin, label: '地址管理', desc: '管理收货地址' },
              { icon: Lock, label: '修改密码', desc: '更新登录密码' },
              { icon: Bell, label: '通知设置', desc: '消息推送偏好' },
              { icon: Settings, label: '账号设置', desc: '隐私和安全' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => toast('功能即将上线', 'info')}
                className="flex w-full items-center gap-3 border-b border-border/50 px-4 py-3.5 last:border-0 transition-smooth hover:bg-secondary/50"
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3.5 transition-smooth hover:bg-destructive/5"
            >
              <LogOut className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">退出登录</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}