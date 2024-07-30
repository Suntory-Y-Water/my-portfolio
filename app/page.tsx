import Career from '@/components/Career';
import Link from 'next/link';
import React from 'react';
import { FaXTwitter } from 'react-icons/fa6';
import { FaGithub } from 'react-icons/fa';

export default function Home() {
  return (
    <div>
      <h1>Profile📔</h1>
      <div className='mt-4 space-y-1'>
        <h2>Sui🌊</h2>
        <p>東京都で活動するエンジニア。名前の由来は、目の前にあったサントリーの天然水から。</p>
        <p>健康第一をモットーにしており、一年以上ほぼ毎日朝活しています🌅</p>
      </div>
      <div className='mt-2 space-y-1'>
        <h2>Like💫</h2>
        <p>コーヒー☕️、にゃんころ🐈️、旅行🚅、アニメ📺️、水瀬いのりさん🙏が好きです😎</p>
      </div>
      <div className='mt-4 space-y-1'>
        <h2>Career👨‍💼</h2>
        <Career
          date='2021年3月'
          description='私立4年制大学を卒業。卒業研究ではPythonを活用し、コロナ禍における買い占め現象のデータ分析を行う。'
        />
        <Career
          date='2021年4月 ~ 2022年2月'
          description='卒業後、個人事業主として活動を開始。この期間にPythonを独学で勉強し、WebスクレイピングやPyAutoGUIを使った業務効率化ツールを開発。'
        />
        <Career
          date='2022年3月 ~ 2022年10月'
          description='異業種の経験を積むため薬品の製造工場に就職。同年7月に椎間板ヘルニアを発症し、動けなくなってしまったため10月に退職。'
        />
        <Career
          date='2022年11月 ~ 2023年3月'
          description='椎間板ヘルニアの回復後、友人の紹介で都内のSES企業に就職し、某事業会社の会計システムプロジェクトに結合テストから参加。業界未経験だがExcelとPythonを活用した業務効率化に取り組む。'
        />
        <Career
          date='2023年3月 ~ '
          description='案件変更を経て、小売業界の店内システムのクラウド移行プロジェクトに参画。要件定義～外部結合テストを経て現在に至る。'
        />
      </div>
      <div className='mt-2 space-y-1'>
        <h2>Others</h2>
        <div>
          <Link
            href='https://twitter.com/Suntory_N_Water'
            className='underline-offset-4 hover:underline pb-2 inline-flex items-center space-x-2'
            aria-label='X(Twitter)アカウント'
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaXTwitter size='1.2em' /> <span className='text-sm'>Suntory_N_Water</span>
          </Link>
        </div>
        <div>
          <Link
            href='https://github.com/Suntory-Y-Water'
            className='underline-offset-4 hover:underline py-2 inline-flex items-center space-x-2'
            aria-label='GitHubアカウント'
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaGithub size='1.2em' /> <span className='text-sm'>Suntory-Y-Water</span>
          </Link>
        </div>
      </div>
      <div className='mt-2 space-y-1'>
        <h2>Contact</h2>
        <Link
          href='https://twitter.com/Suntory_N_Water'
          className='underline-offset-4 hover:underline inline-flex items-center space-x-2 text-primary'
          aria-label='問い合わせ先'
          target='_blank'
          rel='noopener noreferrer'
        >
          <span>X(Twitter)のDM&nbsp;</span>
        </Link>
        までお願いします
      </div>
    </div>
  );
}
