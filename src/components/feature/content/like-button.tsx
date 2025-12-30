import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GetLikeResponse, IncrementLikeRequest } from '@/types/like';

type LikeButtonProps = {
  slug: string;
};

/**
 * いいねボタンコンポーネント
 *
 * @param slug - 記事のスラッグ
 */
export function LikeButton({ slug }: LikeButtonProps) {
  const [allCount, setAllCount] = useState(0);
  const [localCount, setLocalCount] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初回読み込み: いいね数取得
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await fetch(`/api/like/${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch likes');
        }
        const data: GetLikeResponse = await response.json();
        setAllCount(data.likes);
      } catch (err) {
        console.error('Error fetching likes:', err);
        setError('いいね数の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikes();
  }, [slug]);

  // Debounce: 1秒後にAPIリクエスト送信
  useEffect(() => {
    if (localCount === 0) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const requestBody: IncrementLikeRequest = { increment: localCount };
        const response = await fetch(`/api/like/${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error('Failed to increment likes');
        }

        // リクエスト成功後、localCountをリセット
        setLocalCount(0);
      } catch (err) {
        console.error('Error incrementing likes:', err);
        setError('いいねの送信に失敗しました');
        // エラー時は楽観的更新を元に戻す
        setAllCount((prev) => prev - localCount);
        setLocalCount(0);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [localCount, slug]);

  const handleClick = () => {
    // 楽観的UI更新
    setAllCount((prev) => prev + 1);
    setLocalCount((prev) => prev + 1);

    // クリックアニメーション
    setIsClicked(true);
    setTimeout(() => {
      setIsClicked(false);
    }, 300);
  };

  if (error) {
    return (
      <div className='text-center mt-10'>
        <p className='text-sm text-muted-foreground'>{error}</p>
      </div>
    );
  }

  return (
    <div className='text-center mt-10'>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant='secondary'
        size='icon'
        className={cn(
          'w-36 h-36 rounded-full text-7xl shadow-lg cursor-pointer transition-transform duration-300 ease-in-out',
          isClicked && 'scale-110',
          isLoading && 'opacity-50 cursor-not-allowed',
        )}
        aria-label={`この記事にいいねする（現在${allCount}いいね）`}
      >
        👍
      </Button>
      <p className='text-lg mt-3 text-foreground'>
        {isLoading ? '...' : allCount}
      </p>
    </div>
  );
}
