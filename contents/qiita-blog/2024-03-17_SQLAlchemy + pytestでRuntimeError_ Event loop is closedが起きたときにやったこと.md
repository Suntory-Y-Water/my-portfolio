---
title: "SQLAlchemy + pytestでRuntimeError: Event loop is closedが起きたときにやったこと"
date: "2024-03-17"
description: ""
icon: ""
icon_url: ""
tags:
  - MySQL
  - sqlalchemy
  - Docker
  - pytest
  - FastAPI
slug: "66eca810de6f716fd0ec"
---
# はじめに

Docker + SQLAlchemy + pytest + MySQL + FastAPIでテストをしようとしたときに`RuntimeError: Event loop is closed`が発生したので、解決した方法を記載する

# 前提知識

本当はMySQLではなくSQLiteを使ってテストをしようとしたが、SQLiteがUPSERTに対応していなかったためMySQLで実施することにした

テストに使用するコードは以下の通りで、コメントアウトしている部分のテストを実行すると`RuntimeError: Event loop is closed`が発生する

```python
# db.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

ASYNC_DB_URL = "mysql+aiomysql://root@db:3306/db?charset=utf8"
ASYNC_TEST_DB_URL = "mysql+aiomysql://root@db:3306/test_db?charset=utf8"

async_engine = create_async_engine(ASYNC_DB_URL, echo=True)
async_test_engine = create_async_engine(ASYNC_TEST_DB_URL, echo=True)

async_session = sessionmaker(autocommit=False, autoflush=False, bind=async_engine, class_=AsyncSession)
async_test_session = sessionmaker(autocommit=False, autoflush=False, bind=async_test_engine, class_=AsyncSession)

Base = declarative_base()

async def get_db():
    async with async_session() as session:
        yield session

# テスト用のDI関数
async def get_test_db():
    async with async_test_session() as session:
        yield session

# test_main.py
import pytest
import pytest_asyncio
import starlette.status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from api.db import get_test_db, Base, ASYNC_TEST_DB_URL
from api.main import app

@pytest_asyncio.fixture(autouse=True)
async def setup_and_teardown():
    async with async_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    async def get_test_db_with_session():
        async with async_test_session() as session:
            yield session
    app.dependency_overrides[get_test_db] = get_test_db_with_session
    yield
    async with async_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.pop(get_test_db)
    await async_test_engine.dispose()

@pytest_asyncio.fixture
async def async_client() -> AsyncClient:
    # テスト用に非同期HTTPクライアントを返却
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.mark.asyncio
async def test_create_tags(async_client: AsyncClient):
    # タグの作成
    tags = [{"tag_id": "Python"}, {"tag_id": "FastAPI"}]
    response = await async_client.post("/api/tags", json={"tags": tags})
    assert response.status_code == starlette.status.HTTP_201_CREATED

# @pytest.mark.asyncio
# async def test_read_tags(async_client: AsyncClient):
#     response = await async_client.get("/api/tag")
#     assert response.status_code == starlette.status.HTTP_200_OK
#     data = response.json()
#     assert len(data["tags"]) == 2
#     assert {"tag_id": "Python"} in data["tags"]
#     assert {"tag_id": "FastAPI"} in data["tags"]
```

# 原因

問題の発端は、非同期テストの実行後にSQLAlchemyの非同期セッションが適切に閉じられていないことだった。

具体的には、テスト実行後にガーベージコレクタが未返却の非同期接続をクリーンアップしようとした際に、エラーが発生した。

# 解決策

DI関数内でセッションを明示的に閉じることで、セッションのライフサイクルを管理した

``` python
# db.py
async def get_test_db():
    async with async_test_session() as session:
        try:
            yield session
        finally:
            await session.close()

# test_main.py
import pytest
import pytest_asyncio
import starlette.status
from httpx import AsyncClient
from api.db import get_db, get_test_db, Base, async_test_engine
from api.main import app

@pytest_asyncio.fixture(autouse=True)
async def setup_and_teardown():
    app.dependency_overrides[get_db] = get_test_db
    async with async_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with async_test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    app.dependency_overrides.clear()
    await async_test_engine.dispose()
```

