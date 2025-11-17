---
title: 初めての実行計画と「ANALYZE」で統計情報の再計算を行う
slug: first-execution-plan-recalculating-statistics-analyze
date: 2024-11-30
description:
icon: 🧹
icon_url:
tags:
  - postgresql
  - データベース
---

# はじめに

わたし「なんかデータ量同じなのに検証環境だとタイムアウトするんだけど。。。」
同僚　「実行計画バグってるんじゃないですかね？」
わたし「実行計画とは?🤔」

# 概要

開発環境で正常に動作していたSQLが、検証環境でタイムアウトする問題に直面しました。
本記事では、`EXPLAIN ANALYZE`を用いて問題のあるSQLを改善し、統計情報のリセットによる実行計画の変化を観察します。

使用したSQLやDBの環境構築に使用したDockerfileはこちらです。
https://github.com/Suntory-Y-Water/explain-analyze-lesson

# 環境構築
## 前提

DBはDockerで構築して、SQLはA5M2から実行します。

## テーブルの作成

以下のSQLで必要なテーブルを作成します。

```sql
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS followers CASCADE;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(post_id),
    user_id INT REFERENCES users(user_id),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE likes (
    like_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    post_id INT, 
    comment_id INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE followers (
    follower_id INT REFERENCES users(user_id),
    followee_id INT REFERENCES users(user_id),
    followed_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, followee_id)
);
```

## データの挿入

以下のSQLを使用して、大量のテストデータを挿入します。

```sql
INSERT INTO users (username, email)
SELECT
    'User' || i,
    'user' || i || '@example.com'
FROM generate_series(1, 1000000) AS s(i);

INSERT INTO posts (user_id, content, created_at)
SELECT
    (RANDOM() * 999999 + 1)::INT,
    'Post content ' || i,
    NOW() - (RANDOM() * INTERVAL '365 days')
FROM generate_series(1, 5000000) AS s(i);

INSERT INTO comments (post_id, user_id, content, created_at)
SELECT
    (RANDOM() * 4999999 + 1)::INT,
    (RANDOM() * 999999 + 1)::INT,
    'Comment content ' || i,
    NOW() - (RANDOM() * INTERVAL '365 days')
FROM generate_series(1, 1000000) AS s(i);

INSERT INTO likes (user_id, post_id, comment_id, created_at)
SELECT
    (RANDOM() * 999999 + 1)::INT,
    CASE WHEN RANDOM() < 0.5 THEN (RANDOM() * 4999999 + 1)::INT ELSE NULL END,
    CASE WHEN RANDOM() >= 0.5 THEN (RANDOM() * 9999999 + 1)::INT ELSE NULL END,
    NOW() - (RANDOM() * INTERVAL '365 days')
FROM generate_series(1, 1000000) AS s(i);

INSERT INTO followers (follower_id, followee_id, followed_at)
SELECT
    follower_id,
    followee_id,
    followed_at
FROM (
    SELECT
        (RANDOM() * 999999 + 1)::INT AS follower_id,
        (RANDOM() * 999999 + 1)::INT AS followee_id,
        NOW() - (RANDOM() * INTERVAL '365 days') AS followed_at
    FROM generate_series(1, 1000000) AS s(i)
) sub
WHERE follower_id <> followee_id;

INSERT INTO followers (follower_id, followee_id, followed_at)
SELECT
    1 AS follower_id,
    followee_id,
    NOW() - (RANDOM() * INTERVAL '365 days') AS followed_at
FROM generate_series(2, 101) AS s(followee_id);
```

# SQLの実行

## 複雑なクエリの作成

以下のクエリは、特定のユーザーがフォローしているユーザーの投稿を取得し、その投稿へのコメント数と最新のコメント内容を取得します。

