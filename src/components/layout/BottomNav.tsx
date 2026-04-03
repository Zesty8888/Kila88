import { Home, Search, ShoppingCart, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '@/store'
import { cn } from '@/lib/utils'

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/search', icon: Search, label: '搜索' },
  { path: '/cart', icon: ShoppingCart, label: '购物车' },
  { path: '/profile', icon: User, label: '我的' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { totalItems } = useCart()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-4 py-1 transition-smooth',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 2} />
                {tab.path === '/cart' && totalItems > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full gradient-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full gradient-primary" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}