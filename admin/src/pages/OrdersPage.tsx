import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, Eye, Truck, Save, X } from 'lucide-react';

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

interface Order {
  id: string;
  user_id: number;
  user_name?: string;
  user_email?: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  addressName: string;
  addressPhone: string;
  addressDetail: string;
  tracking_number: string;
  carrier: string;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: '待付款', paid: '已付款', shipped: '已发货', delivered: '已完成', cancelled: '已取消'
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ status: '', tracking_number: '', carrier: '' });
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const load = () => {
    api.get<{ orders: Order[] }>('/admin/orders').then(res => {
      if (res.success && res.data) setOrders(res.data.orders);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const startEdit = (o: Order) => {
    setEditId(o.id);
    setEditData({ status: o.status, tracking_number: o.tracking_number || '', carrier: o.carrier || '' });
  };

  const saveEdit = async () => {
    if (!editId) return;
    await api.put(`/admin/orders/${editId}`, editData);
    setEditId(null);
    load();
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.user_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">订单管理</h1>
        <p className="text-muted-foreground text-sm mt-1">共 {orders.length} 笔订单</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索订单号/用户..."
            className="pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all w-64" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}>
              {s === 'all' ? '全部' : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">订单号</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">用户</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">金额</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">状态</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">物流</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">时间</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs">{o.id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-sm">{o.user_name || '-'}</p>
                      <p className="text-xs text-muted-foreground">{o.user_email || ''}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold">¥{o.totalPrice?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {editId === o.id ? (
                      <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}
                        className="px-2 py-1 border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/50">
                        {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[o.status] || o.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editId === o.id ? (
                      <div className="flex gap-1">
                        <input value={editData.carrier} onChange={e => setEditData({ ...editData, carrier: e.target.value })} placeholder="快递"
                          className="px-2 py-1 border border-border rounded text-xs w-16 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                        <input value={editData.tracking_number} onChange={e => setEditData({ ...editData, tracking_number: e.target.value })} placeholder="单号"
                          className="px-2 py-1 border border-border rounded text-xs w-24 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{o.carrier ? `${o.carrier}: ${o.tracking_number}` : '-'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('zh-CN') : '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {editId === o.id ? (
                        <>
                          <button onClick={saveEdit} className="p-1.5 rounded-md hover:bg-green-50 text-green-600 transition-colors"><Save size={15} /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"><X size={15} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setViewOrder(o)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye size={15} /></button>
                          <button onClick={() => startEdit(o)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Truck size={15} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewOrder(null)}>
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">订单详情</h2>
              <button onClick={() => setViewOrder(null)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">订单号：</span><span className="font-mono text-xs">{viewOrder.id}</span></div>
                <div><span className="text-muted-foreground">状态：</span><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[viewOrder.status]}`}>{statusLabels[viewOrder.status]}</span></div>
                <div><span className="text-muted-foreground">用户：</span>{viewOrder.user_name}</div>
                <div><span className="text-muted-foreground">金额：</span><span className="font-semibold">¥{viewOrder.totalPrice}</span></div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium mb-2">收货信息</p>
                <p className="text-sm text-muted-foreground">{viewOrder.addressName} {viewOrder.addressPhone}</p>
                <p className="text-sm text-muted-foreground">{viewOrder.addressDetail}</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium mb-2">商品列表</p>
                <div className="space-y-2">
                  {viewOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <img src={item.image} alt="" className="w-10 h-10 rounded-md object-cover bg-muted" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">¥{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