```sql
SELECT
    p.post_id
    , p.content AS post_content
    , p.created_at AS post_created_at
    , u.username AS post_user
    , count(c.comment_id) AS comment_count
    , max(c.created_at) AS last_comment_at
    , string_agg(c2.content, '; ') AS recent_comments 
FROM
    posts p 
    JOIN users u 
        ON p.user_id = u.user_id 
    LEFT JOIN comments c 
        ON p.post_id = c.post_id 
    LEFT JOIN LATERAL ( 
        SELECT
            content 
        FROM
            comments 
        WHERE
            post_id = p.post_id 
        ORDER BY
            created_at DESC 
        LIMIT
            5
    ) c2 
        ON TRUE 
WHERE
    p.user_id IN ( 
        SELECT
            followee_id 
        FROM
            followers 
        WHERE
            follower_id = 1
    ) 
GROUP BY
    p.post_id
    , p.content
    , p.created_at
    , u.username 
ORDER BY
    p.created_at DESC 
LIMIT
    100;

```

実行すると`canceling statement due to statement timeout`でタイムアウトします(タイムアウト値はデフォルトの30秒)。
一度タイムアウト値を180秒に設定してからSQLの先頭に`EXPLAIN ANALYZE`をつけて統計情報を確認します。

実行したところ、結果が帰ってきました。

```markdown
localhost/postgres(postgres) : 2024/11/27 7:36:05	
EXPLAIN ANALYZE SELECT p.post_id, p.content AS post_content, p.created_at AS post_created_at, u.username AS post_user, count(c.comment_id) AS comment_count, max(c.created_at) AS last_comment_at, string_agg(c2.content, '; ') AS recent_comments FROM posts p JOIN users u ON p.user_id = u.user_id LEFT JOIN comments c ON p.post_id = c.post_id LEFT JOIN LATERAL (SELECT content FROM comments WHERE post_id = p.post_id ORDER BY created_at DESC LIMIT 5) c2 ON TRUE WHERE p.user_id IN (SELECT followee_id FROM followers WHERE follower_id = 1) GROUP BY p.post_id, p.content, p.created_at, u.username ORDER BY p.created_at DESC LIMIT 100	
	QUERY PLAN
	Limit  (cost=1841963.47..1841963.49 rows=10 width=90) (actual time=102536.524..102542.083 rows=100 loops=1)
	  ->  Sort  (cost=1841963.47..1841963.49 rows=10 width=90) (actual time=102254.801..102260.352 rows=100 loops=1)
	        Sort Key: p.created_at DESC
	        Sort Method: top-N heapsort  Memory: 45kB
	        ->  GroupAggregate  (cost=385906.22..1841963.30 rows=10 width=90) (actual time=3514.835..102233.609 rows=491 loops=1)
	              Group Key: p.post_id, u.username
	              ->  Nested Loop Left Join  (cost=385906.22..1841963.05 rows=10 width=76) (actual time=2519.270..102226.320 rows=530 loops=1)
	                    ->  Gather Merge  (cost=224122.28..224123.45 rows=10 width=54) (actual time=1155.997..1197.298 rows=504 loops=1)
	                          Workers Planned: 2
	                          Workers Launched: 2
	                          ->  Sort  (cost=223122.26..223122.27 rows=4 width=54) (actual time=1092.626..1094.420 rows=168 loops=3)
	                                Sort Key: p.post_id, u.username
	                                Sort Method: quicksort  Memory: 52kB
	                                Worker 0:  Sort Method: quicksort  Memory: 27kB
	                                Worker 1:  Sort Method: quicksort  Memory: 27kB
	                                ->  Parallel Hash Right Join  (cost=67975.83..223122.22 rows=4 width=54) (actual time=534.030..1093.363 rows=168 loops=3)
	                                      Hash Cond: (c.post_id = p.post_id)
	                                      ->  Parallel Seq Scan on comments c  (cost=0.00..153614.64 rows=408464 width=16) (actual time=64.734..607.835 rows=333333 loops=3)
	                                      ->  Parallel Hash  (cost=67975.78..67975.78 rows=4 width=42) (actual time=467.235..467.537 rows=164 loops=3)
	                                            Buckets: 1024  Batches: 1  Memory Usage: 104kB
	                                            ->  Nested Loop  (cost=4.91..67975.78 rows=4 width=42) (actual time=88.866..467.139 rows=164 loops=3)
	                                                  ->  Hash Join  (cost=4.48..67973.52 rows=5 width=40) (actual time=88.834..466.268 rows=164 loops=3)
	                                                        Hash Cond: (p.user_id = followers.followee_id)
	                                                        ->  Parallel Seq Scan on posts p  (cost=0.00..62500.27 rows=2083327 width=36) (actual time=0.299..309.065 rows=1666667 loops=3)
	                                                        ->  Hash  (cost=4.46..4.46 rows=2 width=4) (actual time=82.471..82.622 rows=100 loops=3)
	                                                              Buckets: 1024  Batches: 1  Memory Usage: 12kB
	                                                              ->  Index Only Scan using followers_pkey on followers  (cost=0.42..4.46 rows=2 width=4) (actual time=82.439..82.484 rows=100 loops=3)
	                                                                    Index Cond: (follower_id = 1)
	                                                                    Heap Fetches: 300
	                                                  ->  Index Scan using users_pkey on users u  (cost=0.42..0.45 rows=1 width=14) (actual time=0.003..0.003 rows=1 loops=491)
	                                                        Index Cond: (user_id = p.user_id)
	                    ->  Limit  (cost=161783.93..161783.94 rows=1 width=30) (actual time=200.448..200.449 rows=0 loops=504)
	                          ->  Sort  (cost=161783.93..161783.94 rows=1 width=30) (actual time=200.444..200.444 rows=0 loops=504)
	                                Sort Key: comments.created_at DESC
	                                Sort Method: quicksort  Memory: 25kB
	                                ->  Seq Scan on comments  (cost=0.00..161783.92 rows=1 width=30) (actual time=169.057..200.429 rows=0 loops=504)
	                                      Filter: (post_id = p.post_id)
	                                      Rows Removed by Filter: 1000000
	Planning Time: 13.469 ms
	JIT:
	  Functions: 86
	  Options: Inlining true, Optimization true, Expressions true, Deforming true
	  Timing: Generation 33.890 ms (Deform 10.041 ms), Inlining 143.586 ms, Optimization 217.420 ms, Emission 168.302 ms, Total 563.198 ms
	Execution Time: 102593.468 ms
```

