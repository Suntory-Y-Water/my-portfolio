---
title: １０％の確率でドオーしか表示されないポケモン生成サイトを作った
slug: i-made-pokemon-generator-10percent-chance
date: 2023-12-23
modified_time: 2023-12-23
description: PokeAPIを使って10%の確率でドオーしか表示されないポケモン生成サイトを作成。
icon: 🎮
icon_url: /icons/video_game_flat.svg
tags:
  - 個人開発
  - ポケモン
  - Next.js
  - PokeAPI
---
## 背景

PokeAPI を使ってみた一心から始まり、ポケモンをランダムに 6 匹表示するサイトを考え始めた。

作成中にランダムでポケモンを表示していると、あまりにもドオーが可愛すぎたので一定の確率でドオーしか表示されないポケモン生成サイトにすることにした。

可愛くないですか？？？
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/792ada1d-8e6f-c016-e326-0db65cc2f079.png)

## 目的
- PokeAPI を使ってみる
- Next.js の勉強を軽くしたので、AppRouter を使用して API を叩く
- なんちゃってレスポンシブデザインを実現する

## できたもの

poketter(https://poketter.vercel.app/)

https://github.com/Suntory-Y-Water/poketter

## 感想と考慮したところ

## ポケモンSVで内定しているポケモンに絞った
なにかのバグで `ランダムでポケモン育成してみようぜ!!!` みたいなことが起きたとき、内定しているポケモンだと決めるのが楽かなと思った。
最新の DLC(12 月配信)には対応できていませんが、一個前の DLC には対応できています。

## 10%でドオーは光る

10%引いたあと更に 10%引くと嬉しくなりますね！！！！

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/c1f7e2ab-125c-665d-1b1b-de2468652ed3.png)

## 画面デザインとレスポンシブデザイン

画面の色や UI については事前に Figma で設計をしました。
検討当初のボタンがそのまま入っていたりしますが..。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/3f86a012-9861-7218-5d3f-8c77518110f3.png)

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/498b5e63-4fdd-17c9-78e3-7790d9026104.png)

ボタンの色や背景色、カラーコードなどはピカチュウ大先生を連想しながら `coolors` で見つけて実装しました。

https://coolors.co/

## 最後に

本当はドオーしか出なかったときにアニメーションをつけようと思ったけど、画面負荷が高くなるとのいい感じのアニメーションが思いつかなかったのでボツになりました。

またなにか思いついたら作ります。
おわり。

