export default function PrivacyPage() {
  const contact = process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL;
  return (
    <main style={{ maxWidth: 760, margin: '3rem auto', padding: '1.5rem', lineHeight: 1.8 }}>
      <h1>個人情報の取り扱い</h1>
      <p>このアンケートでは、店舗へのフィードバックとして評価、任意コメント、および送信日時を取得します。ニックネーム、性別、年齢は取得しません。</p>
      <h2>利用目的</h2>
      <p>回答はReviewBoostのサービス提供、店舗運営者へのフィードバック提供、サービスの不正利用防止に利用します。回答内容は対象店舗の運営者に共有され、公開レビューとして投稿されることはありません。</p>
      <p>店舗オーナーがダッシュボードでAI改善相談を実行した場合、最新のコメント付き回答（最大40件、各コメント最大1,000文字）と評価がAI処理事業者のOpenAIに送信され、傾向と改善案の作成に利用されます。生成した要約と改善案は分析画面の結果再利用のため保存されます。AI分析は自動実行されません。</p>
      <h2>保存と削除</h2>
      <p>回答はサービス運営に必要な期間保存します。削除のご相談は下記連絡先へお寄せください。</p>
      <h2>お問い合わせ</h2>
      {contact ? <p><a href={`mailto:${contact}`}>{contact}</a></p> : <p>運営者は公開前に NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL を設定してください。</p>}
    </main>
  );
}