ボトルネックとなっているのは、`comments` テーブルに対する効率的でないアクセス方法です。
特に、各投稿に対してコメントを取得する部分で、`comments` テーブル全体をシーケンシャルスキャンしており、これが大幅なパフォーマンス低下を引き起こしています。

実行計画の以下の部分が問題を示しています。

```markdown
->  Seq Scan on comments  (cost=0.00..161783.92 rows=1 width=30) (actual time=169.057..200.429 rows=0 loops=504)
      Filter: (post_id = p.post_id)
      Rows Removed by Filter: 1000000
```

この部分では、`post_id = p.post_id` のフィルタリングにもかかわらず、`comments` テーブル全体をスキャンしています。

これは、`post_id` に対する適切なインデックスがないためです。

## 改善案

### インデックスの追加

`comments` テーブルに以下のインデックスを追加します：

```sql
CREATE INDEX idx_comments_post_id_created_at ON comments(post_id, created_at DESC);
```

これにより、`post_id` でのフィルタリングと `created_at` でのソートが効率的になります。

### クエリの書き換え

LATERAL JOIN を使用せず、サブクエリで必要なコメント情報を事前に集計します。

```sql
WITH recent_comments AS ( 
    SELECT
        c.post_id
        , count(c.comment_id) AS comment_count
        , max(c.created_at) AS last_comment_at
        , string_agg(c.content, '; ' ORDER BY c.created_at DESC) AS recent_comments 
    FROM
        ( 
            SELECT
                c1.post_id
                , c1.content
                , c1.created_at
                , c1.comment_id
                , row_number() OVER ( 
                    PARTITION BY
                        c1.post_id 
                    ORDER BY
                        c1.created_at DESC
                ) AS rn 
            FROM
                comments c1
        ) c 
    WHERE
        c.rn <= 5 
    GROUP BY
        c.post_id
) 
SELECT
    p.post_id
    , p.content AS post_content
    , p.created_at AS post_created_at
    , u.username AS post_user
    , rc.comment_count
    , rc.last_comment_at
    , rc.recent_comments 
FROM
    posts p 
    JOIN users u 
        ON p.user_id = u.user_id 
    LEFT JOIN recent_comments rc 
        ON p.post_id = rc.post_id 
WHERE
    p.user_id IN ( 
        SELECT
            followee_id 
        FROM
            followers 
        WHERE
            follower_id = 1
    ) 
ORDER BY
    p.created_at DESC 
LIMIT
    100;
```

