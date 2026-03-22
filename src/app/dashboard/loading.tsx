import styles from './dashboard.module.css';

export default function DashboardLoading() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.skeletonTitle}></div>
      </header>

      <div className={styles.statsGrid}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.statCardSkeleton}>
            <div className={styles.shimmer}></div>
          </div>
        ))}
      </div>

      <section className={styles.feedbackSection}>
        <div className={styles.skeletonTitleSmall}></div>
        <div className={styles.tableSkeleton}>
          <div className={styles.shimmer}></div>
        </div>
      </section>
    </div>
  );
}
