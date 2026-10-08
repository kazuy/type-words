type Props = { onStart: () => void };

export default function TopPage({ onStart }: Props) {
  return (
    <main className="top-screen">
      <h1>英語タイピング</h1>
      <button type="button" onClick={onStart}>
        ゲームをはじめる
      </button>
    </main>
  );
}