## 改善後

修正後のSQLでは約2.5秒で結果が返却され、かなりの速度改善が見られました！
再度実行計画を確認していきます。

```markdown
QUERY PLAN
Limit  (cost=444037.73..444037.98 rows=100 width=90) (actual time=2323.031..2323.121 rows=100 loops=1)
  ->  Sort  (cost=444037.73..444041.07 rows=1335 width=90) (actual time=2306.779..2306.864 rows=100 loops=1)
        Sort Key: p.created_at DESC
        Sort Method: top-N heapsort  Memory: 38kB
        ->  Merge Left Join  (cost=383387.55..443986.70 rows=1335 width=90) (actual time=1694.586..2304.951 rows=491 loops=1)
              Merge Cond: (p.post_id = c1.post_id)
              ->  Sort  (cost=69508.71..69512.05 rows=1335 width=42) (actual time=400.583..400.708 rows=491 loops=1)
                    Sort Key: p.post_id
                    Sort Method: quicksort  Memory: 54kB
                    ->  Gather  (cost=1020.86..69439.41 rows=1335 width=42) (actual time=7.216..400.504 rows=491 loops=1)
                          Workers Planned: 2
                          Workers Launched: 2
                          ->  Nested Loop  (cost=20.86..68305.91 rows=556 width=42) (actual time=9.414..348.330 rows=164 loops=3)
                                ->  Hash Join  (cost=20.44..67989.39 rows=700 width=40) (actual time=9.384..347.523 rows=164 loops=3)
                                      Hash Cond: (p.user_id = followers.followee_id)
                                      ->  Parallel Seq Scan on posts p  (cost=0.00..62500.20 rows=2083320 width=36) (actual time=0.320..263.575 rows=1666667 loops=3)
                                      ->  Hash  (cost=17.10..17.10 rows=267 width=4) (actual time=4.005..4.006 rows=100 loops=3)
                                            Buckets: 1024  Batches: 1  Memory Usage: 12kB
                                            ->  Index Only Scan using followers_pkey on followers  (cost=0.42..17.10 rows=267 width=4) (actual time=3.885..3.898 rows=100 loops=3)
                                                  Index Cond: (follower_id = 1)
                                                  Heap Fetches: 300
                                ->  Index Scan using users_pkey on users u  (cost=0.42..0.45 rows=1 width=14) (actual time=0.003..0.003 rows=1 loops=491)
                                      Index Cond: (user_id = p.user_id)
              ->  GroupAggregate  (cost=313878.84..364173.98 rows=823611 width=52) (actual time=1292.831..1876.483 rows=902659 loops=1)
                    Group Key: c1.post_id
                    ->  WindowAgg  (cost=313878.84..333878.84 rows=1000000 width=46) (actual time=1292.367..1614.675 rows=995551 loops=1)
                          Run Condition: (row_number() OVER (?) <= 5)
                          ->  Sort  (cost=313878.84..316378.84 rows=1000000 width=38) (actual time=1292.320..1355.512 rows=995551 loops=1)
                                Sort Key: c1.post_id, c1.created_at DESC
                                Sort Method: external merge  Disk: 52872kB
                                ->  Seq Scan on comments c1  (cost=0.00..159530.00 rows=1000000 width=38) (actual time=110.023..981.282 rows=1000000 loops=1)
Planning Time: 1.231 ms
JIT:
  Functions: 64
  Options: Inlining false, Optimization false, Expressions true, Deforming true
  Timing: Generation 2.372 ms (Deform 0.757 ms), Inlining 0.000 ms, Optimization 0.965 ms, Emission 27.017 ms, Total 30.353 ms
Execution Time: 2329.379 ms
```

