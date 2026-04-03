import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  description: string;
  images: string[];
  category: string;
  stock: number;
  sales: number;
  isOnSale: boolean;
  tags: string[];
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '', price: '', original_price: '', description: '', category: '',
    stock: '', images: '', is_on_sale: false, tags: '', status: 'active'
  });

  const load = () => {
    api.get<{ products: Product[] }>('/admin/products').then(res => {
      if (res.success && res.data) setProducts(res.data.products);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const openNew = () => {
    setEditId(null);
    setForm({ name: '', price: '', original_price: '', description: '', category: '', stock: '', images: '', is_on_sale: false, tags: '', status: 'active' });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name, price: String(p.price), original_price: p.originalPrice ? String(p.originalPrice) : '',
      description: p.description || '', category: p.category, stock: String(p.stock),
      images: p.images?.join('\n') || '', is_on_sale: p.isOnSale, tags: p.tags?.join(', ') || '', status: p.status
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const body = {
      name: form.name,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      description: form.description,
      category: form.category,
      stock: Number(form.stock),
      images: form.images.split('\n').filter(Boolean),
      is_on_sale: form.is_on_sale,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: form.status,
    };
    if (editId) {
      await api.put(`/admin/products/${editId}`, body);
    } else {
      await api.post('/admin/products', body);
    }
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该商品？')) return;
    await api.delete(`/admin/products/${id}`);
    load();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">商品管理</h1>
          <p className="text-muted-foreground text-sm mt-1">共 {products.length} 件商品</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> 添加商品
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索商品..."
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
            <div className="aspect-square bg-muted relative">
              <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
              {p.status !== 'active' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">已下架</span>
                </div>
              )}
              {p.isOnSale && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">特价</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-sm truncate">{p.name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-primary font-bold">¥{p.price}</span>
                {p.originalPrice && <span className="text-xs text-muted-foreground line-through">¥{p.originalPrice}</span>}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>库存 {p.stock}</span>
                <span>销量 {p.sales}</span>
              </div>
              <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                  <Edit2 size={12} /> 编辑
                </button>
                <button onClick={() => handleDelete(p.id)} className="flex items-center justify-center p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editId ? '编辑商品' : '添加商品'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">商品名称</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">价格</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">原价</label>
                  <input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" placeholder="可选" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">分类</label>
                  <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">库存</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">描述</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">图片URL（每行一个）</label>
                <textarea value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} rows={2}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none font-mono text-xs" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">标签（逗号分隔）</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_on_sale} onChange={e => setForm({ ...form, is_on_sale: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" />
                  特价商品
                </label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="active">上架</option>
                  <option value="inactive">下架</option>
                </select>
              </div>
              <button onClick={handleSave}
                className="w-full py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                {editId ? '保存修改' : '添加商品'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
