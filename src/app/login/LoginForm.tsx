'use client';

import { FormEvent, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,
      },
    });
    setLoading(false);
    if (authError) setError('メールを送信できませんでした。設定をご確認ください。');
    else setSent(true);
  }

  if (sent) return <p>ログインリンクを送信しました。メールをご確認ください。</p>;

  return (
    <form onSubmit={submit}>
      <label htmlFor="email">メールアドレス</label>
      <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} style={{ display: 'block', width: '100%', padding: 12, margin: '8px 0 16px' }} />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>{loading ? '送信中…' : 'ログインリンクを送信'}</button>
    </form>
  );
}
