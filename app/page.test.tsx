import { render, screen } from '@testing-library/react';
import Home from './page';
import React from 'react';

describe('Test profile page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sui')).toBeInTheDocument();
    // 複数の要素にまたがるテキストの検索
    const regex =
      /東京都で活動するエンジニア。名前の由来は、目の前にあったサントリーの天然水から。健康第一をモットーにしており、一年以上ほぼ毎日朝活しています🌅/i;
    expect(screen.getByText(regex)).toBeInTheDocument();

    // 経歴欄のテスト
    expect(screen.getByText('2021年3月')).toBeInTheDocument();
    expect(screen.getByText('2022年3月 ~ 2022年10月')).toBeInTheDocument();
    expect(screen.getByText('2022年11月 ~ 2023年3月')).toBeInTheDocument();
    expect(screen.getByText('2023年3月 ~ 2023年12月')).toBeInTheDocument();

    // 経歴詳細
    expect(
      screen.getByText(
        '私立4年制大学を卒業。卒業研究ではPythonを活用し、コロナ禍における買い占め現象のデータ分析を行いました。',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '卒業後、個人事業主として活動を開始。この期間にPythonを独学して、WebスクレイピングやPyAutoGUIを使った業務効率化ツールを開発。',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '個人事業主としての活動を終え、異業種の経験を積むため薬品の製造工場に就職。同年7月に椎間板ヘルニアを発症し、動けなくなってしまったため10月に退職。',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '椎間板ヘルニアの回復後、友人の紹介で都内のSES企業に就職し、某事業会社の会計システムプロジェクトに結合テストから参加。業界未経験でしたが、ExcelとPythonを活用した業務効率化に取り組みました。',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '案件変更を経て、某事業会社の店内システムのクラウド移行プロジェクトに参画。要件定義と設計フェーズを経て現在に至る。',
      ),
    ).toBeInTheDocument();

    // 興味のある分野
    expect(screen.getByText('興味のある分野')).toBeInTheDocument();
    const regexField =
      /大学時代に触ったPythonやTypeScript, React, Next.jsに興味があります。デザインやUI\/UXにも興味がありますが、まだまだ勉強中です。/i;
    expect(screen.getByText(regexField)).toBeInTheDocument();

    // 好きなもの
    expect(screen.getByText('興味のある分野')).toBeInTheDocument();
    const regexLike =
      /苦くて豆から挽いたコーヒーと水瀬いのりさんが好きです。このサイトの一部は以前作成したアプリの機能を搭載しています。/i;
    expect(screen.getByText(regexLike)).toBeInTheDocument();
  });

  it('renders Career components', () => {
    render(<Home />);
    const careerElements = screen.getAllByTestId('career');
    expect(careerElements.length).toBeGreaterThan(0);
  });
});
