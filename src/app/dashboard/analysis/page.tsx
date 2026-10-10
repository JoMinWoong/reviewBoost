import { createSupabaseServerClient } from '@/lib/supabase-server';
import AnalysisDashboard from './AnalysisDashboard';
import AIConsultation from './AIConsultation';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AnalysisPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: tenants } = await supabase.from('tenants').select('id, name').order('name');

  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('created_at, rating, staff_rating, atmosphere_rating, quality_rating')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    return <div>分析レポートの読み込み中にエラーが発生しました。</div>;
  }

  return (
    <>
      <AIConsultation tenants={tenants || []} />
      <AnalysisDashboard feedback={feedback || []} />
    </>
  );
}
