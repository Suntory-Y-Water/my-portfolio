---
title: メルカリShopsの再出品があまりにもだるすぎたので効率化してみた
slug: relisting-items-mercari-shops-so-tedious
date: 2023-05-02
modified_time: 2023-05-02
description: メルカリShopsの再出品作業を効率化するため、Pythonとseleniumを使った自動化アプリを開発。
icon: 🛍️
icon_url: /icons/shopping_bags_flat.svg
tags:
  - Python
  - Selenium
  - CSV
  - pandas
---
## 概要

メルカリShopsでは出品している商品を一括で更新することや、登録、削除などを行うことができる
しかし一括登録、更新機能は少々使いづらく、通常のメルカリとは違い後述する欠陥があるため時間がかかってしまう
今回はそういった問題を解決するべく、Pythonをもちいて簡易的な作業効率アプリを開発した

## 通常のメルカリとの差

通常のメルカリとは決定的に異なる点があり、値下げによるタイムラインの上位表示がなくなったことである
メルカリでは商品が上位に表示されているほど売れやすい傾向にあるため、価格を一時的に100円下げてすぐ戻すような操作を行うことが多い
また何回も値下げすると商品が上位に表示されなくなるため、一度商品を削除して再出品する人もいる

しかしメルカリShopsでは値下げ時の上位表示がされず、商品管理コードを割り当てていた場合、同一の商品管理コードは存在できない制約から再出品もしづらい

そしてcsvファイルをダウンロードして、削除→更新をしようにも商品登録時に画像を要するため、一括登録というわりには結構面倒くさい

**🤔「一度メルカリで出品している商品の商品画像と商品名をスクレイピングしてデータを保管し、Shopsで一括登録をする際、商品名からVLOOKUPみたいに引っ張ってくれば解決できるのでは？」**

要約するとこうです

- なにかしらで商品画像、商品名、商品画像名を取得する
- 取得した画像を先にアップロードする→手入力する必要がなくなる
- フォーマットが異なるcsvをいいかんじにマージする
- ボタンを押すだけで一括更新や一括登録する

長くなりましたがこんな経緯で作成しました

## フロー
## メルカリで出品している商品をスクレイピングし、商品名、商品画像、商品画像名をダウンロードする

通常のメルカリで商品を出品している人が対象です
出品している商品の画像を保存して出品するといった動作がめんどうなので、Seleniumを使用してサーバに負荷をかけない程度の頻度で取得していきます
スクレイピングをして出品した商品は商品名、商品IDとしてExcelに一度保存し、商品画像は商品ID.jpeg形式で保存します

```python
import os
import re
import csv
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
from element import XPATH_PRODUCT_IMAGE, XPATH_PRODUCT_NAME, XPATH_PRODUCT_PRICE, MORE_BUTTONS

USER_DIR = "edgs PATH"
PROFILE_DIR = "Default"
options = webdriver.EdgeOptions()
options.add_argument(f"user-data-dir={USER_DIR}")
options.add_argument(f"profile-directory={PROFILE_DIR}")
service = Service(executable_path="./driver/msedgedriver.exe")

driver = webdriver.Edge(service=service, options=options)
driver.implicitly_wait(10)

def get_products_url():
    driver.get("https://jp.mercari.com/mypage/listings")

    products_url_list = []

    while True:
        try:
            element_click(MORE_BUTTONS)
        except:
            break

    count = 1
    while True:
        try:
            products_url = driver.find_element(By.XPATH, f"/html/body/div[1]/div/div[2]/main/div/div/div/div/div/div/mer-tab/mer-tab-panel/div[1]/mer-list-item[{count}]/a").get_attribute("href")
            products_url_list.append(products_url)
            count += 1
            time.sleep(2)
        except:
            break
    
    return products_url_list

def element_click(url, wait_time=1):
    driver.find_element(By.XPATH, url).click()
    time.sleep(wait_time)

def get_product_details(products_list):
    with open('./csv/products.csv', mode='w', newline='', encoding='utf-8') as csv_file:
        fieldnames = ['Product ID', 'Product Name', 'Product Price']
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()

        for url in products_list:
            driver.get(url=url)

            product_id = extract_file_name(get_products_image())
            product_name = driver.find_element(By.XPATH, XPATH_PRODUCT_NAME).text
            product_price = driver.find_element(By.XPATH, XPATH_PRODUCT_PRICE).text
            time.sleep(2)
            
            writer.writerow({'Product ID': product_id, 'Product Name': product_name, 'Product Price': product_price})

def get_products_image():
    image_url = driver.find_element(By.XPATH, XPATH_PRODUCT_IMAGE).get_attribute("src")

    save_directory = "./merimage"
    download_image(image_url, save_directory)
    return image_url

def download_image(url, save_directory):
    response = requests.get(url, stream=True)
    response.raise_for_status()

    file_name = extract_file_name(url) + ".jpg"
    save_path = os.path.join(save_directory, file_name)

    with open(save_path, "wb") as file:
        for chunk in response.iter_content(chunk_size=8192):
            file.write(chunk)

def extract_file_name(image_url):
    pattern = r"(m\d+)_"
    match = re.search(pattern, image_url)

    if match:
        return match.group(1)
    else:
        return None

if __name__ == "__main__":
    url = get_products_url()
    get_product_details(url)
    driver.quit()
```

