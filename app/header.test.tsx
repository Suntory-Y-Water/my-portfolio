import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import { navgationLinks } from '@/data';
import lives from '@/data/liveName.json';
import { useTheme } from 'next-themes';
import { ModeToggle } from '@/components/ui/ModeToggle';

describe('Header Component', () => {
  it('renders without crashing', () => {
    render(<Header />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('displays the logo and links to the home page', () => {
    render(<Header />);
    const logoImage = screen.getByAltText('icon');
    expect(logoImage).toBeInTheDocument();

    // ロゴがリンクされているか確認する
    // logoImageが含まれる最も近いaタグを取得する
    const logoLink = logoImage.closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders navigation links correctly', () => {
    render(<Header />);

    navgationLinks.forEach((link) => {
      // ナビゲーションリンクのテキストを検索
      const linkElement = screen.getByText(link.title);
      expect(linkElement).toBeInTheDocument();

      // リンクが正しいhref属性を持っているか確認
      // linkElementが含まれる最も近いaタグを取得する
      const linkAnchor = linkElement.closest('a');
      expect(linkAnchor).toHaveAttribute('href', link.href);
    });
  });
});

describe('link to Live page', () => {
  it('renders and functions navigation links correctly', async () => {
    render(<Header />);

    // ドロップダウンメニューを展開するために「セトリ一覧」ボタンをクリック
    userEvent.click(screen.getByText('セトリ一覧'));

    // ドロップダウンメニューの各リンクをテスト
    for (const live of lives) {
      // 名称が正しいか確認
      const linkText = new RegExp(live.name, 'i');
      const linkElement = await screen.findByText(linkText);
      expect(linkElement).toBeInTheDocument();

      // エンコードされたURLを生成
      let encodedLiveName = encodeURIComponent(live.name);
      // スペースを+に置換
      encodedLiveName = encodedLiveName.replace(/%20/g, '+');
      // \!を%21に置換（必要に応じて）
      encodedLiveName = encodedLiveName.replace(/!/g, '%21');

      const expectedHref = `/contents/set-list/${live.id}?live_name=${encodedLiveName}`;

      // リンクのhref属性が正しいか確認
      const linkAnchor = linkElement.closest('a');
      expect(linkAnchor).toHaveAttribute('href', expectedHref);
    }
  });
});

describe('ModeToggle Component', () => {
  it('toggles theme correctly', async () => {
    const { setTheme } = useTheme();
    render(<ModeToggle />);

    // ドロップダウンメニューをトリガーする要素をクリック
    userEvent.click(screen.getByRole('button', { name: /toggle theme/i }));

    // メニューが表示されるのを待つ
    await waitFor(() => {
      expect(screen.queryByText('Light')).toBeInTheDocument();
      expect(screen.queryByText('Dark')).toBeInTheDocument();
      expect(screen.queryByText('System')).toBeInTheDocument();
    });

    // 各種モードを選択
    userEvent.click(screen.getByText('Light'));
    userEvent.click(screen.getByText('Dark'));
    userEvent.click(screen.getByText('System'));
  });
});
