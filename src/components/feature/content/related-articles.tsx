import { BlogCard } from '@/components/feature/content/blog-card';
import type { RelatedPost } from '@/lib/recommend';

type RelatedArticlesProps = {
  relatedPosts: RelatedPost[];
};

/**
 * 関連記事を表示するコンポーネント
 *
 * TF-IDF + Cosine Similarityで計算された関連記事のリストを
 * グリッドレイアウトで表示します。
 *
 * @param relatedPosts - 関連記事の配列(類似度を含む)
 * @returns 関連記事セクションコンポーネント
 */
export function RelatedArticles({ relatedPosts }: RelatedArticlesProps) {
  // 関連記事がない場合は何も表示しない
  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className='mt-16 border-t pt-12'>
      <h2 className='mb-8 text-2xl font-bold'>関連記事</h2>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {relatedPosts.map(({ post }) => (
          <BlogCard key={post.slug} data={post} />
        ))}
      </div>
    </section>
  );
}
