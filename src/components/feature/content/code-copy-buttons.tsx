import { useEffect } from 'react';

/**
 * コードブロックのコピーボタンにイベントハンドラを設定
 */
export function CodeCopyButtons() {
  useEffect(() => {
    // data-copy-button属性を持つボタンを検出
    const copyButtons = document.querySelectorAll('[data-copy-button]');

    const abortController = new AbortController();
    const copiedStates = new Map<
      Element,
      { timeoutId: NodeJS.Timeout | null }
    >();

    copyButtons.forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          // ボタンの親要素から<pre>を取得
          const wrapper = button.closest('.group.relative');
          const pre = wrapper?.querySelector('pre');
          const code = pre?.textContent;

          if (!code) {
            return;
          }

          // クリップボードにコピー
          navigator.clipboard.writeText(code);

          // アイコンをCheckに変更
          const svg = button.querySelector('svg');
          if (svg) {
            svg.innerHTML = `<path d="M20 6 9 17l-5-5"/>`;
            svg.classList.remove('text-muted-foreground');
            svg.classList.add('text-green-500');
          }

          // Copied!メッセージを表示
          const message = wrapper?.querySelector('.copy-message');
          message?.classList.remove('hidden');

          // 既存のタイムアウトをクリア
          const state = copiedStates.get(button);
          if (state?.timeoutId) {
            clearTimeout(state.timeoutId);
          }

          // 1秒後に元に戻す
          const timeoutId = setTimeout(() => {
            if (svg) {
              svg.innerHTML = `<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`;
              svg.classList.add('text-muted-foreground');
              svg.classList.remove('text-green-500');
            }
            message?.classList.add('hidden');
          }, 1000);

          copiedStates.set(button, { timeoutId });
        },
        { signal: abortController.signal },
      );
    });

    // クリーンアップ
    return () => {
      abortController.abort();
      copiedStates.forEach(({ timeoutId }) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      });
    };
  }, []);

  return null; // UIは静的HTMLで既に存在するため、何も返さない
}
