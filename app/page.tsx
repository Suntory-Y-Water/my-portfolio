import Career from '@/components/Career';
import React from 'react';

export default function Home() {
  return (
    <div className='px-4'>
      <h1 className='pb-4 font-bold text-3xl md:text-4xl lg:text-5xl'>Profile</h1>
      <div className='mt-4 space-y-1'>
        <h2 className='font-bold text-2xl'>Sui</h2>
        <p>
          東京都で活動するエンジニア。名前の由来は、目の前にあったサントリーの天然水から。
          <br />
          健康第一をモットーにしており、一年以上ほぼ毎日朝活しています🌅
        </p>
      </div>
      <div className='mt-4 space-y-1'>
        <h2 className='font-bold text-2xl'>経歴</h2>
        <Career
          date='2021年3月'
          description='私立四年制大学を卒業。卒業研究ではPythonを活用し、コロナ禍における買い占め現象のデータ分析を行った。'
        />
        <Career
          date='2021年4月 ~ 2022年2月'
          description='卒業後、個人事業主として活動を開始。この期間にPythonを駆使したWebスクレイピング技術や業務効率化ツールを開発し、売上の増加に成功した。'
        />
        <Career
          date='2022年3月 ~ 2022年10月'
          description='個人事業主としての活動を終え、異業種の経験を積むため薬品の製造工場に就職。しかし、7月に椎間板ヘルニアを発症し、10月に退職を余儀なくされた。'
        />
        <Career
          date='2022年11月 ~ 2023年3月'
          description='椎間板ヘルニアの回復後、友人の紹介で都内のSES企業に就職し、某事業会社の会計システムプロジェクトに結合テストから参加。実務未経験ながらも、積極的に業務を模索し、ExcelとPythonを活用した業務効率化に取り組んだ。'
        />
        <Career
          date='2023年3月 ~ 2023年12月'
          description='案件変更を経て、某事業会社の店内システムのクラウド移行プロジェクトに参画。要件定義とシステム設計フェーズでは、ExcelやPowerPoint、Confluenceを活用して詳細なドキュメントを作成。また、Jiraを用いてタスクの進捗管理と情報共有を効率的に行い、プロジェクトの進行状況を明確に把握していた。チームメンバーとして、オンプレミスからクラウドへの移行に伴う新しいアーキテクチャの理解と適応に積極的に取り組み、技術的な洞察力とコミュニケーション能力を同時に高めることができた。'
        />
      </div>
      <div className='mt-4 space-y-1'>
        <h2 className='font-bold text-2xl'>興味のある分野</h2>
        <p>
          大学時代に触ったPythonやTypeScript, React, Next.jsに興味があります。
          <br />
          デザインやUI/UXにも興味がありますが、まだまだ勉強中です。
        </p>
      </div>
      <div className='mt-4 space-y-1'>
        <h2 className='font-bold text-2xl'>好きなもの</h2>
        <p>
          苦くて豆から挽いたコーヒーと水瀬いのりさんが好きです。
          <br />
          このサイトの一部は以前作成したアプリの機能を搭載しています。
        </p>
      </div>
    </div>
  );
}
