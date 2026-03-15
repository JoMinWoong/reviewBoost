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
  const [staffRating, setStaffRating] = useState<number>(0);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(0);
  const [tasteRating, setTasteRating] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const handleRatingClick = (r: number) => {
    setRating(r);
  };

  const submitFeedback = async (r: number, c: string, extra: any = {}) => {
    // Validation: Require detail ratings for 1-3 stars
    if (r <= 3) {
      if (!extra.staff_rating || !extra.cleanliness_rating || !extra.taste_rating) {
        alert('恐れ入りますが、接客、清潔感、味のすべての評価を選択してください。');
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        tenant_id: tenant.id,
        rating: r,
        comment: c,
        staff_rating: extra.staff_rating,
        cleanliness_rating: extra.cleanliness_rating,
        taste_rating: extra.taste_rating,
        customer_name: name,
        customer_email: email,
        metadata: extra,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      if (err.message) {
        console.error('Error message:', err.message);
      }
      if (err.details) {
        console.error('Error details:', err.details);
      }
      if (err.hint) {
        console.error('Error hint:', err.hint);
      }
      alert(`送信に失敗しました。理由: ${err.message || '不明なエラー'}`);
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
          {!redeemed ? (
            <button
              className={styles.redeemButton}
              onClick={() => {
                if (window.confirm('スタッフに提示する際に「OK」を押してください。')) {
                  setRedeemed(true);
                }
              }}
            >
              クーポンを表示する
            </button>
          ) : (
            <>
              <p>次回ご来店時にスタッフへご提示ください</p>
              <div className={styles.couponCode}>WELCOME5OFF</div>
              <p className={styles.couponDescription}>お会計から5% OFF</p>
            </>
          )}
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
          {!redeemed ? (
            <button
              className={styles.redeemButton}
              onClick={() => {
                if (window.confirm('スタッフに提示する際に「OK」を押してください。')) {
                  setRedeemed(true);
                }
              }}
            >
              クーポンを表示する
            </button>
          ) : (
            <>
              <p>次回ご来店時にスタッフへご提示ください</p>
              <div className={styles.couponCode}>THANKYOU100</div>
              <p className={styles.couponDescription}>次回ドリンク1杯無料</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className={styles.disclaimer}>「このご意見は一般公開されません」</p>
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

      {rating > 0 && !submitted && (
        <div className={styles.formArea}>
          <h3>{rating >= 4 ? '満足された点などはございましたか？' : '改善できる点はございましたか？'}</h3>
          <p>詳しく教えていただければ幸いです。</p>

          <div className={styles.detailRatingGrid}>
            <div className={styles.detailRatingItem}>
              <span>接客 (Staff) {rating <= 3 && <span className={styles.requiredLabel}>*必須</span>}</span>
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
              <span>清潔感 (Cleanliness) {rating <= 3 && <span className={styles.requiredLabel}>*必須</span>}</span>
              <div className={styles.detailStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={styles.detailStarButton}
                    onClick={() => setCleanlinessRating(s)}
                  >
                    <Star
                      size={24}
                      className={`${styles.detailStarIcon} ${cleanlinessRating >= s ? styles.starIconActive : ''}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.detailRatingItem}>
              <span>味・品質 (Taste/Quality) {rating <= 3 && <span className={styles.requiredLabel}>*必須</span>}</span>
              <div className={styles.detailStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={styles.detailStarButton}
                    onClick={() => setTasteRating(s)}
                  >
                    <Star
                      size={24}
                      className={`${styles.detailStarIcon} ${tasteRating >= s ? styles.starIconActive : ''}`}
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
            onClick={() => submitFeedback(rating, comment, {
              staff_rating: staffRating,
              cleanliness_rating: cleanlinessRating,
              taste_rating: tasteRating,
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
