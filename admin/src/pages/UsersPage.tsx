import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Search, Edit2, Save, X } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  group_tag: string;
  points: number;
  avatar: string;
  created_at: string;
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  merchant: 'bg-purple-100 text-purple-700',
  user: 'bg-blue-100 text-blue-700',
};

const groupOptions = ['新用户', 'VIP', '活跃用户', '沉睡用户', '高价值'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get<{ users: User[] }>('/admin/users').then(res => {
      if (res.success && res.data) setUsers(res.data.users);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const startEdit = (u: User) => {
    setEditId(u.id);
    setEditData({ name: u.name, phone: u.phone, role: u.role, group_tag: u.group_tag });
  };

  const saveEdit = async () => {
    if (!editId) return;
    await api.put(`/admin/users/${editId}`, editData);
    setEditId(null);
    load();
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold">用户管理</h1>
          <p className="text-muted-foreground text-sm mt-1">共 {users.length} 名用户</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索用户..."
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">用户</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">邮箱</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">电话</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">角色</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">分组</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">积分</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">注册时间</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {u.name[0]}
                      </div>
                      {editId === u.id ? (
                        <input value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })}
                          className="px-2 py-1 border border-border rounded text-sm w-24 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                      ) : (
                        <span className="font-medium">{u.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 px-4">
                    {editId === u.id ? (
                      <input value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })}
                        className="px-2 py-1 border border-border rounded text-sm w-28 focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    ) : (
                      <span className="text-muted-foreground">{u.phone || '-'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editId === u.id ? (
                      <select value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })}
                        className="px-2 py-1 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary/50">
                        <option value="user">用户</option>
                        <option value="merchant">商家</option>
                        <option value="admin">管理员</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>
                        {u.role === 'admin' ? '管理员' : u.role === 'merchant' ? '商家' : '用户'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editId === u.id ? (
                      <select value={editData.group_tag || ''} onChange={e => setEditData({ ...editData, group_tag: e.target.value })}
                        className="px-2 py-1 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary/50">
                        <option value="">无分组</option>
                        {groupOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    ) : (
                      <span className="text-muted-foreground">{u.group_tag || '-'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium">{u.points}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString('zh-CN')}</td>
                  <td className="py-3 px-4">
                    {editId === u.id ? (
                      <div className="flex gap-1">
                        <button onClick={saveEdit} className="p-1.5 rounded-md hover:bg-green-50 text-green-600 transition-colors"><Save size={15} /></button>
                        <button onClick={() => setEditId(null)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"><X size={15} /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(u)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Edit2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
