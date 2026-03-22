import { supabase } from '@/lib/supabase';
import styles from './dashboard.module.css';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import FeedbackList from './FeedbackList';
import ThemeToggle from './ThemeToggle';

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
        <ThemeToggle />
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>最新のフィードバック</h2>
          <Link href="/dashboard/analysis" className={styles.analysisLink}>
            <TrendingUp size={18} style={{ marginRight: '4px' }} />
            詳細分析レポートを表示
          </Link>
        </div>
        <FeedbackList feedback={feedback} />
      </section>
    </div>
  );
}
