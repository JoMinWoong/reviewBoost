import LoginForm from './LoginForm';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main style={{ maxWidth: 440, margin: '5rem auto', padding: '2rem' }}>
      <h1>店舗オーナー ログイン</h1>
      <p>登録済みのメールアドレスにログインリンクを送ります。</p>
      {error && <p role="alert">ログインリンクを確認できませんでした。もう一度お試しください。</p>}
      <LoginForm />
    </main>
  );
}
