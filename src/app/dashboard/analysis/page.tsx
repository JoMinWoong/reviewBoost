import { supabase } from '@/lib/supabase';
import AnalysisDashboard from './AnalysisDashboard';

export const revalidate = 0;

export default async function AnalysisPage() {
  // Fetch feedback for all tenants
  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>分析レポートの読み込み中にエラーが発生しました。</div>;
  }

  return (
    <AnalysisDashboard feedback={feedback || []} />
  );
}