## 実行計画の解析

### 主なボトルネックの特定

- `Seq Scan on comments c1` が発生し、`comments`テーブル全体（1,000,000行）を読み込んでいます。
- `WindowAgg`（ウィンドウ関数）と`Sort`処理で時間がかかっています。

### 改善案

`comments`テーブルの処理を、対象の`post_id`に限定することで、不要なデータの読み込みを避けます。
ウィンドウ関数は全行を処理するため、大量のデータがある場合パフォーマンスに影響します。代わりに`LATERAL`を活用します。

```sql
WITH relevant_posts AS ( 
    SELECT
        p.post_id
        , p.content AS post_content
        , p.created_at AS post_created_at
        , u.username AS post_user 
    FROM
        posts p 
        JOIN users u 
            ON p.user_id = u.user_id 
    WHERE
        p.user_id IN ( 
            SELECT
                followee_id 
            FROM
                followers 
            WHERE
                follower_id = 1
        ) 
    ORDER BY
        p.created_at DESC 
    LIMIT
        100
) 
SELECT
    rp.post_id
    , rp.post_content
    , rp.post_created_at
    , rp.post_user
    , count(c.comment_id) AS comment_count
    , max(c.created_at) AS last_comment_at
    , string_agg(c_recent.content, '; ') AS recent_comments 
FROM
    relevant_posts rp 
    LEFT JOIN comments c 
        ON rp.post_id = c.post_id 
    LEFT JOIN LATERAL ( 
        SELECT
            content 
        FROM
            comments 
        WHERE
            post_id = rp.post_id 
        ORDER BY
            created_at DESC 
        LIMIT
            5
    ) c_recent 
        ON TRUE 
GROUP BY
    rp.post_id
    , rp.post_content
    , rp.post_created_at
    , rp.post_user 
ORDER BY
    rp.post_created_at DESC;
```

クエリで頻繁に使用されるものに以下のインデックスを作成します。

```sql
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_posts_user_id_created_at ON posts(user_id, created_at DESC);
```

## 最終的な実行計画

統計情報更新後の実行計画です。
インデックスを貼り直したあとの実行計画を見ても、0.16秒程度で返却されることからかなりの速度改善ができました。

