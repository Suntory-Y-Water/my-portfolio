---
title: Django テンプレートタグに空白を入れると認識してくれません
slug: django-template-tags-not-recognized-if
date: 2023-02-15
description: Djangoテンプレートタグで空白を入れると認識されない問題についての備忘録。
icon: 🌐
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Globe%20with%20meridians/Flat/globe_with_meridians_flat.svg
tags:
  - Python
  - HTML
  - Django
---
# 目的

こんなことで時間を使わないようにしましょう。という意味合いで投稿します。
この投稿の内容は **Djangoのツボとコツがゼッタイにわかる本［第2版］** を元に作成しています。

# 画面遷移がうまくいかない

本書では本棚アプリ作成することを目標としています。
個別に用意された本のページから一覧、編集、削除画面へ遷移することができる。

**全体**
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/26fc67c7-d14a-37ed-29cc-15683618c83a.png)

**個別ページの例**
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/cd1e6735-d839-b0ec-4408-1c91820bf5d1.png)

個別ページにて各ボタンを押下してもPage not found (404)が発生

``` console
Page not found (404)
Request Method:	GET
Request URL:	http://127.0.0.1:8000/book/1/detail/%7B%25%20url%20'delete-book'%20object.pk%20%25%20%7D
Using the URLconf defined in bookproject.urls, Django tried these URL patterns, in this order:

admin/
book/ [name='list-book']
book/<int:pk>/detail/ [name='detail-book']
book/create/ [name='create-book']
book/<int:pk>/delete/ [name='delete-book']
book/<int:pk>/update/ [name='update-book']
The current path, book/1/detail/{% url 'delete-book' object.pk % }, didn’t match any of these.

You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard 404 page.
```

要するにページが見つからんと怒られてしまった。

# コードを見てみる

スペルミスはパッと見ないと思ったのが、もう一度書いたコードを確認してみる。

``` html book_detail.html
{% extends 'base.html'%}

{% block title %} {{object.title}} {% endblock %}

{% block h1 %} 書籍詳細 {% endblock %}

{% block content %}
  <div class="p-4 m-4 bg-light border border-success rounded">
    <h2 class="text-success">{{object.title}}</h2>
    <p>{{ object.text }}</p>
    <a href="{% url 'list-book' %}" class="btn btn-primary">一覧へ</a>
    <a href="{% url 'update-book' object.pk % }" class="btn btn-primary">編集する</a>
    <a href="{% url 'delete-book' object.pk % }" class="btn btn-primary">削除する</a>
    <h6 class="card-title"> {{object.category}} </h6>
  </div>
{% endblock content %}
```

恐らく合っている…
そこで今まで忘れていて入れてこなかった拡張機能を追加して確認してみる。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/0369da4b-1635-8b7c-5daa-ab0a8ed70778.png)

🤔「なんでhrefの部分、色が違うんや...」
🤔「他の人が書いたコードを見てみよう」
🤔「！！」

# 解決

どうやら **{% xxx %}** のようなテンプレートタグは空白が入っていると認識してくれていないことが原因でした。

**誤：{% xxx % }**
**正：{% xxx %}**

