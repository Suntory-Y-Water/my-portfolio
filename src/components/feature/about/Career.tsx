type Props = {
  date: string;
  description: string;
};

/**
 * 経歴（キャリア）の1項目を表示するコンポーネント
 *
 * このコンポーネントは日付と説明文を受け取り、タイムライン形式で表示します。
 * モバイルでは縦に積み重なり、デスクトップでは左側に日付、右側に説明文が横並びで表示されます。
 * 境界線によって視覚的にセクションを区切り、経歴の流れを分かりやすく表現します。
 *
 * @param date - 経歴の日付または期間（例: '2020年4月', '2021年 - 2023年'）
 * @param description - 経歴の詳細説明（例: '〇〇大学入学', '株式会社〇〇に入社し、フロントエンド開発を担当'）
 * @returns 経歴項目コンポーネント
 *
 * @example
 * ```tsx
 * import Career from '@/components/feature/about/Career';
 *
 * export default function AboutPage() {
 *   return (
 *     <div>
 *       <Career
 *         date='2020年4月'
 *         description='〇〇大学工学部コンピュータサイエンス学科入学'
 *       />
 *       <Career
 *         date='2021年 - 2023年'
 *         description='株式会社〇〇に入社し、Reactを使用したフロントエンド開発を担当'
 *       />
 *       <Career
 *         date='2024年 - 現在'
 *         description='フリーランスのソフトウェアエンジニアとして活動開始'
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export default function Career({ date, description }: Props) {
  return (
    <div className='flex flex-col py-2 md:flex-row md:space-x-2'>
      {/* モバイルでは上部、md以上では左側に配置 */}
      <div className='text-left font-semibold md:w-1/6'>{date}</div>
      {/* モバイルでは上部の下に配置し、md以上では左側に境界線と余白を付与 */}
      <div className='mt-1 border-t-2 md:mt-0 md:w-5/6 md:border-l-2 md:border-t-0 md:pl-4'>
        <p>{description}</p>
      </div>
    </div>
  );
}
