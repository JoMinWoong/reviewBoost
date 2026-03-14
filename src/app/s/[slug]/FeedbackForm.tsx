'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './feedback.module.css';

interface Tenant {
  id: string;
  name: string;
  google_maps_url: string;
  tabelog_url: string;
}

export default function FeedbackForm({ tenant }: { tenant: any }) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRatingClick = async (r: number) => {
    setRating(r);
    // If high rating, we can pre-submit or just wait.
    // Let's just set the state and let the user decide.
    if (r >= 4) {
      // Auto-submit high rating
      await submitFeedback(r, '');
    }
  };

  const submitFeedback = async (r: number, c: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        tenant_id: tenant.id,
        rating: r,
        comment: c,
        customer_name: name,
        customer_email: email,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  if (submitted && rating >= 4) {
    return (
      <div className={styles.redirectArea}>
        <h2>高評価をありがとうございます！</h2>
        <p>よろしければ、Googleマップや食べログでも感想をシェアしていただけませんか？</p>
        
        {tenant.google_maps_url && (
          <a href={tenant.google_maps_url} target="_blank" rel="noopener noreferrer" className={styles.redirectButton}>
            Googleマップで投稿する
          </a>
        )}
        
        {tenant.tabelog_url && (
          <a href={tenant.tabelog_url} target="_blank" rel="noopener noreferrer" className={styles.redirectButton} style={{ backgroundColor: '#ff9800' }}>
            食べログで投稿する
          </a>
        )}

        <div className={styles.couponArea}>
          <p className={styles.couponTitle}>ご協力感謝クーポン</p>
          <p>次回ご来店時にスタッフへご提示ください</p>
          <div className={styles.couponCode}>WELCOME5OFF</div>
          <p className={styles.couponDescription}>お会計から5% OFF</p>
        </div>
      </div>
    );
  }

  if (submitted && rating <= 3) {
    return (
      <div className={styles.container}>
        <h2>フィードバックありがとうございます</h2>
        <p>貴重なご意見として、改善に役立てさせていただきます。</p>
        <div className={styles.couponArea}>
          <p className={styles.couponTitle}>ご協力感謝クーポン</p>
          <p>次回ご来店時にスタッフへご提示ください</p>
          <div className={styles.couponCode}>THANKYOU100</div>
          <p className={styles.couponDescription}>次回ドリンク1杯無料</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            className={styles.starButton}
            onClick={() => handleRatingClick(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={`${styles.starIcon} ${(hover || rating) >= s ? styles.starIconActive : ''}`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && rating <= 3 && (
        <div className={styles.formArea}>
          <h3>改善できる点はございましたか？</h3>
          <p>具体的に教えていただければ幸いです。</p>
          <textarea
            className={styles.textArea}
            placeholder="改善点など..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <input
            className={styles.inputField}
            placeholder="お名前（任意）"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={styles.inputField}
            placeholder="メールアドレス（任意）"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className={styles.submitButton}
            onClick={() => submitFeedback(rating, comment)}
            disabled={loading}
          >
            {loading ? '送信中...' : 'フィードバックを送信'}
          </button>
        </div>
      )}

      {rating > 0 && rating >= 4 && !submitted && (
        <div className={styles.redirectArea}>
          <p>送信中...</p>
        </div>
      )}
    </div>
  );
}
