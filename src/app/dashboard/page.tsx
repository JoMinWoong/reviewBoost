import { supabase } from '@/lib/supabase';
import styles from './dashboard.module.css';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  // Fetch feedback for all tenants (for now, eventually filter by merchant)
  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('*, tenants(name)')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Error loading dashboard.</div>;
  }

  const avgRating = feedback.length 
    ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1)
    : 0;

  const lowRatings = feedback.filter(f => f.rating <= 3).length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>店舗管理ダッシュボード</h1>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>平均評価</span>
            <Star className={styles.icon} />
          </div>
          <div className={styles.statValue}>{avgRating}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>総フィードバック数</span>
            <MessageSquare className={styles.icon} />
          </div>
          <div className={styles.statValue}>{feedback.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>要対応 (1-3星)</span>
            <TrendingUp className={styles.icon} style={{ color: '#dc3545' }} />
          </div>
          <div className={styles.statValue} style={{ color: '#dc3545' }}>{lowRatings}</div>
        </div>
      </div>

      <section className={styles.feedbackSection}>
        <h2>最新のフィードバック</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>日付</th>
              <th>店舗</th>
              <th>評価</th>
              <th>コメント</th>
              <th>顧客情報</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((f) => (
              <tr key={f.id} className={f.rating <= 3 ? styles.alertRow : ''}>
                <td>{new Date(f.created_at).toLocaleDateString('ja-JP')}</td>
                <td>{f.tenants?.name}</td>
                <td>
                  <div className={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={s <= f.rating ? styles.starFilled : styles.starEmpty} 
                        size={16}
                      />
                    ))}
                  </div>
                </td>
                <td>
                  {f.comment || '-'}
                  {(f.staff_rating || f.cleanliness_rating || f.taste_rating) && (
                    <div className={styles.detailSummary}>
                      {f.staff_rating && <span>接客:{f.staff_rating} </span>}
                      {f.cleanliness_rating && <span>清潔:{f.cleanliness_rating} </span>}
                      {f.taste_rating && <span>味:{f.taste_rating} </span>}
                    </div>
                  )}
                </td>
                <td>{f.customer_name || '匿名'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
