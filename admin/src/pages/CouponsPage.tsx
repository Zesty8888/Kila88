import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Edit2, Save, X } from 'lucide-react';

interface Coupon {
  id: number;
  code: string;
  name: string;
  type: string;
  value: number;
  min_purchase: number;
  total_count: number;
  used_count: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

const typeLabels: Record<string, string> = { fixed: '满减', percent: '折扣' };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    code: '', name: '', type: 'fixed', value: '', min_purchase: '',
    total_count: '100', start_date: '', end_date: '', status: 'active'
  });

  const load = () => {
    api.get<{ coupons: Coupon[] }>('/admin/coupons').then(res => {
      if (res.success && res.data) setCoupons(res.data.coupons);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const openNew = () => {
    setEditId(null);
    const now = new Date();
    const later = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    setForm({
      code: `LUXE${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: '', type: 'fixed', value: '', min_purchase: '',
      total_count: '100',
      start_date: now.toISOString().split('T')[0],
      end_date: later.toISOString().split('T')[0],
      status: 'active'
    });
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditId(c.id);
    setForm({
      code: c.code, name: c.name, type: c.type, value: String(c.value),
      min_purchase: String(c.min_purchase), total_count: String(c.total_count),
      start_date: c.start_date?.split('T')[0] || '', end_date: c.end_date?.split('T')[0] || '',
      status: c.status
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const body = {
      code: form.code, name: form.name, type: form.type,
      value: Number(form.value), min_purchase: Number(form.min_purchase),
      total_count: Number(form.total_count),
      start_date: form.start_date, end_date: form.end_date, status: form.status
    };
    if (editId) {
      await api.put(`/admin/coupons/${editId}`, body);
    } else {
      await api.post('/admin/coupons', body);
    }
    setShowForm(false);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">优惠券管理</h1>
          <p className="text-muted-foreground text-sm mt-1">共 {coupons.length} 张优惠券</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> 创建优惠券
        </button>
      </div>

      {/* Coupon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(c => (
          <div key={c.id} className={`relative bg-card rounded-xl border overflow-hidden ${c.status === 'active' ? 'border-border' : 'border-border opacity-60'}`}>
            {/* Coupon ticket design */}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-muted-foreground">{c.code}</span>
                  <h3 className="font-semibold mt-1">{c.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.status === 'active' ? '生效中' : '已停用'}
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                {c.type === 'fixed' ? (
                  <><span className="text-3xl font-bold text-primary">¥{c.value}</span><span className="text-sm text-muted-foreground">满{c.min_purchase}可用</span></>
                ) : (
                  <><span className="text-3xl font-bold text-primary">{c.value}折</span><span className="text-sm text-muted-foreground">满{c.min_purchase}可用</span></>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>已领 {c.used_count}/{c.total_count}</span>
                <span>{c.start_date?.split('T')[0]} ~ {c.end_date?.split('T')[0]}</span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (c.used_count / c.total_count) * 100)}%` }} />
              </div>

              <button onClick={() => openEdit(c)}
                className="mt-3 w-full py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5">
                <Edit2 size={13} /> 编辑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editId ? '编辑优惠券' : '创建优惠券'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">券码</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">类型</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                    <option value="fixed">满减</option>
                    <option value="percent">折扣</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">名称</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{form.type === 'fixed' ? '减免金额' : '折扣'}</label>
                  <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">最低消费</label>
                  <input type="number" value={form.min_purchase} onChange={e => setForm({ ...form, min_purchase: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">总数量</label>
                <input type="number" value={form.total_count} onChange={e => setForm({ ...form, total_count: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">开始日期</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">结束日期</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
                </div>
              </div>
              {editId && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">状态</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                    <option value="active">生效</option>
                    <option value="inactive">停用</option>
                  </select>
                </div>
              )}
              <button onClick={handleSave}
                className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                {editId ? '保存修改' : '创建优惠券'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
