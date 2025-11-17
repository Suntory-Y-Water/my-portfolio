---
title: 【React】初めてのフロントエンド〜ランダムで今日行くラーメン二郎を決めてもらう〜
slug: my-first-frontend-randomly-decide-ramen
date: 2023-06-10
description: Reactを使ってランダムでラーメン二郎の店舗を表示するアプリを作成。初めてのフロントエンド開発。
icon: 🍜
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Steaming%20bowl/Flat/steaming_bowl_flat.svg
tags:
  - JavaScript
  - 初心者
  - Firebase
  - React
---
# はじめに

ぼく「フロントエンドなんもわからん🤮」
ということでJavaScriptすら怪しい身ですが、Reactで簡単なアプリケーションをつくってみました。

# 成果物案

- ボタン押下で東京都・神奈川県のラーメン二郎の店舗情報をランダムで表示する
    - 店舗情報は店舗名・住所・営業時間・定休日とする

# 作成手順

## とりあえずJavaScriptの基礎を知る

Pythonは触ってきたので、JavaScriptの基礎を勉強しました。

## Reactの導入

最初はNext.JSのロゴがカッコよくReactの過程をすっ飛ばしてインストールしましたが、冷静に分からなさすぎたので引退しました。

node.jsをインストール後、`npx create-react-app app-name`で新規プロジェクトを作成します。

## Reactの基礎を知る

以下の動画でReactの基礎を学びました。

>[【React Hooks入門】完全初心者OK！8種類のHooksを学んでReactの理解を深めよう](https://www.youtube.com/watch?v=uuAdVs7sbAs&ab_channel=%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0%E3%83%81%E3%83%A5%E3%83%BC%E3%83%88%E3%83%AA%E3%82%A2%E3%83%AB)
[新・日本一わかりやすいReact入門【基礎編】](https://www.youtube.com/playlist?list=PLX8Rsrpnn3IWPoM7-1YPDksRRkamRY25k)

Reactを使用する理由と各フックスの解説を一通り学ぶことができます。

## ラーメン屋の情報を取得する

PythonでSeleniumを用いて取得しました。
取得したデータはCSV形式で保存しています。

取得したデータの営業時間や日付の正規化はChatGPTに丸投げです。

## Firestroe/Firebaseを知る

これらの動画・記事を参考にしました。

> [【Firebase】FireStoreに一括でcsvまたはjson形式のデータをアップロードする](https://qiita.com/tetsukick/items/7912c0f49c742c63a8e6)
[【2022最新版】Firebase入門！Reactと連携してデータベース接続をしてみよう](https://www.youtube.com/watch?v=9NOg_HSbo9w&t=2s&ab_channel=%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0%E3%83%81%E3%83%A5%E3%83%BC%E3%83%88%E3%83%AA%E3%82%A2%E3%83%AB)

登録から情報の反映方法まで分かりやすく説明しているので、かなり助かりました。

導入後はCSV形式で保存したデータをJsonに変換し、こちらの記事を参考にFirebase/Firestoreにデータを一括登録します。

## 実際に作成してみる

最低限のCSSを設定して完成です。
CSSはこちらを参考にしました。
> [CSSで作るローディングアニメーション40選〜待ち時間を楽しくするテクニック](https://photopizza.design/css_loading/)

firebase.jsはもろもろの情報があるため、割愛します。

``` jsx:App.js
import { useEffect, useState } from 'react';
import './App.css';
import db from './firebase';
import { collection, getDocs, onSnapshot } from "firebase/firestore";

function App() {
  
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect( () => {
    const postData = collection(db, "jirouFromTokyoAndKanagawa");
    getDocs(postData).then((snapShot) => {
      const postsData = snapShot.docs.map((doc) => ({ ...doc.data()}));
      setPosts(postsData);
    });

    onSnapshot(postData, (post) => {
      const postsData = post.docs.map((doc) => ({...doc.data()}));
      setPosts(postsData);
    });
  }, [])

  const handleButtonClick = () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (posts.length > 0) {
        const randomIndex = Math.floor(Math.random() * posts.length);
        setSelectedPost(posts[randomIndex]);
      }
      setIsLoading(false);
    }, 2000);
  }

  return (
    <div className="App">
      <div className="App-header">
        <h1>じろるーれっと</h1>
      </div>
      <div className='mainContaienr'>
        <table className='tableLayout'>
          {isLoading ?
            <div className='circle-body'>
              <div className='spinner-box'>
                <div className="circle-border">
                  <div className="circle-core"></div>
                </div>
              </div>
            </div>:
              selectedPost && (
                <div key={selectedPost.store_name}>
                  <h1 className='title'>{selectedPost.store_name}</h1>
                  <tr>
                    <th>店名</th>
                    <th>{selectedPost.store_name}</th>
                  </tr>
                  <tr>
                    <th>住所</th>
                    <th>{selectedPost.store_address}</th>
                  </tr>
                  <tr>
                    <th>営業時間</th>
                    <th>{selectedPost.open_time}</th>
                  </tr>
                  <tr>
                    <th>定休日</th>
                    <th>{selectedPost.close_day}</th>
                  </tr>
                </div>
              )
            }
        </table>
        <div className='button-container'>
          <div>
            <button onClick={handleButtonClick} className='randomButton'>ラーメン屋を選ぶ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
```

``` css:App.css
:root {
  --main-background-color: #1e2739;
  --main-color: white;
}

.App, .App-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: var(--main-background-color);
  font-size: calc(10px + 2vmin);
  color: var(--main-color);
}

.App {
  min-height: 100vh;
}

.App-header {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px 40px;
  box-sizing: border-box;
}

.tableLayout, .title {
  text-align: left;
  margin: auto;
}

.mainContaienr {
  width: 75%;
  height: 75%;
}

.randomButton {
  background-color: #00af4f;
  border: none;
  color: var(--main-color);
  text-align: center;
  display: inline-block;
  font-size: 16px;
  font-weight: bold;
  padding: 10px 24px;
  border-radius: 100vh;
  margin: 50px auto 0;
  position: relative;
  transition: background-color 0.4s, transform 0.4s;
  cursor: pointer;
}

.randomButton:hover {
  background-color: #007f3b;
  color: white;
}

.randomButton:active {
	transform: translate(0,10px);
	border-bottom:none;
}

.spinner-box {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
}

.circle-border, .circle-core {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.circle-border {
  width: 150px;
  height: 150px;
  padding: 3px;
  background: linear-gradient(0deg, rgba(63,249,220,0.1) 33%, rgba(63,249,220,1) 100%);
  animation: spin .8s linear 0s infinite;
}

.circle-core {
  width: 100%;
  height: 100%;
  background-color: var(--main-background-color);
}

@keyframes spin {
  from {
      transform: rotate(0);
  }
  to{
      transform: rotate(359deg);
  }
}

.circle-body {
  background-color: var(--main-background-color);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: flex-start;
}
```

## 実際に決めてもらう

こんなかんじです。
どういった装飾がよいか思いつかず、ローディングとボタンだけきれいにしました。

![React-App-Google-Chrome-2023-06-10-19-38-39-Trim.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/2f926575-2a2c-8858-f601-69ea3087c307.gif)


# 感想

html, css, javascriptあたりをもう一度復習かな…
特にjavascriptの文法が実際に扱ってみてもまだ理解していない部分が多いので、今後とも学びつつ作成していきます。

次回はこちらで表示した住所をGoogleMapsAPIでMapを表示し、ピンを打つところまでやっていこうかと思います。

