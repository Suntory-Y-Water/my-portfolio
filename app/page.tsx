import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import Career from '@/components/Career';
import { CAREER_CONSTANTS } from '@/components/constants';

export default function Home() {
  return (
    <div>
      <h1>私について</h1>
      <div className='mt-4 space-y-1'>
        <h2>スイ</h2>
        <p>東京都で活動するエンジニア。名前の由来は、目の前にあったサントリーの天然水から。</p>
        <p>健康第一をモットーにしており、一年以上ほぼ毎日朝活しています🌅</p>
      </div>
      <div className='mt-4 space-y-1'>
        <h2>好きなもの</h2>
        <p>コーヒー☕️、にゃんころ🐈️、旅行🚅、アニメ📺️、水瀬いのりさん🙏が好きです😎</p>
      </div>
      <div className='mt-4 space-y-1'>
        <h2>経歴</h2>
        {CAREER_CONSTANTS.map((career) => (
          <Career key={career.id} date={career.date} description={career.description} />
        ))}
      </div>
      <div className='mt-2 space-y-1'>
        <h2>その他</h2>
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
        <h2>連絡先</h2>
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
