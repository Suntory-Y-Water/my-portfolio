import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import Career from '@/components/feature/about/Career';

export default function Home() {
  const careerData = [
    {
      id: '2021-03',
      date: '2021年3月',
      description:
        '私立4年制大学を卒業。卒業研究ではPythonを活用し、コロナ禍における買い占め現象のデータ分析を行う。在学中に個人事業主として開業し、フリマアプリを活用した販売を行う。',
    },
    {
      id: '2021-04',
      date: '2021年3月 ~ 2022年2月',
      description:
        '大学卒業後、個人事業主としての活動を本格的に開始。この期間にPythonを独学で勉強し、WebスクレイピングやPyAutoGUIを使った業務効率化ツールを開発。',
    },
    {
      id: '2022-03',
      date: '2022年2月 ~ 2022年10月',
      description:
        '今後絶対に選ばないであろう異業種の経験を積むため、薬品の製造工場に就職。しかし同年7月に椎間板ヘルニアを発症し動けなくなってしまったため10月に退職。',
    },
    {
      id: '2022-11',
      date: '2022年11月 ~ 2023年3月',
      description:
        '椎間板ヘルニアの回復後、友人の紹介で都内のSES企業に就職し、小売業界の会計システムプロジェクトに結合テストから参加。業界未経験ながらExcelとPythonを活用した業務効率化に取り組む。',
    },
    {
      id: '2023-03',
      date: '2023年3月 ~ 2025年3月',
      description:
        '案件変更を経て、小売業界のクラウド移行プロジェクトに参画。大規模開発ながら要件定義からリリースまでを一貫して経験。',
    },
    {
      id: '2025-04',
      date: '2025年4月(予定) ~ ',
      description: '2年間勤めたSES企業を退職し、SaaSの自社開発企業へ転職予定。',
    },
  ];
  return (
    <div>
      <h1 className='text-4xl font-semibold tracking-wide md:text-[40px] pb-6'>
        私について
      </h1>
      <div className='mt-4 space-y-1'>
        <h2 className='text-2xl font-semibold'>スイ</h2>
        <p>
          東京都で活動するエンジニア。名前の由来は、目の前にあったサントリーの天然水から命名しています。
        </p>
        <p>健康第一をモットーにしており、一年以上ほぼ毎日朝活🌅しています。</p>
      </div>
      <div className='mt-4 space-y-1'>
        <h2 className='text-2xl font-semibold'>好きなもの</h2>
        <p>コーヒー☕️、にゃんころ🐈️、旅行🚅、アニメ📺️、水瀬いのりさん🙏が好きです。</p>
      </div>
      <div className='mt-4 space-y-1'>
        <h2 className='text-2xl font-semibold'>経歴</h2>
        {careerData.map((career) => (
          <Career key={career.id} date={career.date} description={career.description} />
        ))}
      </div>
      <div className='mt-2 space-y-1'>
        <h2 className='text-2xl font-semibold'>その他</h2>
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
        <h2 className='text-2xl font-semibold'>連絡先</h2>
        <a
          href='https://twitter.com/Suntory_N_Water'
          className='underline-offset-4 hover:underline inline-flex items-center space-x-2 text-primary'
          aria-label='問い合わせ先'
          target='_blank'
          rel='noopener noreferrer'
        >
          <span>X(Twitter)のDM&nbsp;</span>
        </a>
        までお願いします
      </div>
    </div>
  );
}
