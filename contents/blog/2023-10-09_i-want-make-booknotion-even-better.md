---
title: BookNotionを更に神アプリにしたい その１
slug: i-want-make-booknotion-even-better
date: 2023-10-09
modified_time: 2023-10-09
description: BookNotionをより便利にするための機能拡張について。
icon: 📔
icon_url: /icons/notebook_with_decorative_cover_flat.svg
tags:
  - JavaScript
  - Notion
  - NotionAPI
---
## はじめに
[BookNotion](https://booknotion.site/)というアプリをご存知ですか？
> KindleのハイライトをかんたんにNotionに保存できる読書記録アプリ(公式サイトより)

すごくざっくり説明すると、ハイライトした箇所をNotionにまとめることができるアプリです。
追加するときもメモとして自分のコメントを入れることや、タグ付けもできます。

追加したあとはNotion内でデータベースにまとめられます。
黄色く塗りつぶしているのは、実際にハイライトした内容がはいっています。
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/602b5ee9-e749-e197-3d68-bbd5a6a2feb3.png)

## 問題点

このままでも既に神アプリなんですが、個人的な問題点があります。
それは書籍単位でページにまとめられないことです。
理想としては、本Aという新規ページを作成してページ内にハイライトとコメントを全てまとめたいのです:grimacing:

## ならつくればよくね？

NotionにはAPIが提供されているということで作ってみることにします。
アプリにする気はないので、とりあえず自分用にページ単位でまとめることができればOKとします。

## 実際にやってみた

フローとしては以下のようになると思っています。
1. BookNotionで追加したデータベースから本のタイトルを取得する
1. 本のタイトルに紐づくハイライトとコメントを取得する
1. 1.で取得した本のタイトル名で新規ページを作成する
1. 2.で取得したハイライトとコメントを、作成したページ内に追加する

ひとまずはAPIで取得したデータを実際に追加できるかどうかを試したいので、1件だけ取得・作成したいと思います。

## ソースコード

``` ts
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'https://api.notion.com/v1';
const API_KEY = process.env.API_KEY;
const DATABASE_ID = process.env.DATABASE_ID;
const PAGE_URL = process.env.PAGE_URL;
const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

//                      BookNotionのBook Titleに紐づいた名前がはいる
const selectBookName = '武器になる哲学　人生を生き抜くための哲学・思想のキーコンセプト50';

const createNewPage = async (pageTitle: string, highlight: string, comment: string) => {
  try {
    const response = await fetch(`${API_URL}/pages`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        parent: {
          type: 'page_id',
          page_id: PAGE_URL,
        },
        properties: {
          title: {
            type: 'title',
            title: [
              {
                type: 'text',
                text: { content: pageTitle },
              },
            ],
          },
        },
      }),
    });
    const data = await response.json();
    console.log(`Page created: ${data.id}`);

    const blocks = [
      {
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: { content: highlight },
            },
          ],
        },
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: comment },
            },
          ],
        },
      },
    ];
    await appendBlockChildren(data.id, blocks);
  } catch (error) {
    console.error(error);
  }
};
const appendBlockChildren = async (pageId: string, blocks: any[]) => {
  try {
    const response = await fetch(`${API_URL}/blocks/${pageId}/children`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ children: blocks }),
    });
    const data = await response.json();
  } catch (error) {
    console.error(error);
  }
};

const getBookProperties = async (selectBookName: string): Promise<BookProperties | {}> => {
  try {
    const response = await fetch(`${API_URL}/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: HEADERS,
    });
    const data = await response.json();

    const filteredPages = data.results.filter((page: any) => {
      const bookTitle = page.properties['📙  Book Title'].select.name;
      return bookTitle === selectBookName;
    });

    if (filteredPages.length > 0) {
      const highlight: string = filteredPages[0].properties['📝  Highlight'].title[0].plain_text;
      const comment: string = filteredPages[0].properties['💬  Comment'].rich_text[0].plain_text;
      return { highlight, comment };
    } else {
      console.log('No pages found with the specified book title.');
      return {};
    }
  } catch (error) {
    console.error(error);
    return {};
  }
};

getBookProperties(selectBookName).then((properties: BookProperties | {}) => {
  if ('highlight' in properties && 'comment' in properties) {
    const { highlight, comment } = properties as BookProperties;
    createNewPage(selectBookName, highlight, comment);
  }
});
```

## 動かしてみた

こんな感じで追加されます。
ハイライトの内容は見出し2(## )で追加したため、大きくなっています。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/f79e2da0-c590-e82a-6c59-af9d1525cfe5.png)

## 次回

ハイライトとコメントを全部取得できるようにします。

