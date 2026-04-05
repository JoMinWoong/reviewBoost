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
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<number | ''>('');
  const [ageRange, setAgeRange] = useState<number | ''>('');
  const [staffRating, setStaffRating] = useState<number>(0);
  const [atmosphereRating, setAtmosphereRating] = useState<number>(0);
  const [qualityRating, setQualityRating] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const category = tenant.business_categories || {};
  const labels = {
    staff: category.staff_label || '接客 (Staff)',
    atmosphere: category.atmosphere_label || '雰囲気 (Atmosphere)',
    quality: category.quality_label || '品質 (Quality)'
  };

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
      const { error } = await supabase.from('feedback').insert({
        tenant_id: tenant.id,
        rating: r,
        comment: c,
        staff_rating: extra.staff_rating,
        atmosphere_rating: extra.atmosphere_rating,
        quality_rating: extra.quality_rating,
        nickname: nickname,
        gender: gender,
        age_range: ageRange,
        metadata: {
          ...extra,
          category: tenant.category
        },
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

        <div className={styles.ctaArea}>
          <h3>最新情報はこちらから</h3>
          <p>新メニューや限定クーポンをInstagramで配信中！</p>
          <a href="#" className={styles.ctaButton}>
            Instagramをチェックする
          </a>
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

        <div className={styles.ctaArea}>
          <h3>最新情報はこちらから</h3>
          <p>新メニューや限定クーポンをInstagramで配信中！</p>
          <a href="#" className={styles.ctaButton}>
            Instagramをチェックする
          </a>
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
            onChange={(e) => setComment(e.target.value)}
          />
          <input
            className={styles.inputField}
            placeholder="ニックネーム（最大10文字）"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 10))}
            maxLength={10}
          />
          <div className={styles.optionalGrid}>
            <select 
              className={styles.selectField} 
              value={gender} 
              onChange={(e) => setGender(e.target.value === '' ? '' : parseInt(e.target.value))}
            >
              <option value="">性別（任意）</option>
              <option value="0">男性</option>
              <option value="1">女性</option>
              <option value="2">その他</option>
            </select>
            <select 
              className={styles.selectField} 
              value={ageRange} 
              onChange={(e) => setAgeRange(e.target.value === '' ? '' : parseInt(e.target.value))}
            >
              <option value="">年代（任意）</option>
              <option value="1">10代</option>
              <option value="2">20代</option>
              <option value="3">30代</option>
              <option value="4">40代</option>
              <option value="5">50代</option>
              <option value="6">60代以上</option>
            </select>
          </div>
          <button
            className={styles.submitButton}
            onClick={() => submitFeedback(rating, comment, {
              staff_rating: staffRating,
              atmosphere_rating: atmosphereRating,
              quality_rating: qualityRating,
              gender,
              ageRange
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