- 出品している商品一覧に遷移
- もっと見るボタンを押下し全ての商品を表示する
- 表示した商品の商品URLを一件ずつ取得する
- 取得した商品URLに一件ずつ遷移して、商品画像、商品名、商品画像名を取得して一件ずつcsvファイルに格納していく

ざっとですがこんな感じのフローになっています

## 取得した商品画像をメルカリShopsにアップロードする

メルカリShops側で画像を保存しておくことで、商品を登録するcsvをアップロード時に画像名に対応する画像を引っ張ってきます

## 通常のメルカリからメルカリShopsへコピー出品する

[フリマアシスト](https://chrome.google.com/webstore/detail/%E3%83%95%E3%83%AA%E3%83%9E%E3%82%A2%E3%82%B7%E3%82%B9%E3%83%88/jcbljdgnpcckiamdgmnfhijgkkaogmgg)さんで商品をコピー出品しましょう

このとき再出品する商品は、スクレイピング商品名や商品画像を取得したときの商品です
## メルカリShopsで現在出品している商品情報のcsvをダウンロードする

product_data_yyyy-mm-dd.csvといったファイル名でダウンロードされます

## 「4.」でダウロードしたcsvの商品ステータスを"2"(削除)にする

商品を全て削除してから再出品しないと二重管理になってしまうので、この段階で商品ステータスを削除に設定します

## seleniumを用いて自動で登録を行う

更新したcsvを自動で登録します
ここでエラーが発生していないか、ぬけもれがないかを一度目視で確認します

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/32c2e650-3925-7ccd-2c0c-03b922cb74c8.png)

ここまでが商品情報を取得して、商品を一括削除するまでのフローです
次は削除した商品を一括で登録する方法です

## 商品を一括登録するcsvをダウンロードする

あらかじめcsvファイルをダウンロードします
一度ダウンロードしたらマスタとして使用するだけなので、今後のフローでは参照以外で使用しません

## 商品を更新するcsvから商品を登録するcsvへマージする

先程商品ステータスを削除にしたときと同じcsvを使用します
商品を更新するcsvと登録するcsvではカラムが異なるため、必要な情報を全てマージします

この時点で、商品を一括登録するcsvの商品画像_1といったカラム以外の必須項目は埋まっているはずです

また、先程削除に設定した商品ステータスを、公開に変更します

## 商品マスタから登録する商品名を基準に商品画像名を参照する

ExcelでいうVLOOKUPみたいなことをします
商品を登録するcsvで記載されている商品名を基準にして、商品マスタ(products.xlsx)から対応する商品画像URLを持ってきます

## seleniumを用いて、自動で登録を行う

商品ステータスを更新したときと同様にcsvを自動で登録します

## ソースコード

