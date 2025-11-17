---
title: 支離滅裂な文章を生成するアプリ
slug: app-generates-incoherent-sentences
date: 2024-01-07
description: GASのLanguageAppクラスを使って支離滅裂な文章を生成するアプリ。
icon: 🎭
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Performing%20arts/Flat/performing_arts_flat.svg
tags:
  - GAS
  - Next.js
---
# はじめに

GASのGASのLanguageAppクラスを使って複数回翻訳を行い、支離滅裂な文章を作成するアプリ。

案はYouTubeのラムダ技術部チャンネルから。
（丸パクリでごめんなさい！！何かあればすぐ消します！！）

[【逆翻訳】支離滅裂な文章を効率的に生成する](https://youtu.be/HBG4eHf5HxM?si=xcKkZKoswB8NnIrb)

# フロー

1. 翻訳したい文字列を入力する
2. GASで翻訳して画面に返す

# できたもの

[支離滅裂な文章を生成するアプリ](https://incoherent-sentence-generation.vercel.app/)

https://github.com/Suntory-Y-Water/incoherent-sentence-generation

YouTubeでは日本語→英語→韓国語→ドイツ語→英語→日本語の順番で翻訳していましたが、動画内にちょうど写っていたスペイン語とフランス語も噛ませばもっと支離滅裂な文章になるんじゃね？と思いドイツ語→英語→フランス語→英語→スペイン語→英語→日本語の順番で追加翻訳するように変更しました。

実際に翻訳してみたところ、気づいたことがあるのでまとめていきます。

# 気になる点

## 翻訳の精度が異なる

先述の通りGASのLanguageAppクラスを使用して翻訳を実装しましたが、スプレッドシートのGOOGLETRANSLATE関数と比べると翻訳精度が良すぎる気がします。
というかGOOGLETRANSLATE関数の方が翻訳精度が明らかに悪いです。

実際に文章を比較したところ、GOOGLETRANSLATE関数の方がトンチンカンなことを言っています。

![支離滅裂2.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/b2b3be48-b18d-0575-e28f-c238fb1548a0.png)
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/fa5ca23f-b491-5df1-aab6-0ce5dee58797.png)


実際にイケてないと感じた人もすでにいらっしゃるので、どうやら昔からそうなってるそうです。

[Google Spreadsheet の googletranslate 関数の代わりに LanguageApp を使うワークシート関数を作ってイケてる翻訳ができるようにする - Qiita](https://qiita.com/kazinoue/items/82779a11af8a2dea0d21)

20分くらい調べた感じでは、LanguageAppクラスGOOGLETRANSLATE関数で翻訳エンジンが異なるかどうかは見つけられなかったので、そのあたりは謎です…

# おわりに

最近はshadcn/uiを使うのが楽しい。
ラムダ技術部チャンネル応援してます。

