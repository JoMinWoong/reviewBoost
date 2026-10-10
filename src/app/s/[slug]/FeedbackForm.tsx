'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import styles from './feedback.module.css';

export default function FeedbackForm({ tenant }: { tenant: any }) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [staffRating, setStaffRating] = useState<number>(0);
  const [atmosphereRating, setAtmosphereRating] = useState<number>(0);
  const [qualityRating, setQualityRating] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const labels = { staff: '接客', atmosphere: '雰囲気', quality: '品質' };

  const handleRatingClick = (r: number) => {
    setRating(r);
  };

  const submitFeedback = async (r: number, c: string, extra: any = {}) => {
    // Validation: Require detail ratings for 1-3 stars
    if (r <= 3) {
      if (!extra.staff_rating || !extra.atmosphere_rating || !extra.quality_rating) {
        alert(`恐れ入りますが、${labels.staff}、${labels.atmosphere}、${labels.quality}のすべての評価を選択してください。`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          rating: r,
          comment: c,
          staffRating: extra.staff_rating || null,
          atmosphereRating: extra.atmosphere_rating || null,
          qualityRating: extra.quality_rating || null,
        }),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || '送信できませんでした。');
      }
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : '送信できませんでした。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.redirectArea}>
        <h2>フィードバックありがとうございます</h2>
        <p>よろしければ、公開レビューもご検討ください。投稿するかどうかは自由です。</p>
        
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

      </div>
    );
  }

  return (
    <div>
      <p className={styles.disclaimer}>「このご意見は一般公開されません」</p>
      <p>回答は店舗オーナーと共有します。オーナーがAI改善相談を実行した場合、コメントがOpenAIに送信されることがあります。ニックネームや年齢などは収集しません。<a href="/privacy">個人情報の取り扱い</a></p>
      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((s) => (
            <button
            type="button"
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

      {rating > 0 && !submitted && (
        <div className={styles.formArea}>
          <h3>{rating >= 4 ? '満足された点などはございましたか？' : '改善できる点はございましたか？'}</h3>
          <p>詳しく教えていただければ幸いです。</p>

          <div className={styles.detailRatingGrid}>
            <div className={styles.detailRatingItem}>
              <span>{labels.staff} {rating <= 3 && <span className={styles.requiredLabel}>*必須</span>}</span>
              <div className={styles.detailStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={styles.detailStarButton}
                    onClick={() => setStaffRating(s)}
                  >
                    <Star
                      size={24}
                      className={`${styles.detailStarIcon} ${staffRating >= s ? styles.starIconActive : ''}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.detailRatingItem}>
              <span>{labels.atmosphere} {rating <= 3 && <span className={styles.requiredLabel}>*必須</span>}</span>
              <div className={styles.detailStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={styles.detailStarButton}
                    onClick={() => setAtmosphereRating(s)}
                  >
                    <Star
                      size={24}
                      className={`${styles.detailStarIcon} ${atmosphereRating >= s ? styles.starIconActive : ''}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.detailRatingItem}>
              <span>{labels.quality} {rating <= 3 && <span className={styles.requiredLabel}>*必須</span>}</span>
              <div className={styles.detailStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={styles.detailStarButton}
                    onClick={() => setQualityRating(s)}
                  >
                    <Star
                      size={24}
                      className={`${styles.detailStarIcon} ${qualityRating >= s ? styles.starIconActive : ''}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <textarea
            className={styles.textArea}
            placeholder={rating >= 4 ? "よろしければ感想をお聞かせください..." : "その他のご意見..."}
            value={comment}
            maxLength={2000}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className={styles.submitButton}
            onClick={() => submitFeedback(rating, comment, {
              staff_rating: staffRating,
              atmosphere_rating: atmosphereRating,
              quality_rating: qualityRating
            })}
            disabled={loading}
          >
            {loading ? '送信中...' : 'フィードバックを送信'}
          </button>
        </div>
      )}
    </div>
  );
}