```markdown
QUERY PLAN
GroupAggregate  (cost=69345.07..71037.91 rows=100 width=90) (actual time=163.715..166.781 rows=100 loops=1)
  Group Key: p.created_at, p.post_id, p.content, u.username
  ->  Incremental Sort  (cost=69345.07..71034.55 rows=121 width=76) (actual time=163.708..166.737 rows=112 loops=1)
        Sort Key: p.created_at DESC, p.post_id, p.content, u.username
        Presorted Key: p.created_at
        Full-sort Groups: 4  Sort Method: quicksort  Average Memory: 27kB  Peak Memory: 27kB
        ->  Nested Loop Left Join  (cost=69328.04..71029.84 rows=121 width=76) (actual time=163.584..166.708 rows=112 loops=1)
              ->  Nested Loop Left Join  (cost=69327.61..70180.10 rows=121 width=54) (actual time=163.569..166.573 rows=104 loops=1)
                    ->  Limit  (cost=69327.18..69338.85 rows=100 width=42) (actual time=163.554..166.357 rows=100 loops=1)
                          ->  Gather Merge  (cost=69327.18..69456.92 rows=1112 width=42) (actual time=163.553..166.350 rows=100 loops=1)
                                Workers Planned: 2
                                Workers Launched: 2
                                ->  Sort  (cost=68327.16..68328.55 rows=556 width=42) (actual time=153.971..153.977 rows=78 loops=3)
                                      Sort Key: p.created_at DESC
                                      Sort Method: quicksort  Memory: 36kB
                                      Worker 0:  Sort Method: quicksort  Memory: 36kB
                                      Worker 1:  Sort Method: quicksort  Memory: 36kB
                                      ->  Nested Loop  (cost=20.86..68305.91 rows=556 width=42) (actual time=10.272..153.886 rows=164 loops=3)
                                            ->  Hash Join  (cost=20.44..67989.39 rows=700 width=40) (actual time=10.239..153.483 rows=164 loops=3)
                                                  Hash Cond: (p.user_id = followers.followee_id)
                                                  ->  Parallel Seq Scan on posts p  (cost=0.00..62500.20 rows=2083320 width=36) (actual time=0.192..79.988 rows=1666667 loops=3)
                                                  ->  Hash  (cost=17.10..17.10 rows=267 width=4) (actual time=0.038..0.039 rows=100 loops=3)
                                                        Buckets: 1024  Batches: 1  Memory Usage: 12kB
                                                        ->  Index Only Scan using followers_pkey on followers  (cost=0.42..17.10 rows=267 width=4) (actual time=0.019..0.029 rows=100 loops=3)
                                                              Index Cond: (follower_id = 1)
                                                              Heap Fetches: 300
                                            ->  Index Scan using users_pkey on users u  (cost=0.42..0.45 rows=1 width=14) (actual time=0.002..0.002 rows=1 loops=491)
                                                  Index Cond: (user_id = p.user_id)
                    ->  Index Scan using idx_comments_post_id_created_at on comments c  (cost=0.42..8.40 rows=1 width=16) (actual time=0.002..0.002 rows=0 loops=100)
                          Index Cond: (post_id = p.post_id)
              ->  Memoize  (cost=0.43..8.46 rows=1 width=22) (actual time=0.001..0.001 rows=0 loops=104)
                    Cache Key: p.post_id
                    Cache Mode: binary
                    Hits: 4  Misses: 100  Evictions: 0  Overflows: 0  Memory Usage: 8kB
                    ->  Subquery Scan on c_recent  (cost=0.42..8.45 rows=1 width=22) (actual time=0.001..0.001 rows=0 loops=100)
                          ->  Limit  (cost=0.42..8.44 rows=1 width=30) (actual time=0.001..0.001 rows=0 loops=100)
                                ->  Index Scan using idx_comments_post_id_created_at on comments  (cost=0.42..8.44 rows=1 width=30) (actual time=0.001..0.001 rows=0 loops=100)
                                      Index Cond: (post_id = p.post_id)
Planning Time: 0.426 ms
Execution Time: 166.835 ms
```

## 統計情報の更新

インデックスの作成や大量データ変更後は、統計情報を更新します。

```sql
ANALYZE;
```

## 再度実行計画の確認

修正したクエリを再実行し、`EXPLAIN ANALYZE`で実行計画を確認します。
統計情報を更新すると、一般的に以下のような効果が期待できます。

- `comments`テーブルへのアクセスが効率化される。
- 不要な全表スキャンや大規模なソートが回避される。
- 全体の実行時間がさらに短縮される。

