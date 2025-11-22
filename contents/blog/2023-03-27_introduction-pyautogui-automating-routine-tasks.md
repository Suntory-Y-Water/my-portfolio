---
title: 【Python】pyautogui入門 -定型作業を自動化してみる-
slug: introduction-pyautogui-automating-routine-tasks
date: 2023-03-27
modified_time: 2023-03-27
description: PyAutoGUIとOpenCVを使ってメルカリの定型作業を自動化する方法について。
icon: 🤖
icon_url: /icons/robot_flat.svg
tags:
  - Python
  - OpenCV
  - 自動化
  - pyautogui
---
## 概要

メルカリで行う定型作業の自動化をする際にSeleniumを用いた自動化を行おうとした。
しかし規約違反スレスレの行為でもあり、WebDriverからのアクセスは0秒でバレることを知ったため断念。

そこで普段の定型作業がキーボードとマウスをいじるだけの簡単なものだったため、opencvによる画像認識とpyautoguiを用いて作業の自動化を試みた。

## 目的

- pyautoguiで定型作業を自動化する

## 対象の動作
## 動作内容

商品を値上げした後、値段を戻すことでタイムライン上部に表示させる。

## フロー

- 現在のページからGoogle Chromeへ移動
- 商品の編集押下
- 商品の値段の末尾を一桁増やす(300円→3,000円)
    - 更新
- 商品の値段の末尾を一桁減らす(3,000円→300円)
    - 更新
- ページを閉じる

## この作業の意味

メルカリでは商品の値段を100円以上下げると、**タイムライン上部に商品が表示される**ようになる。

タイムライン上部に表示される = 売れる確率の上昇 に繋がっており、メルカリで商品を売買する身としては必須の操作です。

## 注意点

投稿者の画面解像度が4Kなので、他の画面解像度では正しく動作しない可能性があります。

## コード

``` python source.py
import time
import pyautogui as pgui

## Google Chromeへ移動する
def go_page() -> None:
    pgui.keyDown('alt')
    pgui.press('tab')
    pgui.keyUp('alt')


## 指定した画像をクリックする
def click_image(image_path: str) -> tuple:

    try:
        locate : tuple = pgui.locateOnScreen(image_path, grayscale=True, confidence=0.7)
        pgui.click(locate, duration=0.5)
        return locate

    except pgui.ImageNotFoundException:
        pgui.alert(text='画像が見つかりません', title='エラー', button='OK')


## main
def main():

    # 編集画面へ遷移する
    click_image('./image/syouhinnnohensyuu.png')
    time.sleep(5)

    pgui.press('end')
    time.sleep(2)

    # 価格を一桁減らす
    click_image('./image/hanbaikakaku.png')
    pgui.press('end')
    pgui.write('0')
    pgui.press('enter')
    time.sleep(3)

    # 編集画面へ遷移する
    click_image('./image/syouhinnnohensyuu.png')
    time.sleep(5)

    pgui.press('end')
    time.sleep(2)

    # 価格を一桁増やす
    click_image('./image/hanbaikakaku.png')
    pgui.press('end')
    pgui.press('backspace')
    pgui.press('enter')
    time.sleep(3)

    # ページを閉じる。
    pgui.hotkey('ctrl', 'w')

if __name__ == '__main__':

    page_count = input('実施件数を入力してください >>> ')
    go_page()

    for _ in range(int(page_count)):
        main()

```

## ファイル構成

```bash

│   source.py
│   
└───image
        hanbaikakaku.png
        syouhinnnohensyuu.png

```

## その他

> github → https://github.com/Suntory-Y-Water/start_pyautogui

