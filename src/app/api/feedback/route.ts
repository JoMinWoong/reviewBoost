import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validScore = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '入力内容を確認してください。' }, { status: 400 });
  }

  const { tenantId, rating, comment, staffRating, atmosphereRating, qualityRating } = body;
  if (typeof tenantId !== 'string' || !uuidPattern.test(tenantId) || !validScore(rating)) {
    return NextResponse.json({ error: '評価を選択してください。' }, { status: 400 });
  }
  if (comment !== undefined && comment !== null && (typeof comment !== 'string' || comment.length > 2000)) {
    return NextResponse.json({ error: 'コメントは2,000文字以内で入力してください。' }, { status: 400 });
  }
  const details = [staffRating, atmosphereRating, qualityRating];
  if (details.some((score) => score !== null && score !== undefined && !validScore(score))) {
    return NextResponse.json({ error: '詳細評価を確認してください。' }, { status: 400 });
  }
  if (rating <= 3 && details.some((score) => !validScore(score))) {
    return NextResponse.json({ error: '詳細評価をすべて選択してください。' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('submit_feedback', {
    p_tenant_id: tenantId,
    p_rating: rating,
    p_comment: typeof comment === 'string' ? comment.trim() || null : null,
    p_staff_rating: validScore(staffRating) ? staffRating : null,
    p_atmosphere_rating: validScore(atmosphereRating) ? atmosphereRating : null,
    p_quality_rating: validScore(qualityRating) ? qualityRating : null,
  });

  if (error) {
    console.error('Feedback submission failed:', error.code);
    return NextResponse.json({ error: '送信できませんでした。時間をおいて再度お試しください。' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
