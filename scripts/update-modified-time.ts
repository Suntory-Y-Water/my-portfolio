/**
 * コミット時にブログ記事の modified_time を自動更新するスクリプト
 *
 * ステージングされたブログ記事の modified_time フィールドを
 * 現在の日付（yyyy-MM-dd形式）に更新します。
 * フォーマットを保持するため、文字列操作で更新します。
 */

import { promises as fs } from 'node:fs';

/**
 * 現在の日付を yyyy-MM-dd 形式で取得
 */
function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * ブログ記事の modified_time を更新
 */
async function updateModifiedTime(filePath: string): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const currentDate = getCurrentDate();

  // date フィールドの値を取得
  const dateMatch = content.match(/^date:\s*(.+)$/m);
  if (!dateMatch) {
    console.warn(`⚠️  警告: ${filePath} には date フィールドがありません`);
    return;
  }

  const dateValue = dateMatch[1].trim();
  let updatedContent = content;

  // modified_time が存在するか確認
  const modifiedTimeMatch = content.match(/^modified_time:\s*(.+)$/m);

  if (!modifiedTimeMatch) {
    // modified_time が存在しない場合は date の直後に追加
    updatedContent = content.replace(
      /^(date:\s*.+)$/m,
      `$1\nmodified_time: ${dateValue}`,
    );
    console.log(`➕ ${filePath}: modified_time を追加 (${dateValue})`);
  } else {
    // modified_time が存在する場合は更新
    const currentModifiedTime = modifiedTimeMatch[1].trim();

    // 現在の日付と同じ場合はスキップ
    if (currentModifiedTime === currentDate) {
      console.log(`✅ ${filePath}: modified_time は最新です`);
      return;
    }

    // modified_time を更新
    updatedContent = content.replace(
      /^modified_time:\s*.+$/m,
      `modified_time: ${currentDate}`,
    );
    console.log(`🔄 ${filePath}: modified_time を更新 (${currentDate})`);
  }

  // 内容が変更された場合のみ書き込み
  if (updatedContent !== content) {
    await fs.writeFile(filePath, updatedContent, 'utf-8');
  }
}

/**
 * メイン処理
 */
async function main() {
  // コマンドライン引数からファイルパスを取得
  const filePaths = process.argv.slice(2);

  if (filePaths.length === 0) {
    console.log('更新対象のファイルがありません');
    return;
  }

  console.log('📝 modified_time を更新中...\n');

  for (const filePath of filePaths) {
    try {
      await updateModifiedTime(filePath);
    } catch (error) {
      console.error(`❌ エラー: ${filePath}`, error);
      process.exit(1);
    }
  }

  console.log('\n✅ modified_time の更新が完了しました');
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
