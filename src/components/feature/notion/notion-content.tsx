'use client';
import { type BlockMapType, NotionRenderer } from 'react-notion';
import { CodeBlock } from './code-block';

export default function NotionContent({
  content,
}: {
  content: BlockMapType;
  tags?: string[];
}) {
  // より厳密なバリデーション
  if (
    !content ||
    typeof content !== 'object' ||
    Object.keys(content).length === 0 ||
    !Object.values(content).some(
      (block) =>
        block &&
        typeof block === 'object' &&
        'value' in block &&
        typeof block.value === 'object',
    )
  ) {
    return (
      <div className='text-center py-8 text-gray-500'>
        コンテンツを読み込めませんでした
      </div>
    );
  }

  try {
    // カバー画像の有無をチェック
    const hasCover = Object.values(content).some(
      (block) => block.value?.type === 'page' && block.value?.format?.page_cover,
    );

    return (
      <div className={`notion-content ${!hasCover ? 'no-cover' : ''}`}>
        <NotionRenderer
          blockMap={content}
          fullPage
          hideHeader
          customBlockComponents={{
            code: CodeBlock,
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('Error rendering Notion content:', error);
    return (
      <div className='text-center py-8 text-gray-500'>
        コンテンツの表示中にエラーが発生しました
      </div>
    );
  }
}
