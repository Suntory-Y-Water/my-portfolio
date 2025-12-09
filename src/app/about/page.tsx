import {
  ArrowUpRight,
  Cat,
  Coffee,
  Github,
  Heart,
  MapPin,
  TrainFront,
  Tv,
  Twitter,
} from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/utils';

const aboutDescription =
  'プロフィール、経歴、SNSや連絡先のリンクをまとめたページです。';

export const metadata: Metadata = {
  title: 'About',
  description: aboutDescription,
  openGraph: {
    title: 'About',
    description: aboutDescription,
    url: absoluteUrl('/about'),
    images: [siteConfig.ogImage],
  },
  twitter: {
    title: 'About',
    description: aboutDescription,
    images: [siteConfig.ogImage],
  },
  alternates: {
    canonical: absoluteUrl('/about'),
  },
};

// --- 型定義 ---

type CareerData = {
  id: string;
  date: string;
  description: string;
};

type CareerProps = {
  date: string;
  description: string;
  isLast: boolean;
};

type LikeCardProps = {
  icon: React.ReactNode;
  label: string;
};

type SocialLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  username: string;
};

// --- データ ---

const careerData: CareerData[] = [
  {
    id: '2021-03',
    date: '2021.03',
    description:
      '私立4年制大学を卒業。卒業研究ではPythonを活用し、コロナ禍における買い占め現象のデータ分析を行う。在学中に個人事業主として開業し、フリマアプリを活用した販売を行う。',
  },
  {
    id: '2021-04',
    date: '2021.03 - 2022.02',
    description:
      '大学卒業後、個人事業主としての活動を本格的に開始。この期間にPythonを独学で勉強し、WebスクレイピングやPyAutoGUIを使った業務効率化ツールを開発。',
  },
  {
    id: '2022-03',
    date: '2022.02 - 2022.10',
    description:
      '今後絶対に選ばないであろう異業種の経験を積むため、薬品の製造工場に就職。しかし同年7月に椎間板ヘルニアを発症し動けなくなってしまったため10月に退職。',
  },
  {
    id: '2022-11',
    date: '2022.11 - 2023.03',
    description:
      '椎間板ヘルニアの回復後、友人の紹介で都内のSES企業に就職し、小売業界の会計システムプロジェクトに結合テストから参加。業界未経験ながらExcelとPythonを活用した業務効率化に取り組む。',
  },
  {
    id: '2023-03',
    date: '2023.03 - 2025.03',
    description:
      '案件変更を経て、小売業界のクラウド移行プロジェクトに参画。大規模開発ながら要件定義からリリースまでを一貫して経験。',
  },
  {
    id: '2025-04',
    date: '2025.04 - Present',
    description: '2年間勤めたSES企業を退職し、SaaSの自社開発企業へ転職予定。',
  },
];

// --- メインコンポーネント ---

