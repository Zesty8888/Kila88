import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Star, MessageSquare } from 'lucide-react';

interface Review {
  id: number;
  user_id: number;
  product_id: number;
  user_name: string;
  product_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ reviews: Review[] }>('/admin/reviews').then(res => {
      if (res.success && res.data) setReviews(res.data.reviews);
      setLoading(false);
    });
  }, []);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">评价管理</h1>
        <p className="text-muted-foreground text-sm mt-1">共 {reviews.length} 条评价，平均 {avgRating} 分</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
              <Star size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">平均评分</p>
              <p className="text-2xl font-bold">{avgRating} <span className="text-sm font-normal text-muted-foreground">/ 5</span></p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">评价总数</p>
              <p className="text-2xl font-bold">{reviews.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {r.user_name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-medium text-sm">{r.user_name}</p>
                  <p className="text-xs text-muted-foreground">评价「{r.product_name}」</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 pl-12">{r.comment}</p>
            <p className="text-xs text-muted-foreground mt-2 pl-12">{new Date(r.created_at).toLocaleString('zh-CN')}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">暂无评价</div>
        )}
      </div>
    </div>
  );
}
