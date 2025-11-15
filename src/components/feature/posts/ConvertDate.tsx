import dayjs from 'dayjs';

type Props = {
  convertDate: string | number | Date;
};

/**
 * 日付をフォーマットして表示するコンポーネント
 *
 * このコンポーネントは日付データを受け取り、'YYYY/MM/DD'形式にフォーマットして<time>要素で表示します。
 * dayjsライブラリを使用して日付を変換し、dateTime属性に元の日付文字列を設定します。
 *
 * @param convertDate - 変換する日付データ。文字列、数値、またはDateオブジェクトを受け付けます（例: '2025-01-15', 1705276800000, new Date()）
 * @returns フォーマットされた日付を含むtimeコンポーネント
 *
 * @example
 * ```tsx
 * import ConvertDate from '@/components/feature/posts/ConvertDate';
 *
 * // 文字列形式の日付
 * export default function PostDate() {
 *   return (
 *     <p className='text-sm text-muted-foreground'>
 *       <ConvertDate convertDate='2025-01-15' />
 *     </p>
 *   );
 * }
 * // 出力: <time dateTime="2025-01-15">2025/01/15</time>
 *
 * // Dateオブジェクトの日付
 * export default function CurrentDate() {
 *   const today = new Date();
 *   return <ConvertDate convertDate={today} />;
 * }
 * ```
 */
export default function ConvertDate({ convertDate }: Props) {
  const publishedAt = dayjs(convertDate).format('YYYY/MM/DD');

  return <time dateTime={convertDate.toString()}>{publishedAt}</time>;
}