export default function AboutPage() {
  return (
    // Pagefindによる全文検索から除外
    <div
      data-pagefind-ignore
      className='mx-auto max-w-4xl px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700'
    >
      {/* プロフィールヘッダー */}
      <section className='mb-24 grid grid-cols-1 gap-12 md:grid-cols-[1fr_auto] md:items-center'>
        <div className='order-2 space-y-6 md:order-1'>
          <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>
            <span className='bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent'>
              Hello, I'm Sui.
            </span>
          </h1>

          <div className='space-y-4 text-lg leading-relaxed text-muted-foreground'>
            <p className='flex items-center gap-2'>
              <MapPin className='h-5 w-5 text-primary' />
              東京都で活動するエンジニア
            </p>
            <p>
              名前の由来は、目の前にあった
              <span className='mx-1 border-b-2 border-primary/30 font-bold text-foreground'>
                サントリーの天然水
              </span>
              から命名しています。
            </p>
            <p>
              <span className='font-semibold text-foreground'>
                「健康第一」
              </span>
              をモットーにしており、三年以上ほぼ毎日朝活🌅を継続中です。
            </p>
          </div>
        </div>

        {/* アバター画像(光彩エフェクト付き) */}
        <div className='order-1 flex justify-center md:order-2'>
          <div className='relative'>
            <div className='absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-[50px]' />
            <div className='relative h-40 w-40 overflow-hidden rounded-full border-4 border-background bg-muted shadow-xl md:h-48 md:w-48'>
              <Image
                src='https://avatars.githubusercontent.com/u/116779921?v=4'
                alt='sui avatar'
                width={192}
                height={192}
                className='h-full w-full object-cover transition-transform duration-500 hover:scale-110'
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 好きなものセクション */}
      <section className='mb-24'>
        <h2 className='mb-8 flex items-center gap-3 text-2xl font-bold'>
          <Heart className='h-6 w-6 text-primary' />
          Likes
        </h2>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5'>
          <LikeCard icon={<Coffee />} label='Coffee' />
          <LikeCard icon={<Cat />} label='Cats' />
          <LikeCard icon={<TrainFront />} label='Travel' />
          <LikeCard icon={<Tv />} label='Anime' />
          <LikeCard
            icon={<Heart className='text-pink-500' />}
            label='Inori Minase'
          />
        </div>
      </section>

      {/* 経歴セクション */}
      <section className='mb-24'>
        <h2 className='mb-10 flex items-center gap-3 text-2xl font-bold'>
          <span className='relative flex h-3 w-3'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75' />
            <span className='relative inline-flex h-3 w-3 rounded-full bg-primary' />
          </span>
          Career History
        </h2>

        <div className='space-y-0'>
          {careerData.map((career, index) => (
            <Career
              key={career.id}
              date={career.date}
              description={career.description}
              isLast={index === careerData.length - 1}
            />
          ))}
        </div>
      </section>

      {/* SNS & 連絡先セクション */}
      <section className='grid gap-8 md:grid-cols-2'>
        <div className='space-y-4'>
          <h2 className='text-xl font-bold'>Socials</h2>
          <div className='grid gap-3'>
            <SocialLink
              href={siteConfig.links.twitter}
              icon={<Twitter className='h-5 w-5' />}
              label='X (Twitter)'
              username='Suntory_N_Water'
            />
            <SocialLink
              href={siteConfig.links.github}
              icon={<Github className='h-5 w-5' />}
              label='GitHub'
              username='Suntory-N-Water'
            />
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-xl font-bold'>Contact</h2>
          <Card className='bg-card/50 backdrop-blur-sm'>
            <CardContent className='flex h-full flex-col justify-center p-6'>
              <p className='text-muted-foreground'>
                お問い合わせは
                <Button
                  variant='link'
                  className='h-auto p-0 px-1 text-base font-semibold text-primary underline-offset-4'
                  asChild
                >
                  <a
                    href={siteConfig.links.twitter}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    X(Twitter)のDM
                  </a>
                </Button>
                までお願いします。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

// --- サブコンポーネント ---

/**
 * 経歴のタイムラインアイテム
 */
function Career({ date, description, isLast }: CareerProps) {
  return (
    <div className='relative pb-12 last:pb-0'>
      {/* 縦線: 最後の要素以外に描画。top-2(ドット中心)から次の要素のtop-2まで繋ぐためにbottom-0より少し伸ばすか、paddingで調整 */}
      {!isLast && (
        <div className='absolute left-[7px] top-2 h-full w-[2px] bg-border' />
      )}

      {/* タイムラインのドット */}
      <div className='absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-primary bg-background' />

      <div className='pl-10 md:flex md:gap-6'>
        {/* 日付 */}
        <div className='mb-2 shrink-0 font-mono text-sm font-bold text-primary md:mb-0 md:w-36 md:pt-1.5'>
          {date}
        </div>

        {/* 内容カード */}
        <Card className='w-full transition-all hover:border-primary/40 hover:shadow-md'>
          <CardContent className='p-4 text-sm leading-relaxed text-muted-foreground'>
            {description}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * 好きなものを表示するカード
 */
function LikeCard({ icon, label }: LikeCardProps) {
  return (
    <Card className='group border-border/50 bg-secondary/20 transition-all hover:bg-secondary/40 hover:border-primary/30'>
      <CardContent className='flex flex-col items-center justify-center gap-3 p-4'>
        <div className='text-muted-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary'>
          {icon}
        </div>
        <span className='text-sm font-medium'>{label}</span>
      </CardContent>
    </Card>
  );
}

/**
 * SNSリンクコンポーネント
 */
function SocialLink({ href, icon, label, username }: SocialLinkProps) {
  return (
    <Button
      variant='outline'
      className='flex h-auto w-full items-center justify-between p-4 hover:bg-secondary/50 hover:text-primary'
      asChild
    >
      <Link href={href} target='_blank' rel='noopener noreferrer'>
        <div className='flex items-center gap-3'>
          {icon}
          <span className='font-semibold'>{label}</span>
        </div>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <span className='text-xs font-normal'>{username}</span>
          <ArrowUpRight className='h-4 w-4 opacity-50' />
        </div>
      </Link>
    </Button>
  );
}
