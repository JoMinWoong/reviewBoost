import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { generateFeedbackConsultation } from '@/lib/openai';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'ログインしてください。' }, { status: 401 });

  let tenantId: string;
  try {
    const body = await request.json();
    tenantId = body.tenantId;
  } catch {
    return NextResponse.json({ error: '店舗を選択してください。' }, { status: 400 });
  }
  if (typeof tenantId !== 'string') return NextResponse.json({ error: '店舗を選択してください。' }, { status: 400 });

  const { data: tenant } = await supabase.from('tenants').select('id').eq('id', tenantId).maybeSingle();
  if (!tenant) return NextResponse.json({ error: '店舗が見つかりません。' }, { status: 404 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: cached, error: cacheError } = await supabase
    .from('analytics')
    .select('summary, actions')
    .eq('tenant_id', tenantId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (cacheError) return NextResponse.json({ error: '分析履歴を確認できませんでした。' }, { status: 400 });
  if (cached) return NextResponse.json({ summary: cached.summary, actions: cached.actions || [], cached: true });

  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('rating, comment')
    .eq('tenant_id', tenantId)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(40);

  if (error) return NextResponse.json({ error: 'フィードバックを読み込めませんでした。' }, { status: 400 });
  const usable = (feedback || []).filter((item) => typeof item.comment === 'string' && item.comment.trim());
  if (!usable.length) {
    return NextResponse.json({ summary: 'この店舗にはコメント付きの回答がまだありません。', actions: [] });
  }

  try {
    const analysis = await generateFeedbackConsultation(
      usable.map(({ rating, comment }) => ({ rating, comment: comment!.slice(0, 1000) })),
    );
    const { error: saveError } = await supabase.from('analytics').insert({
      tenant_id: tenantId,
      summary: analysis.summary,
      actions: analysis.actions,
      period_end: new Date().toISOString(),
    });
    if (saveError) console.error('AI analysis cache could not be saved:', saveError.code);
    return NextResponse.json(analysis);
  } catch (error) {
    if (error instanceof Error && error.message === 'AI_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'OPENAI_API_KEY が設定されていません。' }, { status: 503 });
    }
    console.error('AI consultation failed');
    return NextResponse.json({ error: 'AI分析に失敗しました。時間をおいて再度お試しください。' }, { status: 502 });
  }
}
