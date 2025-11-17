---
title: "【FastAPI】idをuuidで設定するときは型定義に気をつけたい"
date: "2024-01-21"
description: ""
icon: ""
icon_url: ""
tags:
  - Python
  - FastAPI
slug: "1247a6fd5220684abf39"
---
# 概要

FastAPIで遊んでいたときDBから情報を取得できなくなってしまったので、内容を共有しておきたい。
原因を明確にできてはいないが、対応策はあるためご容赦いただきたい。

# 流れ

APIを作成しているとき、ブログのid(uuid)をエンドポイントにしている。

```python
# router/blog.py
@router.get("/blog/{blog_id}", response_model=schema.Blog)
async def read_blog(blog_id: UUID, db: AsyncSession = Depends(get_db)):
    """個別のブログを取得する"""
    blog = await blog_crud.get_blog_by_id(db, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog
```

`read_blog`ではUUIDを受け取っている。
受け取ったUUIDをもとにデータベースへ検索をかけている

```text
mysql> select * from blog;
+--------------------------------------+-------+---------+---------------------+
| id                                   | title | content | createdAt           |
+--------------------------------------+-------+---------+---------------------+
| 51048962-e046-4626-88a7-4d936c381e62 | fuga  | ??????  | 2024-01-21 09:02:21 |
| ecde0849-980a-4932-a9ef-52443ad7a740 | piyo  | ??????  | 2024-01-21 09:02:26 |
+--------------------------------------+-------+---------+---------------------+
```

```python
# cruds/blog.py
async def get_blog_by_id(db: AsyncSession, blog_id: UUID) -> blog_model.Blog | None:
    """ブログを取得する。"""
    result: Result = await db.execute(select(blog_model.Blog).filter(blog_model.Blog.id == blog_id))
    return result.scalars().first()
```

個別のエンドポイントへアクセスしても、データベースに登録されているid(UUID)なのに情報を取得できなくなってしまった🤔
全件の場合は正しく取得できている。

```json
[
  {
    "title": "fuga",
    "content": "ブログの内容",
    "id": "51048962-e046-4626-88a7-4d936c381e62",
    "createdAt": "2024-01-21T09:02:21"
  },
  {
    "title": "piyo",
    "content": "ブログの内容",
    "id": "ecde0849-980a-4932-a9ef-52443ad7a740",
    "createdAt": "2024-01-21T09:02:26"
  }
]
```

ログをよく見ると出力されたSQLクエリのパラメータで、UUIDがハイフンなしの形式で表示されている。

```bash
2024-01-21 09:22:14 fast-api-1  | 2024-01-21 09:22:14,750 INFO sqlalchemy.engine.Engine [generated in 0.00016s] ('ecde0849980a4932a9ef52443ad7a740',)
2024-01-21 09:22:14 fast-api-1  | 2024-01-21 09:22:14,751 INFO sqlalchemy.engine.Engine ROLLBACK
2024-01-21 09:22:14 fast-api-1  | INFO:     192.168.32.1:47126 - "GET /blog/ecde0849-980a-4932-a9ef-52443ad7a740 HTTP/1.1" 404 Not Found
```

# 解決策

`read_blog`の型を`UUID`ではなく`str`で受け取れば解決する。

```python
@router.get("/blog/{blog_id}", response_model=schema.Blog)
async def read_blog(blog_id: str, db: AsyncSession = Depends(get_db)):
    """
    個別のブログを取得する
    """
    blog = await blog_crud.get_blog_by_id(db, blog_id)
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

async def get_blog_by_id(db: AsyncSession, blog_id: str) -> blog_model.Blog | None:
    """ブログを取得する。"""
    result: Result = await db.execute(select(blog_model.Blog).filter(blog_model.Blog.id == blog_id))
    return result.scalars().first()
```

