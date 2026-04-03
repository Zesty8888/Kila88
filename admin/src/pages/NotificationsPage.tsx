import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Plus, Bell, Send, X } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  target: string;
  created_at: string;
}

const typeLabels: Record<string, string> = { promo: '促销', system: '系统', order: '订单', points: '积分' };
const typeColors: Record<string, string> = {
  promo: 'bg-orange-100 text-orange-700',
  system: 'bg-blue-100 text-blue-700',
  order: 'bg-green-100 text-green-700',
  points: 'bg-purple-100 text-purple-700',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'promo', target: 'all' });

  const load = () => {
    api.get<{ notifications: Notification[] }>('/admin/notifications').then(res => {
      if (res.success && res.data) setNotifications(res.data.notifications);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleSend = async () => {
    if (!form.title || !form.content) return;
    await api.post('/admin/notifications', form);
    setShowForm(false);
    setForm({ title: '', content: '', type: 'promo', target: 'all' });
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
          <h1 className="text-2xl font-bold">推送通知</h1>
          <p className="text-muted-foreground text-sm mt-1">共 {notifications.length} 条通知</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> 发送通知
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{n.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColors[n.type] || 'bg-gray-100 text-gray-700'}`}>
                    {typeLabels[n.type] || n.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{n.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>目标：{n.target === 'all' ? '全部用户' : n.target}</span>
                  <span>{new Date(n.created_at).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">暂无通知记录</div>
        )}
      </div>

      {/* Send Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">发送通知</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">标题</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" placeholder="通知标题" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">内容</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none" placeholder="通知内容..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">类型</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                    <option value="promo">促销</option>
                    <option value="system">系统</option>
                    <option value="order">订单</option>
                    <option value="points">积分</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">目标</label>
                  <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                    <option value="all">全部用户</option>
                    <option value="vip">VIP用户</option>
                    <option value="new">新用户</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSend}
                className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Send size={16} /> 发送通知
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
