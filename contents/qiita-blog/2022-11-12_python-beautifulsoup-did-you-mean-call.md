---
title: Python BeautifulSoup find()を呼び出すつもりが、find_all()を呼び出してしまったのでしょうか？
slug: python-beautifulsoup-did-you-mean-call
date: 2022-11-12
description: Pythonでスクレイピングする際に何度も遭遇したfind()とfind_all()の使い分けエラーについての備忘録。
icon: 🕷️
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Spider%20web/Flat/spider_web_flat.svg
tags:
  - Python
  - スクレイピング
  - BeautifulSoup
---
# 目的

Pythonでスクレイピングをするときに何回もやらかしたので、今後も無駄な時間を使わないためにも備忘録として投稿します。

## 流れ

- コードの内容、実際のコード
- エラー文
- 解決策

# コードの内容

関東圏にあるAppleStoreの店舗名と営業時間を取得し`print()`で記述するプログラムを書きたかった。

```Python:エラー吐きます
import requests
from bs4 import BeautifulSoup
from pprint import pprint
from time import sleep

def getStoreInformation():
    urlLists = ["https://www.apple.com/jp/retail/marunouchi/",
                "https://www.apple.com/jp/retail/ginza/",
                "https://www.apple.com/jp/retail/shinjuku/",
                "https://www.apple.com/jp/retail/shibuya/",
                "https://www.apple.com/jp/retail/omotesando/",
                "https://www.apple.com/jp/retail/kawasaki/"]

    for urlList in urlLists:

        sleep(2)
        r = requests.get(urlList)
        soup = BeautifulSoup(r.text, 'html.parser')

        locationData = soup.find(class_='store-detail-heading-name').find('h1')
        print(locationData.text)

        dateKey = []
        hourValue = []

        for d in soup.find_all(class_='store-hours-table-date').text:
            dateKey.append(d.find(class_="visuallyhidden"))

        for h in soup.find_all(class_='store-hours-table-hours').text:
            hourValue.append(h)

        storeInformation = dict(zip(dateKey, hourValue))
        pprint(storeInformation)
        pprint("-----------------------------------------")

if __name__ == '__main__':
    getStoreInformation()
```

## エラー文

**AttributeError: ResultSet object has no attribute 'text'. You're probably treating a list of elements like a single element. Did you call find_all() when you meant to call find()?**

翻訳すると以下のような意味になる。

**AttributeError: ResultSetオブジェクトには'text'属性がありません。おそらく、要素のリストを単一の要素のように扱っているのでしょう。find()を呼び出すつもりが、find_all()を呼び出してしまったのでしょうか？**

# 解決策

`find_all()`を使う場合その結果はリストで得られるため、`.text()`などを用いる場合は繰り返し処理で記述する。

```python
import requests
from bs4 import BeautifulSoup
from pprint import pprint
from time import sleep

def getStoreInformation():
    urlLists = ["https://www.apple.com/jp/retail/marunouchi/",
                "https://www.apple.com/jp/retail/ginza/",
                "https://www.apple.com/jp/retail/shinjuku/",
                "https://www.apple.com/jp/retail/shibuya/",
                "https://www.apple.com/jp/retail/omotesando/",
                "https://www.apple.com/jp/retail/kawasaki/"]

    for urlList in urlLists:

        sleep(2)
        r = requests.get(urlList)
        soup = BeautifulSoup(r.text, 'html.parser')

        locationData = soup.find(class_='store-detail-heading-name').find('h1')
        print(locationData.text)

        dateKey = []
        hourValue = []

        for d in soup.find_all(class_='store-hours-table-date'):
            dateKey.append(d.find(class_="visuallyhidden").text)

        for h in soup.find_all(class_='store-hours-table-hours'):
            hourValue.append(h.text)

        storeInformation = dict(zip(dateKey, hourValue))
        pprint(storeInformation)
        pprint("-----------------------------------------")

if __name__ == '__main__':
    getStoreInformation()
```

# 参考資料

[BeautifulSoupで要素内の要素を取得したい](https://ja.stackoverflow.com/questions/62793/beautifulsoup%E3%81%A7%E8%A6%81%E7%B4%A0%E5%86%85%E3%81%AE%E8%A6%81%E7%B4%A0%E3%82%92%E5%8F%96%E5%BE%97%E3%81%97%E3%81%9F%E3%81%84)

## 蛇足

内包表記のほうがスッキリ見えそう（理解しやすいとは言っていない）

```python
dateKey = [d.find(class_="visuallyhidden").text for d in soup.find_all(class_='store-hours-table-date')]
hourValue = [h.text for h in soup.find_all(class_='store-hours-table-hours')]
```

投稿直前にformat関数で記述したほうがもっとスッキリ見えることに気づき反省。

