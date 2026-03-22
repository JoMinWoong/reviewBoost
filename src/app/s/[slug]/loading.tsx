import styles from './feedback.module.css';

export default function FeedbackLoading() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonText}></div>
      </header>

      <div className={styles.starRating}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.skeletonStar}></div>
        ))}
      </div>

      <div className={styles.formSkeleton}>
        <div className={styles.shimmer}></div>
      </div>
    </div>
  );
}