```markdown
QUERY PLAN
GroupAggregate  (cost=41.06..194.78 rows=10 width=90) (actual time=0.756..1.019 rows=100 loops=1)
  Group Key: p.created_at, p.post_id, p.content, u.username
  ->  Incremental Sort  (cost=41.06..194.44 rows=12 width=76) (actual time=0.751..0.978 rows=112 loops=1)
        Sort Key: p.created_at DESC, p.post_id, p.content, u.username
        Presorted Key: p.created_at
        Full-sort Groups: 4  Sort Method: quicksort  Average Memory: 27kB  Peak Memory: 27kB
        ->  Nested Loop Left Join  (cost=24.05..193.97 rows=12 width=76) (actual time=0.615..0.953 rows=112 loops=1)
              ->  Nested Loop Left Join  (cost=23.62..107.74 rows=12 width=54) (actual time=0.611..0.827 rows=104 loops=1)
                    ->  Limit  (cost=23.19..23.22 rows=10 width=42) (actual time=0.605..0.614 rows=100 loops=1)
                          ->  Sort  (cost=23.19..23.22 rows=10 width=42) (actual time=0.604..0.609 rows=100 loops=1)
                                Sort Key: p.created_at DESC
                                Sort Method: top-N heapsort  Memory: 37kB
                                ->  Nested Loop  (cost=1.28..23.03 rows=10 width=42) (actual time=0.017..0.539 rows=491 loops=1)
                                      ->  Nested Loop  (cost=0.85..21.35 rows=2 width=18) (actual time=0.014..0.104 rows=100 loops=1)
                                            ->  Index Only Scan using followers_pkey on followers  (cost=0.42..4.46 rows=2 width=4) (actual time=0.008..0.013 rows=100 loops=1)
                                                  Index Cond: (follower_id = 1)
                                                  Heap Fetches: 0
                                            ->  Index Scan using users_pkey on users u  (cost=0.42..8.44 rows=1 width=14) (actual time=0.001..0.001 rows=1 loops=100)
                                                  Index Cond: (user_id = followers.followee_id)
                                      ->  Index Scan using idx_posts_user_id_created_at on posts p  (cost=0.43..0.78 rows=6 width=36) (actual time=0.001..0.004 rows=5 loops=100)
                                            Index Cond: (user_id = u.user_id)
                    ->  Index Scan using idx_comments_post_id_created_at on comments c  (cost=0.42..8.44 rows=1 width=16) (actual time=0.002..0.002 rows=0 loops=100)
                          Index Cond: (post_id = p.post_id)
              ->  Memoize  (cost=0.43..8.46 rows=1 width=22) (actual time=0.001..0.001 rows=0 loops=104)
                    Cache Key: p.post_id
                    Cache Mode: binary
                    Hits: 4  Misses: 100  Evictions: 0  Overflows: 0  Memory Usage: 8kB
                    ->  Subquery Scan on c_recent  (cost=0.42..8.45 rows=1 width=22) (actual time=0.001..0.001 rows=0 loops=100)
                          ->  Limit  (cost=0.42..8.44 rows=1 width=30) (actual time=0.001..0.001 rows=0 loops=100)
                                ->  Index Scan using idx_comments_post_id_created_at on comments  (cost=0.42..8.44 rows=1 width=30) (actual time=0.001..0.001 rows=0 loops=100)
                                      Index Cond: (post_id = p.post_id)
Planning Time: 0.539 ms
Execution Time: 1.224 ms
```
実行計画を確認してもかなり速度が改善されていますね！
秒数も0.0012秒になっています。

# そもそもANALYZEって？

ANALYZEコマンドは、データベース内のテーブルに関する統計情報を収集し、`pg_statistic`(システムカタログ)に保存します。この統計情報は、クエリプランナーが最適な実行計画を策定する際に利用され、クエリ性能の向上に寄与します。

https://www.postgresql.jp/docs/16/sql-analyze.html?utm_source=chatgpt.com

## 主な効果

### クエリ性能の向上
最新の統計情報に基づいてクエリプランナーが最適な実行計画を選択できるため、クエリの実行速度が改善されます。

### リソースの効率的な使用
適切な実行計画により、CPUやメモリなどのリソースを効果的に活用できます。

## 主な使用場面

- データ分布が変化した場合（例: 大量の挿入、更新、削除の後）。
- 特定のテーブルに対して統計情報を手動で更新したい場合。

# まとめ

サンプルテーブルを用いて解説を行いましたが、実務でも同様の方法でタイムアウトしていたクエリを数秒以内に返却されるよう改善できました。
「なんか遅いな」と思ったら、統計情報の見直しやインデックスの適用を検討してみると良いかもしれません。
データベースのパフォーマンスチューニングを始めてやりましたが、今まで2~3秒かかっていたSQLが爆速になるのは気持ちいいですよね！？

以上になります🙌