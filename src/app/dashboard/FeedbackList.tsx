'use client';

import { useState, useMemo } from 'react';
import { Star, Search, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './dashboard.module.css';

interface FeedbackItem {
  id: string;
  created_at: string;
  rating: number;
  comment: string | null;
  nickname: string | null;
  gender: number | null;
  age_range: number | null;
  staff_rating?: number;
  cleanliness_rating?: number;
  taste_rating?: number;
  metadata?: any;
  tenants: {
    name: string;
  };
}

interface FeedbackListProps {
  feedback: FeedbackItem[];
}

type SortField = 'created_at' | 'rating' | 'tenant';

export default function FeedbackList({ feedback }: FeedbackListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedFeedback = useMemo(() => {
    return feedback
      .filter((f) => {
        const searchStr = `${f.tenants?.name || ''} ${f.comment || ''} ${f.nickname || ''}`.toLowerCase();
        return searchStr.includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'created_at') {
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (sortField === 'rating') {
          comparison = a.rating - b.rating;
        } else if (sortField === 'tenant') {
          comparison = (a.tenants?.name || '').localeCompare(b.tenants?.name || '');
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [feedback, searchTerm, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className={styles.sortIcon} />;
    return sortOrder === 'asc' ? <ChevronUp size={14} className={styles.sortIconActive} /> : <ChevronDown size={14} className={styles.sortIconActive} />;
  };

  return (
    <div className={styles.feedbackContainer}>
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="店舗名、コメント、ニックネームで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Desktop view: Table */}
      <div className={styles.desktopTable}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => toggleSort('created_at')} className={styles.sortableHeader}>
                <div className={styles.headerContent}>
                  日付 <SortIcon field="created_at" />
                </div>
              </th>
              <th onClick={() => toggleSort('tenant')} className={styles.sortableHeader}>
                <div className={styles.headerContent}>
                  店舗 <SortIcon field="tenant" />
                </div>
              </th>
              <th onClick={() => toggleSort('rating')} className={styles.sortableHeader}>
                <div className={styles.headerContent}>
                  評価 <SortIcon field="rating" />
                </div>
              </th>
              <th>コメント</th>
              <th>顧客情報</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedFeedback.map((f) => (
              <tr key={f.id} className={f.rating <= 3 ? styles.alertRow : ''}>
                <td>{new Date(f.created_at).toLocaleDateString('ja-JP')}</td>
                <td>{f.tenants?.name}</td>
                <td>
                  <div className={styles.ratingStars}>
                    <div style={{ display: 'flex' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={s <= f.rating ? styles.starFilled : styles.starEmpty}
                          size={16}
                        />
                      ))}
                    </div>
                    {f.rating >= 4 ? (
                      <span className={`${styles.sentimentPill} ${styles.positiveTag}`}>Positive</span>
                    ) : (
                      <span className={`${styles.sentimentPill} ${styles.attentionTag}`}>Needs Attention</span>
                    )}
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
                <td>
                  {f.nickname || '匿名'}
                  {(f.gender !== null || f.age_range !== null) && (
                    <div className={styles.detailSummary}>
                      {f.gender !== null && (
                        <span>
                          {f.gender === 0 ? '男性' : 
                           f.gender === 1 ? '女性' : 
                           f.gender === 2 ? 'その他' : ''}
                        </span>
                      )}
                      {f.age_range !== null && (
                        <span>
                          {f.age_range === 1 ? '10代' :
                           f.age_range === 2 ? '20代' :
                           f.age_range === 3 ? '30代' :
                           f.age_range === 4 ? '40代' :
                           f.age_range === 5 ? '50代' :
                           f.age_range === 6 ? '60代以上' : f.age_range}
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view: Cards */}
      <div className={styles.mobileCards}>
        {filteredAndSortedFeedback.map((f) => (
          <div key={f.id} className={`${styles.feedbackCard} ${f.rating <= 3 ? styles.alertCard : ''}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardDate}>{new Date(f.created_at).toLocaleDateString('ja-JP')}</span>
              <span className={styles.cardTenant}>{f.tenants?.name}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardRating}>
                <div className={styles.ratingStars}>
                  <div style={{ display: 'flex' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={s <= f.rating ? styles.starFilled : styles.starEmpty}
                        size={16}
                      />
                    ))}
                  </div>
                  {f.rating >= 4 ? (
                    <span className={`${styles.sentimentPill} ${styles.positiveTag}`}>Positive</span>
                  ) : (
                    <span className={`${styles.sentimentPill} ${styles.attentionTag}`}>Needs Attention</span>
                  )}
                </div>
              </div>
              <p className={styles.cardComment}>{f.comment || 'コメントなし'}</p>
              {(f.staff_rating || f.cleanliness_rating || f.taste_rating) && (
                <div className={styles.detailSummary}>
                  {f.staff_rating && <span>接客:{f.staff_rating} </span>}
                  {f.cleanliness_rating && <span>清潔:{f.cleanliness_rating} </span>}
                  {f.taste_rating && <span>味:{f.taste_rating} </span>}
                </div>
              )}
            </div>
            <div className={styles.cardFooter}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
                <span className={styles.cardCustomer}>{f.nickname || '匿名'}</span>
                {(f.gender !== null || f.age_range !== null) && (
                  <div className={styles.detailSummary}>
                    {f.gender !== null && (
                      <span>
                        {f.gender === 0 ? '男性' : 
                         f.gender === 1 ? '女性' : 
                         f.gender === 2 ? 'その他' : ''}
                      </span>
                    )}
                    {f.age_range !== null && (
                      <span>
                        {f.age_range === 1 ? '10代' :
                         f.age_range === 2 ? '20代' :
                         f.age_range === 3 ? '30代' :
                         f.age_range === 4 ? '40代' :
                         f.age_range === 5 ? '50代' :
                         f.age_range === 6 ? '60代以上' : f.age_range}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
