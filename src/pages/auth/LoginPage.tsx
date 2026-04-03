import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Eye, EyeOff, ShoppingBag } from 'lucide-react'
import { useUser, useToast } from '@/store'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useUser()
  const toast = useToast()
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      toast('请填写完整信息', 'error')
      return
    }

    if (isRegister && !form.name) {
      toast('请输入昵称', 'error')
      return
    }

    setLoading(true)
    setTimeout(() => {
      login(isRegister ? form.name : form.email.split('@')[0], form.email)
      toast(isRegister ? '注册成功，欢迎来到 LUXE Mall！' : '登录成功！')
      setLoading(false)
      navigate('/')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary transition-smooth hover:bg-secondary/80"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      </header>

      <div className="mx-auto max-w-sm px-6 pt-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <ShoppingBag className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">LUXE Mall</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister ? '创建您的账号' : '欢迎回来'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">昵称</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="您的昵称"
                className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-smooth focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">邮箱</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="your@email.com"
              className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-smooth focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">密码</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="至少6位密码"
                className="w-full rounded-xl bg-secondary px-4 py-3 pr-12 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-smooth focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            size="xl"
            disabled={loading}
          >
            {loading ? '处理中...' : (isRegister ? '注册' : '登录')}
          </Button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-muted-foreground transition-smooth hover:text-primary"
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>

        {/* Quick login hint */}
        <div className="mt-8 rounded-xl bg-primary/5 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            演示模式：输入任意邮箱和密码即可体验
          </p>
        </div>
      </div>
    </div>
  )
}