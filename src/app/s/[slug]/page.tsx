import { createSupabaseServerClient } from "@/lib/supabase-server";
import FeedbackForm from "./FeedbackForm";
import styles from "./feedback.module.css";
import { notFound } from "next/navigation";

export default async function FeedbackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: tenant, error } = await supabase
    .from('public_tenants')
    .select('id, slug, name, google_maps_url, tabelog_url')
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
        <p><a href="/privacy">個人情報の取り扱い</a></p>
        <p>© {new Date().getFullYear()} ReviewBoost Japan</p>
      </footer>
    </div>
  );
}
