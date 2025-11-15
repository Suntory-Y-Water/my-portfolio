'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  selectedSource: string;
  onSourceChange: (value: string) => void;
};

/**
 * 投稿のソース別フィルターコンポーネント
 *
 * このコンポーネントはドロップダウンセレクトボックスを表示し、ユーザーが投稿のソースを選択できるようにします。
 * 選択肢は「すべて」「Zenn」「Qiita」「note」で、選択された値が変更されると親コンポーネントに通知されます。
 *
 * @param selectedSource - 現在選択されているソースの値（例: 'all', 'Zenn', 'Qiita', 'note'）
 * @param onSourceChange - ソースが変更されたときに呼び出されるコールバック関数。新しい選択値を受け取ります
 * @returns 投稿フィルターコンポーネント
 *
 * @example
 * ```tsx
 * import { useState } from 'react';
 * import PostsFilter from '@/components/feature/posts/PostsFilter';
 *
 * export default function PostsPage() {
 *   const [selectedSource, setSelectedSource] = useState<string>('all');
 *
 *   return (
 *     <div>
 *       <PostsFilter
 *         selectedSource={selectedSource}
 *         onSourceChange={setSelectedSource}
 *       />
 *       // 選択されたソースに基づいて投稿を表示
 *     </div>
 *   );
 * }
 * ```
 */
export default function PostsFilter({ selectedSource, onSourceChange }: Props) {
  return (
    <div className='w-[200px]'>
      <Select value={selectedSource} onValueChange={onSourceChange}>
        <SelectTrigger>
          <SelectValue placeholder='記事の種類を選択' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>すべて</SelectItem>
          <SelectItem value='Zenn'>Zenn</SelectItem>
          <SelectItem value='Qiita'>Qiita</SelectItem>
          <SelectItem value='note'>note</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
