---
title: 自分だけのBookNotionを爆誕させた
slug: i-created-my-own-booknotion
date: 2023-10-14
modified_time: 2023-10-14
description: KindleのハイライトをNotionにまとめる自分専用BookNotionアプリを開発。
icon: 📔
icon_url: /icons/notebook_with_decorative_cover_flat.svg
tags:
  - Next.js
  - Notion
  - NotionAPI
---
## まえおき

こちら参照

https://qiita.com/Guz9N9KLASTt/items/06dbf9967be9c7155bfd

## 経緯

ソースコード内で本のタイトルを入力してデータベースへアクセスし、突合させることでしかハイライトとコメントを取得できていなかった

外出先でもやりたいな～と思ってましたが、

    🤔「デプロイしても自分だけしかアクセスできなければよいのでは？」

と感じ自分だけのBookNotionを爆誕させた

## 要件
- どこでもハイライトとコメントをページにまとめることができる
- それっぽいデザインで実装する
- 自分だけしか実装させない都合上、ログイン機能を設ける
- 最低限の機能から実装していき、徐々に拡張していく
- 誰でもできるようにはしない(めんどうだから)

## 技術系

## 使用技術
フロントエンド：Next.js
スタイリング：Tailwind CSS
ホスティング：Vercel
認証：JWT


## リポジトリ

https://github.com/Suntory-Y-Water/my-notion-manager

## レイアウト

## ログイン画面

### PC

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/40ce8dd3-95f3-7f54-258f-df469fc29fd8.png)

### SP
![IMG_5621.PNG](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/14d57bc3-9bf2-87fd-cfb2-51c345f87f7a.png)

## ページ作成画面

### PC
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/d6f78a3f-e8ea-e8cc-4863-cec4d9ac91f7.png)

### SP
![IMG_5622.PNG](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/5843b4d8-abaa-d2ed-baaa-85641befdb85.png)

## 実装手順

> [!WARNING]
> BookNotionでNotionにハイライトを登録していると前提

## APIキーの設定

https://www.notion.so/my-integrations

まずはNotionAPIを設定しましょう。
1. 新しいインテグレーションを選択
1. 名前を設定
1. 送信でAPIキーを取得
1. 機能を選択し、適切な権限を与える(めんどいんで全部与えてました)
1. 保存

## データベースにNotionAPIを連携する

こちら参照

https://www.notion.so/ja-jp/help/add-and-manage-connections-with-the-api

上で設定したAPIを連携させる必要があります。
連携先はBookNotionで登録したハイライトが格納されているデータベースになります。

## .env.localへの値設定

以下の情報を.env.localにします。
``` 
EMAIL=すきなアドレス
PASSWORD=ハッシュ化したパスワード
JWT_SECRET=秘密鍵
API_KEY=APIキーの設定で取得したAPIキー
DATABASE_ID=BookNotionのデータベースID
PAGE_URL=作成後のページが追加されるページのID
```

データベースIDの確認方法は、BookNotionで追加したデータベースのページURLが以下の場合、`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`がデータベースIDになります。
`https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`

ページIDは`https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`の場合、`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`がページIDになります。

## パスワードのハッシュ化

パスワードを平文で保存するのは良くないと怒られたのでハッシュ化します。
このあたりはご自身で調べたものを実行してください。

## 実際にやってみよう

左から、本アプリ、貼り付け先のページ、BookNotionのデータベースがあります。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/b8369a2b-c178-7eab-8769-9cd5018c3692.png)

今回ハイライトとコメントをまとめたいのは`解像度を上げる――曖昧な思考を明晰にする「深さ・広さ・構造・時間」の４視点と行動法`という本なので、そのまま送信フォームに入力し`Create a Notion page!`を押します。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/f9c55056-5f28-0c98-7872-78d17197631e.png)

するとページが追加されて中を見るとハイライトが中見出し、コメントが通常のテキスト形式で出力されているのが確認できます。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/ad3fac1e-2c3b-2e41-7dbc-cdbdbaa61845.png)

> [!WARNING]
> 本の内容を掲載する許可は取っていないため、黄色く塗りつぶしています。

## 感想

- JWTを調べながら実装した
    - なんとなく認証に対する理解が深まった
- NotionAPIすげぇ
    - おもろいもの思いついたらまた何か作りたい
- TailWind CSSは小規模なら良いと思ったけど大規模には向かなそう？
- Web APIに対する理解を深めたい
- App Routerﾅﾝﾓﾜｶﾗﾝから体系的にまとまった教材を探したい

## 今後の方針

- アプリ側から BookNotion で登録したテーブルを項目を削除する機能
- 本の予測表示？機能
- APIの型定義(レスポンスから型定義するのだるくてanyのまま)
- useEffect以外の画面リダイレクト
- ドキュメントの拡張
- ログイン回数の制限(冷静にEmailにしたのは謎)

