import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <p>ReviewBoost Japan</p>
          <h1>お客様の声を、次の改善につなげる。</h1>
          <p>店舗向けのフィードバック収集と分析サービスです。</p>
        </div>
        <div className={styles.ctas}>
          <Link className={styles.primary} href="/login">店舗オーナーログイン</Link>
          <Link className={styles.secondary} href="/privacy">個人情報の取り扱い</Link>
        </div>
      </main>
    </div>
  );
}
