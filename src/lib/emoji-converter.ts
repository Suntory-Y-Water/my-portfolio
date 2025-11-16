import emojiData from 'unicode-emoji-json';

/**
 * 絵文字の情報を表す型
 *
 * unicode-emoji-jsonパッケージが提供する絵文字メタデータの構造を定義します。
 */
type Emoji = {
  /** 絵文字の名前（例: "fire", "smiling face with halo"） */
  name: string;
  /** 絵文字のslug（例: "fire", "smiling_face_with_halo"） */
  slug: string;
  /** 絵文字のグループ（例: "Smileys & Emotion"） */
  group: string;
  /** 絵文字が追加されたEmoji仕様バージョン */
  emoji_version: string;
  /** Unicodeバージョン */
  unicode_version: string;
  /** 肌色のバリエーションをサポートするかどうか */
  skin_tone_support: boolean;
};

/**
 * FluentUI Emojiの生成パラメータ
 */
type FluentEmojiParams = {
  /** 絵文字情報 */
  emojiInfo: Emoji;
};

/**
 * 絵文字からFluentUI EmojiのURLを生成する
 *
 * Microsoft FluentUI Emojiのアセットは、GitHubのCDNでホストされています。
 * この関数は絵文字のメタデータからアセットのURLを生成します。
 *
 * URLの構造:
 * - 肌色サポートなし: `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/{DirName}/Flat/{slug}_flat.svg`
 * - 肌色サポートあり: `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/{DirName}/Default/Flat/{slug}_flat_default.svg`
 *
 * @param params - FluentUI Emojiの生成パラメータ
 * @returns FluentUI EmojiのURL
 *
 * @example
 * ```ts
 * const emojiInfo = emojiData['🔥'];
 * const url = generateFluentEmojiUrl({ emojiInfo });
 * // => 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire/Flat/fire_flat.svg'
 * ```
 */
function generateFluentEmojiUrl({ emojiInfo }: FluentEmojiParams): string {
  const { name, slug, skin_tone_support } = emojiInfo;

  // ディレクトリ名: 最初の文字を大文字、残りを小文字に変換
  // 例: "grinning face" → "Grinning face"
  const dirName = name.charAt(0).toUpperCase() + name.slice(1);
  const encodedDirName = dirName.replace(/ /g, '%20');

  if (!skin_tone_support) {
    return `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${encodedDirName}/Flat/${slug}_flat.svg`;
  }

  return `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${encodedDirName}/Default/Flat/${slug}_flat_default.svg`;
}

/**
 * 絵文字をFluentUI EmojiのURLに変換する
 *
 * この関数は絵文字文字列を受け取り、対応するFluentUI EmojiのURLを返します。
 * 絵文字データが見つからない場合や、変換できない場合は元の文字列をそのまま返します。
 *
 * @param icon - 変換する絵文字文字列（例: "🔥", "😎"）
 * @returns FluentUI EmojiのURL、または変換できない場合は元の文字列
 *
 * @example
 * ```ts
 * const url = convertEmojiToFluentUrl({ icon: '🔥' });
 * // => 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Fire/Flat/fire_flat.svg'
 *
 * const unchanged = convertEmojiToFluentUrl({ icon: 'already-a-url' });
 * // => 'already-a-url' (絵文字データが見つからないため元の値を返す)
 * ```
 */
export function convertEmojiToFluentUrl({ icon }: { icon: string }): string {
  // 絵文字データからメタデータを取得
  const emojiInfo = emojiData[icon as keyof typeof emojiData];

  // 絵文字データが見つからない場合は元の文字列を返す
  if (!emojiInfo) {
    return icon;
  }

  // FluentUI EmojiのURLを生成
  return generateFluentEmojiUrl({ emojiInfo });
}