``` python maingui.py
import os
import pandas as pd
import tkinter as tk
import PySimpleGUI as sg
from hide import *
from element import * 
from setting import Automation
from tkinter import filedialog
from tkinter import messagebox
from scraper import MercariScraper


class CsvReader(MercariScraper):

    font = ("Meiryo UI", 16)

    def __init__(self):
        super().__init__()
        self.auto = Automation()


    def check_file_exists(self, file_path):
        if os.path.exists(file_path):
            return file_path

    def read_csv(self, input_csv:str) -> pd.DataFrame:
        try:
            df_read_csv = pd.read_csv(input_csv, encoding="shift-jis")
            self.auto.logger.info("CSVファイルを読み込みました")
            return df_read_csv
        except FileNotFoundError:
            return None


    def read_excel(self, input_excel:str) -> pd.DataFrame:
        try:
            df_read_excel = pd.read_excel(input_excel)
            self.auto.logger.info("Excelファイルを読み込みました")
            return df_read_excel
        except FileNotFoundError:
            return None


    def insert_column_data(self, df_template:pd.DataFrame, df_input:pd.DataFrame) -> pd.DataFrame:
        # 取得した情報を更新するproduct_import_template.csvに内容を追加する
        for src_col, dest_col in COLUMNS_MAP.items():
            df_template[dest_col] = df_input[src_col]
        return df_template


    def update_status(self, df_template:pd.DataFrame, param:int) -> pd.DataFrame:
        df_template["商品ステータス"] = param
        return df_template


    def output_csv(self, df_template:pd.DataFrame, template_csv:str) -> pd.DataFrame:
        # 更新したCSVファイルを新しいファイルに保存する
        df_template.to_csv(template_csv, encoding="shift-jis", index=False)
        return df_template


    # 登録タブのレイアウト
    def tab_register(self) -> list:
        layout = [[sg.Text(REGISTAR_TAB_TEXT, font=self.font)],
                [sg.Button('CSV作成', key='-REGISTER-', font=self.font), sg.Button('CSV登録', key='-SELENIUM-REGISTER-', font=self.font)]]
        return layout


    # 登録タブのレイアウト
    def tab_update(self) -> list:
        layout = [[sg.Text(UPDATE_TAB_TEXT, font=self.font)],
                [sg.Button('CSV作成', key='-UPDATE-', font=self.font), sg.Button('CSV登録', key='-SELENIUM-UPDATE-', font=self.font)]]
        return layout


    # 発送タブのレイアウト
    def tab_ship(self) -> list:
        layout = [[sg.Text('～～検討使～～\n\n\n\n', font=self.font)],
                [sg.Button('CSV作成', key='-CREATE-SHIP-', font=self.font)]]
        return layout

    # 商品情報を取得するレイアウト
    def tab_get_product_data(self) -> list:
        layout = [[sg.Text(GET_PRODUCT_DATA, font=self.font)],
                [sg.Button('CSV取得', key='-GET-CSV-DATA-', font=self.font)]]
        return layout


    # メインウィンドウのレイアウト
    def layout(self) -> list:
        tab_register_layout = self.tab_register()
        tab_update_layout = self.tab_update()
        tab_ship_layout = self.tab_ship()
        tab_get_product_data_layout = self.tab_get_product_data()
        layout = [[sg.Text('業務を選択してください。', font=self.font)],
                [sg.TabGroup([[sg.Tab('登録', tab_register_layout),
                                sg.Tab('更新', tab_update_layout),
                                sg.Tab('発送', tab_ship_layout),
                                sg.Tab('商品情報取得', tab_get_product_data_layout)]], key='-TABGROUP-', enable_events=True, font=self.font)]]    
        return layout

    
    def main(self):
        sg.theme('DarkGray15')
        window = sg.Window('CSVファイル編集', self.layout())

        while True:
            event, values = window.read()

            if event == sg.WINDOW_CLOSED:
                break

            if event == '-REGISTER-':
                self.auto.logger.info("商品登録CSVを作成します。")

                # CSVファイルを読み込む
                df_input = self.read_csv(UPDATE_TEMPLATE_CSV)
                df_template = self.read_csv(TEMPLATE_CSV)
                df_master = self.read_excel(PRODUCT_MASTER)

                if df_input is not None and df_template is not None and df_master is not None:

                    # 更新系のCSVファイルから登録系のCSVファイルにマージする
                    self.insert_column_data(df_template=df_template, df_input=df_input)
                    self.update_status(df_template=df_template, param=2)
                    self.auto.logger.info("登録系CSVへの変換が完了しました。")

                    # 商品マスタを読み込む
                    self.auto.logger.info("登録系CSVにマージします。")

                    # 商品マスタから商品画像名を参照する
                    self.auto.logger.info("商品画像の紐づけを開始します。")
                    merged_df = pd.merge(df_template, df_master, on="商品名", how="left")
                    df_template["商品画像名_1"] = merged_df["Product Image"]

                    # CSVを出力する
                    self.output_csv(df_template=df_template, template_csv=REGISTAR_TEMPLATE_CSV)
                    messagebox.showinfo("完了通知", "CSVの更新が完了しました。")

                if df_input is None:
                    messagebox.showerror("読み込みエラー", "更新したCSVファイルを読み込めませんでした。")

                if df_template is None:
                    messagebox.showerror("読み込みエラー", "テンプレートCSVファイルを読み込めませんでした。")

                if df_master is None:
                    messagebox.showerror("読み込みエラー", "商品マスタを読み込めませんでした。")


            if event == '-SELENIUM-REGISTER-':
                path = self.check_file_exists(UPLOAD_CSV_WITH_REGISTER)
                
                if path is not None:
                    self.init_driver()
                    self.get_url(f"https://mercari-shops.com/seller/shops/{SHOPS_URL}/products/upload")
                    self.click_upload_element(element=CSV_REGISTER_BUTTON, file_path=UPLOAD_CSV_WITH_REGISTER)
                    messagebox.showinfo("確認", "CSVの登録が完了しました。\n目視で商品情報を確認してください。")

                if path is None:
                    messagebox.showerror("PATHエラー", "該当のCSVファイルがありません。\n確認してください。")


            if event == '-UPDATE-':
                self.auto.logger.info("商品ステータスを非公開にします。")

                # 最新の商品情報CSVを選択する。
                root = tk.Tk()
                root.withdraw()
                file_path = filedialog.askopenfilename()
                df_input = self.read_csv(file_path)

                if df_input is not None:
                    self.update_status(df_template=df_input, param=3)
                    self.output_csv(df_template=df_input, template_csv=UPDATE_TEMPLATE_CSV)
                    self.auto.logger.info("CSVの更新が完了しました。")
                    messagebox.showinfo("完了通知", "CSVの更新が完了しました。")
                
                if df_input is None:
                    messagebox.showerror("読込エラー", "CSVファイルを取得できませんでした。")


            if event == '-SELENIUM-UPDATE-':
                path = self.check_file_exists(UPLOAD_CSV_WITH_UPDATE)
                
                if path is not None:
                    self.init_driver()
                    self.get_url(f"https://mercari-shops.com/seller/shops/{SHOPS_URL}/products/update")
                    self.click_upload_element(element=CSV_UPLOAD_BUTTON, file_path=UPLOAD_CSV_WITH_UPDATE)
                    messagebox.showinfo("確認", "CSVの登録が完了しました。\nアップロードを押し、目視で商品情報を確認してください。")
                    self.quit()
                
                if path is None:
                    messagebox.showerror("PATHエラー", "該当のCSVファイルがありません。\n確認してください。")


            if event == '-CREATE-SHIP-':
                self.auto.logger.info("sample")

            if event == '-GET-CSV-DATA-':
                # ShopsIDは一意にする
                self.init_driver()
                self.get_url(f"https://mercari-shops.com/seller/shops/{SHOPS_URL}/products/download")
                self.element_click("/html/body/div[1]/div[2]/div/div/div[1]/button")
                messagebox.showinfo("終了通知", "商品情報を取得しました。")
                self.quit()

        window.close()


if __name__ == '__main__':
    gui = CsvReader()
    gui.main()
```

## 今後実装したいこと

- デスクトップアプリではなくWebアプリケーションとして実装したい
  - LINE Message APIなどを利用してスマホからでも操作できるようにしたい
- 発送するときの宛名作成を楽にするテンプレートの作成
- ピンポイントで在庫や商品価格を変更できるようなUIや設計(csv直接いじればよくね説はある)

## その他

- ほぼ自分用のアプリケーションになってしまった
  - 誰もが使えるものは難しい
- メルカリのスクレイピングはグレーゾーンなのでお祈り

