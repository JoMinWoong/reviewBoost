'use client';

import { useState } from 'react';

interface Consultation {
  summary: string;
  actions: Array<{ action: string; evidence: string }>;
  cached?: boolean;
}

interface TenantOption { id: string; name: string }

export default function AIConsultation({ tenants }: { tenants: TenantOption[] }) {
  const [tenantId, setTenantId] = useState(tenants[0]?.id || '');
  const [result, setResult] = useState<Consultation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || '分析に失敗しました。');
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ margin: '1.5rem 0', padding: '1.25rem', border: '1px solid #ddd', borderRadius: 12 }}>
      <h2>AI改善相談</h2>
      {!tenants.length && <p>店舗が登録されていません。</p>}
      <p>選択した店舗の最新コメント付き回答を最大40件分析します。AI APIの利用は1店舗につき24時間に1回までです。</p>
      <label>店舗 <select value={tenantId} onChange={(event) => setTenantId(event.target.value)} disabled={loading}>
        {tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
      </select></label>{' '}
      <button type="button" onClick={runAnalysis} disabled={loading || !tenantId}>
        {loading ? '分析中…' : 'AIで改善案を作成'}
      </button>
      {error && <p role="alert">{error}</p>}
      {result && (
        <div aria-live="polite">
          <p>{result.summary}</p>
          {result.actions.length > 0 && (
            <ol>{result.actions.map((item, index) => <li key={`${index}-${item.action}`}><strong>{item.action}</strong><br />根拠: {item.evidence}</li>)}</ol>
          )}
          <small>AIの提案は参考情報です。回答数が少ない場合や内容が偏っている場合、傾向を正しく示さないことがあります。{result.cached ? '過去24時間の結果を表示しています。' : ''}</small>
        </div>
      )}
    </section>
  );
}
