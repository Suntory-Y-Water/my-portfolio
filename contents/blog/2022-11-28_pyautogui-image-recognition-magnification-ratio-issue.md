---
title: PyAutoGUI 画像認識と拡大比率の問題
slug: pyautogui-image-recognition-magnification-ratio-issue
date: 2022-11-28
modified_time: 2022-11-28
description: PyAutoGUIを用いた作業自動化で発見した画像認識の課題。PCの画面解像度が異なる場合の画像認識の問題について。
icon: 🔍
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Magnifying%20glass%20tilted%20left/Flat/magnifying_glass_tilted_left_flat.svg
tags:
  - Python
  - OpenCV
  - 画像認識
  - pyautogui
---
## 目的
PyAutoGUIを用いて作業を効率よく進めようと試みている最中に発見したことを備忘録として投稿します。

## 経緯
同じ作業を繰り返すものがあったため自動化することにした。
友人も似たような作業をするので、どうせならアプリ化して配ろうとしたところ以下の問題にあたった。

- PCの画面解像度が異なる場合、正常に画像認識ができるのか。

またこの問題は現在解決していなく、解決策を模索している。

## 画面解像度が異なると読み込めない？

例として以下の画像を掲載します。
これはPC版のメルカリで商品を出品していると表示されるページの一部です。

![スクリーンショット 2022-11-28 230918.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/3bf35c8c-a7ca-9268-839c-424bd0bf1be1.png)

今回は画面中心部にある**商品の編集**を自動で押すために、指定した画像の`Path`に合致する関数を作成。
`Path`には予め切り抜いた画像を用意しました。

何回かうまく動作しないことがあったので確認したところ、拡大比率が画像を切り抜いたときとは違うことに気づきました。

検証として同様の部分を2枚切り抜き動作確認を行います。
一見ほぼ同じの画像ですが、上はWebページの拡大比率が100%に対して、下は110%で切り抜いています。
![syouhinnnohensyuu.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/6d662d38-dfb2-3d6c-7b35-5dd5d5e4e82d.png)

![test.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/f0275c9f-925f-604e-52dd-38eba979ef0b.png)

関数には拡大比率100%のときでしかクリックするように設定していないため、人間の視覚ではほぼ同じものでも読み取れないことが分かりました。

## 対策

- Seleniumで自動化する
- 拡大比率ごとに切り抜く

このあたりでしょうか。
どちらにせよもう少し勉強していきたい分野なので、今一度調べてみます。

## 備考
思いついた瞬間に記事を書いているのであまり深く調べていません。
こんなん常識だよ！と感じる方は是非ご教授お願いいたします。

