---
title: Seleniumが本当にバレバレなのか試してみた
slug: i-tried-see-if-selenium-really
date: 2023-08-12
description:
icon:
icon_url:
tags:
  - Python
  - Selenium
  - スクレイピング
---
# 目的

[以前こちらの記事](https://qiita.com/MOSO1409/items/f5eba26a1cd893626bc7)にてスクレイピングはすぐにバレることを知った
本当にそうなのか試してみたくなったので、実際に試してみた

# 確認手順

- 適当にWebページをつくる
- スクレイピングをして挙動を確認する

# 環境構築

なんでもいいんですが、試しにReactで環境構築します

```powershell
npx create-react-app check-scraping
cd check-scraping
code .
npm run start
```

プロジェクトを作成したら`App.js`を修正します

```jsx
import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    if (window.navigator.webdriver) {
      alert("Webdriverを検出しました");
    }
  }, []);

  return (
    <div className="App">
      <h1>WebDriver検出テスト</h1>
    </div>
  );
}

export default App;
```

# 実際にスクレイピングする

Anacondaに以前使っていたソースコードが残っていたのでそちらを利用します

```python
import time
from selenium import webdriver

driver = webdriver.Edge()

def main():
    driver.get(url="http://localhost:3000")
    time.sleep(3)
    driver.quit()

if __name__ == '__main__':
    main()
```

# 結果

ちゃんと検出してくれました

ふつーにスクレイピングしたら一瞬でバレますね
![a.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/7844a64e-993c-092f-0f52-14c2af45cf5d.png)

# おまけ

`--disable-blink-features=AutomationControlled`を追加することでwindow.navigator.webdriverプロパティを無効にすることができるそうですね。
知らなかったので補足しておきます。（使用時はサイトの利用規約を守ってください）

``` python 
import time
from selenium import webdriver

options = webdriver.EdgeOptions()
options.add_argument("--disable-blink-features=AutomationControlled")

driver = webdriver.Edge(options=options)

def main():
    driver.get(url="http://localhost:3000")
    time.sleep(3)
    driver.quit()

if __name__ == '__main__':
    main()
```

