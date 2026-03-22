'use client';

import { useMemo, useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Cell
} from 'recharts';
import { Star, TrendingUp, MessageSquare, Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './analysis.module.css';

interface FeedbackItem {
  id: string;
  created_at: string;
  rating: number;
  staff_rating?: number;
  cleanliness_rating?: number;
  taste_rating?: number;
}

interface AnalysisDashboardProps {
  feedback: FeedbackItem[];
}

export default function AnalysisDashboard({ feedback }: AnalysisDashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    if (!feedback.length) return null;

    const avgRating = feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length;
    const avgStaff = feedback.filter(f => f.staff_rating).reduce((acc, curr) => acc + (curr.staff_rating || 0), 0) / feedback.filter(f => f.staff_rating).length || 0;
    const avgClean = feedback.filter(f => f.cleanliness_rating).reduce((acc, curr) => acc + (curr.cleanliness_rating || 0), 0) / feedback.filter(f => f.cleanliness_rating).length || 0;
    const avgTaste = feedback.filter(f => f.taste_rating).reduce((acc, curr) => acc + (curr.taste_rating || 0), 0) / feedback.filter(f => f.taste_rating).length || 0;

    // Radar Chart Data (Snowflake)
    const radarData = [
      { subject: '接客 (Staff)', A: avgStaff, fullMark: 5 },
      { subject: '清潔 (Clean)', A: avgClean, fullMark: 5 },
      { subject: '味 (Taste)', A: avgTaste, fullMark: 5 },
      { subject: '総合 (Overall)', A: avgRating, fullMark: 5 },
      { subject: '鮮度 (Recency)', A: 4.5, fullMark: 5 }, // Placeholder for volume trend
    ];

    // Rating Distribution
    const distribution = [5, 4, 3, 2, 1].map(stars => ({
      name: `${stars}星`,
      count: feedback.filter(f => f.rating === stars).length,
      color: stars >= 4 ? '#28a745' : stars === 3 ? '#ffc107' : '#dc3545'
    }));

    // Category Comparison
    const categories = [
      { name: '接客', score: parseFloat(avgStaff.toFixed(1)) },
      { name: '清潔', score: parseFloat(avgClean.toFixed(1)) },
      { name: '味', score: parseFloat(avgTaste.toFixed(1)) },
    ];

    // Trend (Daily grouping)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const trendData = last7Days.map(date => {
      const dayFeedback = feedback.filter(f => f.created_at.startsWith(date));
      return {
        date: date.slice(5), // MM-DD
        reviews: dayFeedback.length,
        avg: dayFeedback.length ? dayFeedback.reduce((acc, curr) => acc + curr.rating, 0) / dayFeedback.length : 0
      };
    });

    return { radarData, distribution, categories, trendData, avgRating, total: feedback.length };
  }, [feedback]);

  if (!stats) return <div>データがありません</div>;
  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backLink}>
        <ArrowLeft size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
        ダッシュボードへ戻る
      </Link>
      
      <header className={styles.header}>
        <h1>詳細分析レポート</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Activity className={styles.icon} />
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>平均評価</span>
            <Star size={16} />
          </div>
          <div className={styles.statValue}>{stats.avgRating.toFixed(1)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>総フィードバック数</span>
            <MessageSquare size={16} />
          </div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span>パフォーマンス</span>
            <TrendingUp size={16} />
          </div>
          <div className={styles.statValue}>安定</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <h2>フィードバック・スノーフレーク (Radar)</h2>
          <div className={styles.radarContainer}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#007bff"
                  fill="#007bff"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <h2>評価分布</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={stats.distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={40} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${styles.card} ${styles.fullRow}`}>
          <h2>過去7日間のトレンド (Volume & Rating)</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={stats.trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#007bff" />
                <YAxis yAxisId="right" orientation="right" stroke="#ffc107" domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="reviews" name="件数" stroke="#007bff" activeDot={{ r: 8 }} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="avg" name="平均評価" stroke="#ffc107" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <h2>カテゴリー別平均</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={stats.categories}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="score" fill="#007bff" radius={[4, 4, 0, 0]} label={{ position: 'top' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <h2>主要なインサイト</h2>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong>強み:</strong> {stats.categories.reduce((a, b) => a.score > b.score ? a : b).name}が高評価です。
            </p>
            <p>
              <strong>要改善:</strong> {stats.categories.reduce((a, b) => a.score < b.score ? a : b).name}の評価が相対的に低くなっています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
