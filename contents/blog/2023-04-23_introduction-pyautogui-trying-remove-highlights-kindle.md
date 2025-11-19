---
title: 【Python】pyautogui入門 -Kindleのハイライトを削除してみる-
slug: introduction-pyautogui-trying-remove-highlights-kindle
date: 2023-04-23
modified_time: 2023-04-23
description: デスクトップのKindleアプリでハイライトと注記を自動削除するPyAutoGUIスクリプト。
icon: 📱
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Mobile%20phone/Flat/mobile_phone_flat.svg
tags:
  - Python
  - OpenCV
  - pyautogui
---
## 概要

デスクトップのKindleアプリで、選択した本のハイライトと注記を削除する。

## 目的

もう一度読みたくなった本で、以前のハイライトや注記が目につくとなんか萎えたため。
それと新鮮な気持ちで読みたいため。

実装方法について、Seleniumで実装しようと思ったが、慣れている画像認識を使用した。

## ソースコード

``` python
import pyautogui as pgui

def locate_check(image_path : str) -> tuple:
    locate = pgui.locateOnScreen(image_path, grayscale=True, confidence=0.7, region=(3337,595,417,306))
    return locate

def image_locate_click(image_path : str) -> tuple:
    locate = locate_check(image_path)
    x, y = pgui.center(locate)
    pgui.click(x, y, duration=0.5)
    return (x, y)

def main():

    tyuuki = "./tyuukisakujo.png"
    highlight = "./hairaitosakujo.png"

    pgui.hotkey('alt', 'tab')

    while True:
        try:
            image_locate_click("./option.png")
            
            if locate_check(tyuuki):
                image_locate_click(tyuuki)
            elif locate_check(highlight):
                image_locate_click(highlight)
            else:
                pass
            pgui.press('home')
        except:
            break

if __name__ == "__main__":
    main()

```

## 実行方法

alt + tabでKindle(PC版)に移動できる状態にしてください。

実行後は遷移して画面右側のオプションボタン(・・・みたいなやつ)をクリックし、ハイライトまたは注記を削除します。

途中のhome押下はハイライトしている箇所が多いと、指定の座標範囲に収まらないため実施しています。

## 注意点

regionで指定している座標は、筆者のPCが4Kモニターを使用しているため、他のサイズをご使用の際は適宜変更してください。

## その他

github → https://github.com/Suntory-Y-Water/HighlightDelete

