---
title: Postman localhostにリクエストが送信できない
slug: postman-unable-send-request-localhost
date: 2023-08-27
modified_time: 2023-08-27
description: Postmanでlocalhostにリクエストを送信できない問題の解決方法。
icon: 📮
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Postbox/Flat/postbox_flat.svg
tags:
  - API
  - Postman
---
## 経緯
[こちらの記事](https://qiita.com/KNR109/items/7e094dba6bcf37ed73cf#openapi%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)でSwaggerとOpenAPIの勉強をしているときに発生した備忘録です。

`http://localhost:3001/users`にPostmanからリクエストを送信してもエラーになってしまう。

> [!INFO]
> Could not send request
> Cloud Agent Error: Can not send requests to localhost. Select a different agent.
>
> リクエストを送信できませんでした
> クラウドエージェントエラー： localhost にリクエストを送信できません。別のエージェントを選択してください。

🤔「エージェントって誰だよ」

## 解決策

画面下部の「Auto-select-agent」を選択して「Desktop-agent」を選択すると解決できる。
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/b5a00484-356e-6bf7-fe97-de4b51784037.png)
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/46652c3a-2ba2-1088-5fce-0f88c1398a82.png)
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3351724/9af5cf6f-ad74-3117-e979-a6ac5f2f3fc7.png)

