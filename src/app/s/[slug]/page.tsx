import { supabase } from "@/lib/supabase";
import FeedbackForm from "./FeedbackForm";
import styles from "./feedback.module.css";
import { notFound } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";

export default async function FeedbackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !tenant) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.storeName}>{tenant.name}</h1>
        <p>ご来店ありがとうございます。<br />サービス向上のため、アンケートにご協力ください。</p>
      </header>

      <FeedbackForm tenant={tenant} />

      <footer className={styles.footer}>
        <div className={styles.badgeArea}>
          <div className={styles.badge}>
            <ShieldCheck size={16} />
            <span>SSL暗号化通信</span>
          </div>
          <div className={styles.badge}>
            <Lock size={16} />
            <span>個人情報の厳重管理</span>
          </div>
        </div>
        <p>© {new Date().getFullYear()} ReviewBoost Japan - 安心の日本語対応サポート</p>
      </footer>
    </div>
  );
}
