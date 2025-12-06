---
title: Anacondaはシステム環境変数の設定方法が異なるらしい
slug: anaconda-seems-different-way-setting-system
date: 2023-04-01
modified_time: 2023-04-01
description: Anacondaとcmdでは環境変数の設定方法が異なるという発見についての備忘録。
icon: 🐍
icon_url: /icons/snake_flat.svg
tags:
  - Anaconda
---
## 目的

皆様の時間を奪わないようにする。

## 経緯

discord.pyでシステム環境変数にDISCORD_BOT_TOKENとしてTOKENを設定したが、なぜかエラーになる。

調べたところ、Anacondaとcmdでは環境変数の設定が異なることを知った。

## 該当のソース(一部抜粋)

``` python
import osZ
import discord

## Bot のアクセストークン
DISCORD_BOT_TOKEN = os.environ.get("DISCORD_BOT_TOKEN")
```

システム環境変数にはTOKENの値が設定してある状態で、エラーが発生した。

## 解決法

🤔「せや！Chat GPTに聞いたろ！」

```bash
Anacondaを使用している場合、環境変数を設定する方法が異なります。次の手順に従って、Anaconda環境に環境変数を設定してください。
まず、Anaconda Promptを開きます。
現在の環境に環境変数を追加するには、次のコマンドを実行します
(your_tokenを実際のDiscord Botトークンに置き換えてください):

conda env config vars set DISCORD_BOT_TOKEN=your_token

環境変数が設定されたことを確認するには、次のコマンドを実行してください:

conda env config vars list

設定が完了したら、環境を再アクティブ化する必要があります。
次のコマンドを実行してください(your_env_nameを実際の環境名に置き換えてください):

conda activate your_env_name

これで、Anaconda環境に環境変数が設定され、Pythonスクリプトからアクセスできるようになります。
環境変数が正しく設定されているかどうかをテストするには、次のPythonコードを実行してください:

import os

discord_bot_token = os.environ.get("DISCORD_BOT_TOKEN")
print(f"Discord Bot Token: {discord_bot_token}")

これにより、設定した環境変数の値が表示されます。

```

## 実行結果

``` python
python source.py

>>> Discord Bot Token: 設定したトークン
```

