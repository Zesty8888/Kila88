import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, Package, ShoppingCart, Ticket,
  Bell, Award, LogOut, ChevronLeft, Menu, Star
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/users', icon: Users, label: '用户管理' },
  { to: '/products', icon: Package, label: '商品管理' },
  { to: '/orders', icon: ShoppingCart, label: '订单管理' },
  { to: '/coupons', icon: Ticket, label: '优惠券管理' },
  { to: '/notifications', icon: Bell, label: '推送通知' },
  { to: '/points', icon: Award, label: '积分管理' },
  { to: '/reviews', icon: Star, label: '评价管理' },
];

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-30 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
      style={{ background: 'hsl(var(--sidebar))' }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/8">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">L</span>
        </div>
        {!collapsed && (
          <span className="ml-3 text-white font-semibold text-lg tracking-tight">LUXE Admin</span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-white/50 hover:text-white/80 transition-colors"
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/8">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-white/80 text-sm font-medium truncate">{user.name}</p>
            <p className="text-white/40 text-xs truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">退出登录</span>}
        </button>
      </div>
    </aside>
  );
}
