import Link from 'next/link';
import QiitaIcon from '@/components/QiitaIcon';
import ConvertDate from './ConvertDate';

type ZennResponse = {
  articles: ZennPost[];
};

type ZennPost = {
  id: number;
  path: string;
  emoji: string;
  title: string;
  published_at: string;
  source: 'Zenn';
};

type QiitaPost = {
  created_at: string;
  id: string;
  title: string;
  url: string;
  source: 'Qiita';
};

type Post = ZennPost | QiitaPost;

const PostsList = async () => {
  const { QIITA_ACCESS_TOKEN } = process.env;
  const zennResponse = await fetch('https://zenn.dev/api/articles?username=sui_water&order=latest');
  const zennData: ZennResponse = await zennResponse.json();
  const zennPosts: ZennPost[] = zennData.articles.map((post) => ({ ...post, source: 'Zenn' }));

  const usernames = ['Guz9N9KLASTt', 'Suntory_N_Water'];
  const qiitaPosts: QiitaPost[] = [];

  for (const username of usernames) {
    const response = await fetch(`https://qiita.com/api/v2/users/${username}/items?per_page=100`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${QIITA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const data: QiitaPost[] = await response.json();
    qiitaPosts.push(...data.map((post) => ({ ...post, source: 'Qiita' as const })));
  }

  // 全てのポストを日付でソート
  const posts: Post[] = [...zennPosts, ...qiitaPosts].sort((a, b) => {
    const dateA = a.source === 'Zenn' ? new Date(a.published_at) : new Date(a.created_at);
    const dateB = b.source === 'Zenn' ? new Date(b.published_at) : new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <ul className='grid place-items-center gap-7 items-stretch grid-cols-[repeat(auto-fit,minmax(240px,1fr))]'>
      {posts.map((post) => (
        <li key={post.id} className='w-full'>
          {post.source === 'Zenn' ? (
            <Link
              href={`https://zenn.dev/${post.path}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex aspect-[4/3] w-full h-full flex-col items-center justify-center gap-4 p-6 border rounded-3xl hover:outline-primary hover:outline-2 hover:outline hover:bg-muted/90'
            >
              <span className='text-6xl'>{post.emoji}</span>
              <p className='line-clamp-2 overflow-hidden break-all text-left font-medium'>
                {post.title}
              </p>
              <p className='text-muted-foreground text-xs tracking-widest'>
                <ConvertDate convertDate={post.published_at} />
              </p>
            </Link>
          ) : (
            <Link
              href={post.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex aspect-[4/3] w-full h-full flex-col items-center justify-center gap-4 p-6 border rounded-3xl hover:outline-primary hover:outline-2 hover:outline hover:bg-muted/90'
            >
              <QiitaIcon />
              <p className='line-clamp-2 overflow-hidden break-all text-left font-medium'>
                {post.title}
              </p>
              <p className='text-muted-foreground text-xs tracking-widest'>
                <ConvertDate convertDate={post.created_at} />
              </p>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
};

export default PostsList;
