---
title: iOSでもWindowsと同じ絵文字を表示したい！
date: 2025-03-30
modified_time: 2025-03-30
icon: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20halo/Flat/smiling_face_with_halo_flat.svg
icon_url: /icons/smiling_face_with_halo_flat.svg
slug: ios-kawaii-emoji
tags:
  - 絵文字
description: "絵文字は私たちのデジタルコミュニケーションに欠かせない存在ですが、同じ絵文字コードでもOSによって見た目が大きく異なります。例えば「\U0001FAE0」（溶ける顔）や「\U0001F60E」（サングラスの顔）は、iOSとWindowsで全く異なるデザインです。本記事では、Webアプリケーション上でOSに関係なく統一した絵文字表示を実現するため、MicrosoftのFluent UI Emojiを使った実装方法を解説します。"
---


## iOSとWindowsでの絵文字差異

絵文字は Unicode で定義されています。
Unicode では絵文字ごとに固有のコードポイント(番号)が割り当てられており、これによってデバイス間で同じ絵文字が識別されます。

- 😎 : U+1F60E
- 😂 : U+1F602

Unicode はデザインを指定していません。
「😎＝サングラスをかけた顔」という意味は統一されていますが、「どんなサングラスをかけるか」「表情はどうするか」などは各プラットフォームごとで自由にデザインできます。
これは意図的な設計選択であり、各企業が自社のデザイン言語に合わせた絵文字スタイルを開発できるようにしています。例えば以下のような違いがあります。

- Apple の絵文字：光沢のある 3D 調デザインが特徴
- Microsoft の絵文字：Fluent Design System に準拠したフラットでカラフルなデザイン
- Google の絵文字：Material Design に基づいたシンプルなアウトラインと鮮やかな色使い

実際に絵文字の違いを見ていきましょう。
例えば「😎＝サングラスをかけた顔」の絵文字は iOS ではこのようなアイコンになっています。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/IMG_9132.jpeg-1743294181758.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/IMG_9132.jpeg-1743294181758.png)

Windows の PC で見たときはこのようなアイコンになっています。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/IMG_9133.jpeg-1743294181758.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/IMG_9133.jpeg-1743294181758.png)
これは Microsoft の Fluent UI Emoji コレクションの一部です。
このコレクションはオープンソースで公開されており、以下のリポジトリからダウンロードできます。

https://github.com/microsoft/fluentui-emoji

以下の Web サイトで各アイコンの比較をできます。

https://fluentemoji.com/

どちらの絵文字も可愛いんですが、個人的には Fluent UI
Emoji のほうが可愛いですよね！？
ということで私のポートフォリオに表示しているブログページのアイコンを、Fluent UI
Emoji にしていきましょう。

## Fluent Emojiの概要

絵文字は[Fluent Emoji](https://fluentemoji.com/)で公開されている SVG を使用します。
例えば、「😎」は以下のような URL で定義されています。途中の `%20` は半角スペースです。

```bash
https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Smiling%20face%20with%20sunglasses/Flat/smiling_face_with_sunglasses_flat.svg
```

各絵文字は `/assets/{slug}/{style}/{slug}_{style}.svg` という定義に成り立っているので、それにあわせて絵文字を `fetch` します。
今回は Flat アイコンのみを使用するので、`style` の箇所は `flat` 固定です。

絵文字の slug 特定には `unicode-emoji-json` を使用します。

```bash
pnpm add unicode-emoji-json
```

以下は `unicode-emoji-json` の構造体です。絵文字アイコンに紐づいて `slug` が設定されています。

```json
{
  "😀": {
    "name": "grinning face",
    "slug": "grinning_face",
    "group": "Smileys & Emotion",
    "emoji_version": "1.0",
    "unicode_version": "1.0",
    "skin_tone_support": false
  }
}
```

## 変換ロジックの作成

絵文字の構造体が分かったところで、実際に絵文字アイコンを `unicode-emoji-json` を利用して変換する処理を実装していきましょう。
絵文字の構造体を見るに、各絵文字に紐づいている状態なので以下のような実装で `slug` 等を取得できます。

```typescript
import emojiData from 'unicode-emoji-json';

type Emoji = {
  name: string;
  slug: string;
  group: string;
  emoji_version: string;
  unicode_version: string;
  skin_tone_support: boolean;
};

async function getValidFluentEmojiUrl(icon: string) {
  const emojiInfo = emojiData[icon as keyof typeof emojiData];

  if (!emojiInfo) {
    return icon;
  }

  // URLを生成
  const url = generateFluentEmojiUrl(emojiInfo);

  // URLが有効かどうかを確認
  const isValid = await checkUrlValidity(url);

  if (!isValid) {
    return icon;
  }

  return url;
}
```

絵文字が取得できたら、各絵文字の URL を取得していきます。
注意点としては、2015 年頃に人の顔や手足などを表す絵文字の一部で、ユーザーが肌の色（スキントーン）を選べるようになりました。その影響で一部絵文字の URL が異なっています。

(公式サイトから引用しようとしたらページが削除されていました…)

https://internet.watch.impress.co.jp/docs/news/697088.html

肌の色を選ぶことができる絵文字は `skin_tone_support` が `ture` のものが対象です。

今回は初期設定のデフォルトを選択します。

```typescript
function generateFluentEmojiUrl(emojiInfo: Emoji) {
  const { name, slug, skin_tone_support } = emojiInfo;

  // ディレクトリ名は最初の単語の先頭のみ大文字、残りは小文字
  // grinning face -> Grinning face
  const dirName = name.charAt(0).toUpperCase() + name.slice(1);

  const encodedDirName = dirName.replace(/ /g, '%20');

  if (!skin_tone_support) {
    return `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${encodedDirName}/Flat/${slug}_flat.svg`;
  }

  return `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${encodedDirName}/Default/Flat/${slug}_flat_default.svg`;
}
```

最後に絵文字の有効性を確認します。
もし URL が異なっていたり、アイコンがなくなっているときは入力元のアイコンを表示したいので、fetch して正常終了するか確認していきましょう。

```typescript
async function checkUrlValidity(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return false;
    }
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : '不明なエラー';
    console.error(
      `URLの有効性チェックに失敗しました: ${url} message: ${message}`
    );
    return false;
  }
}
```

上記のソースコードを実装したものを、以下の記事で紹介したロジックに追加して記事を追加します。

https://suntory-n-water.com/blog/messaging-api-github-pr

確認したところ、iOS で[Fluent
Emoji](https://fluentemoji.com/)の内容が反映されていますね。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/IMG_9137.png-1743294181758.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/IMG_9137.png-1743294181758.png)

見づらいですが救急車と波が iOS のものではないことが確認できます。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/IMG_9138.jpeg-1743294181758.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/IMG_9138.jpeg-1743294181758.png)

## まとめ

- 絵文字は Unicode で統一的に定義されていますが、実際の表示デザインはプラットフォームによって異なる。
- iOS でも[Fluent Emoji](https://fluentemoji.com/)を使うことで、Windows で表示される絵文字と同様のものを使用できる。
- Microsoft の Fluent UI Emoji はオープンソースで提供されており、Web アプリケーションで利用可能。
- `unicode-emoji-json` ライブラリを利用して絵文字コードから Fluent Emoji へのマッピングを実装できます
