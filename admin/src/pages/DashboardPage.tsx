import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  Users, Package, ShoppingCart, DollarSign, Clock, UserPlus, AlertTriangle, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todayOrders: number;
  newUsers7d: number;
  lowStock: number;
  salesByDay: { date: string; orders: number; revenue: number }[];
  topProducts: { id: number; name: string; sales: number; price: number; stock: number; images: string[] }[];
  categoryStats: { category: string; count: number; total_sales: number }[];
  orderStats: { status: string; count: number }[];
  userGroups: { group_tag: string; count: number }[];
}

const statusLabels: Record<string, string> = {
  pending: '待付款', paid: '已付款', shipped: '已发货', delivered: '已完成', cancelled: '已取消'
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/admin/stats').then(res => {
      if (res.success && res.data) setStats(res.data);
    });
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const kpiCards = [
    { label: '总用户数', value: stats.totalUsers, icon: Users, color: 'from-indigo-500 to-indigo-600', change: `+${stats.newUsers7d} 近7日` },
    { label: '总商品数', value: stats.totalProducts, icon: Package, color: 'from-purple-500 to-purple-600', change: `${stats.lowStock} 库存不足` },
    { label: '总订单数', value: stats.totalOrders, icon: ShoppingCart, color: 'from-pink-500 to-pink-600', change: `${stats.pendingOrders} 待处理` },
    { label: '总营收', value: `¥${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', change: `今日 ${stats.todayOrders} 单` },
  ];

  const orderPieData = stats.orderStats.map(s => ({ name: statusLabels[s.status] || s.status, value: s.count }));
  const categoryData = stats.categoryStats.map(c => ({ name: c.category || '其他', products: c.count, sales: c.total_sales || 0 }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">仪表盘</h1>
        <p className="text-muted-foreground text-sm mt-1">商城运营数据概览</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{card.change}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">近7日销售趋势</h3>
          <div className="h-[280px]">
            {stats.salesByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 90%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" name="营收" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">暂无近7日数据</div>
            )}
          </div>
        </div>

        {/* Order Status Pie */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">订单状态分布</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderPieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {orderPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">热销商品 TOP 5</h3>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                }`}>{i + 1}</span>
                <img src={p.images?.[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">¥{p.price} · 库存 {p.stock}</p>
                </div>
                <span className="text-sm font-semibold text-primary">{p.sales} 件</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Stats */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">商品分类统计</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 90%)" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
                <Tooltip />
                <Bar dataKey="sales" name="销量" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
