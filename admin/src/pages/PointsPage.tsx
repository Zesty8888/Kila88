import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Award, TrendingUp, TrendingDown } from 'lucide-react';

interface PointLog {
  id: number;
  user_id: number;
  user_name: string;
  email: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export default function PointsPage() {
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ logs: PointLog[]; totalEarned: number; totalSpent: number }>('/admin/points').then(res => {
      if (res.success && res.data) {
        setLogs(res.data.logs);
        setTotalEarned(res.data.totalEarned);
        setTotalSpent(res.data.totalSpent);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">积分管理</h1>
        <p className="text-muted-foreground text-sm mt-1">用户积分发放与消费记录</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">累计发放</p>
              <p className="text-2xl font-bold">{totalEarned.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
              <TrendingDown size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">累计消费</p>
              <p className="text-2xl font-bold">{totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">净流通</p>
              <p className="text-2xl font-bold">{(totalEarned - totalSpent).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">用户</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">变动</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">类型</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">描述</th>
                <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">时间</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{l.user_name}</p>
                      <p className="text-xs text-muted-foreground">{l.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${l.type === 'earn' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {l.type === 'earn' ? '+' : '-'}{Math.abs(l.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${l.type === 'earn' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {l.type === 'earn' ? '获得' : '消费'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{l.description}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="py-16 text-center text-muted-foreground">暂无积分记录</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
