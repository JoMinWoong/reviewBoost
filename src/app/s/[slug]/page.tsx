import { supabase } from "@/lib/supabase";
import FeedbackForm from "./FeedbackForm";
import styles from "./feedback.module.css";
import { notFound } from "next/navigation";

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
    </div>
  );
}
