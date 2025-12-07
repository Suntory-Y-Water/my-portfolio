---
title: セブンイレブンで最適な食品を線形計画法を用いて決めたい
slug: i-want-use-linear-programming-determine
date: 2021-12-11
modified_time: 2021-12-11
description: 線形計画法を用いてセブンイレブンの食品から栄養バランスと価格を最適化した食事を選択。PuLPライブラリを使用してPFCバランスと価格を考慮した最適解を計算した実験記録。
icon: 🧮
icon_url: /icons/abacus_flat.svg
tags:
  - Python
  - 線形計画法
---
## 背景

基本情報技術者試験に合格後、新しく勉強する内容を決めたいと思い大学時代に1mmだけ触れたpythonの勉強を始めた。

そこでQiitaのpython関連の情報を調べていると気になる投稿を発見。

>[マクドナルドで一日分の栄養を取れる組み合わせを計算したら衝撃の結果に](https://qiita.com/takobaya391076/items/49b15c1fa36734b3fa53)

こちらの投稿内容が衝撃的でとても面白かったことと、全人類が好きであろうコンビニ大手の**セブンイレブン**の商品で試してみたら面白そうと思い勉強を始めてみた。

~~(セブンイレブン以外のコンビニが詳細な栄養価を載せていなかったため他のコンビニでは諦めました)~~

## 目的

セブンイレブンの食品から線形計画法を用いて一日の最適な食品を選ぶ。

## 流れ

セブンイレブンの商品をスクレイピングし
**商品名	価格(円)	熱量(kcal)	たんぱく質(g)	脂質(g)	炭水化物(g)	糖質(g)	食物繊維(g)	食塩相当量(g)** を商品別に抽出する。

得られたデータから線形計画法を用いて、各条件に沿った最適な食品を選ぶ。

## 最適な食品の定義

普段利用することが多いコンビニエンスストアの食品だが、好きなものばかり食べていると栄養バランスが偏ってしまうことや、お財布に優しくない可能性も発生する。

本投稿での最適な食品とは

- PFCバランスが整っている
- 金額は極力抑える

上記の2点に着目して進めていく。

また筆者自身が**筋肉をつけたい**といった野望もあるので、無駄なカロリーをできる限り抑えたいことから、

- たんぱく質は基準値より多めでもよい
- 脂質、炭水化物(糖質)はできる限り抑える

これら2点も今回の計算における最適な食品の定義として進めていく。

## 線形計画法とは

> 線型計画法(せんけいけいかくほう、LP; linear programming)は、数理計画法において、いくつかの1次不等式および1次等式を満たす変数の値の中で、ある1次式を最大化または最小化する値を求める方法である。線形計画法の対象となる最適化問題を線型計画問題という。(Wikipediaより引用)

数学を数学Ⅱで置いてきた身なので正直何を言っているか分かりませんが、与えられた条件に対して最大値または最小値を得るといった感じだと思っています。

## 参考にさせていただいたリンク先

>[学食で何を食べるか線形計画法で決めたい！！！](https://qiita.com/Kintetsu_Pearls/items/128c8822df5327364a1c)

>[完全栄養マクドナルド食の線型計画による実装～もしマクドナルドだけで生活すると栄養バランスはどうなるのか？～](https://qiita.com/youwht/items/9098d560f28d16aa5567)

コードもほとんどお借りしました。

### PuLPをインストールする

Pythonで線形計画法を行うには、PuLPライブラリを使用している内容がほとんどだったのでインストールしていきます。

本投稿は`jupyter lab`で動かしていきました。

```python
pip install pulp
```

インストールしたPuLPとCSVをimportします。

```python
import csv
import pulp
```

### 商品情報の読み込み

本来スクレイピングした部分のコードも掲載したいところだが、投稿内容が長くなってしまうことや、とても汚いコードだと自覚しているので省略します。

```python
## CSVをダウンロードする
with open("./result.csv") as f:
    reader = csv.reader(f)
    l = [row for row in reader]

Products_Data = l[1:]

Products_Data = [[product, *map(float, data)] for product, *data in Products_Data]
```

### 前提条件の作成

前提条件として自身のスペックをもとに定義した。

- 身体活動レベル ふつう
- 男性 18~29歳
- 糖質は「炭水化物 - 食物繊維」の値
- 食塩相当量は未満にすべき値

これらの条件は下記のサイトから引用し、算出しました。

>[主な栄養素の一日あたりの食事摂取基準](https://www.otsuka.co.jp/cmt/nutrition/1day/)

価格に関しては一人暮らしの一ヶ月の食費を日数で割って計算した。

>[家計調査 / 家計収支編 単身世帯 詳細結果表](https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00200561&tstat=000000330001&cycle=7&year=20190&month=0&tclass1=000000330001&tclass2=000000330022&tclass3=000000330023&stat_infid=000031909805&result_back=1&tclass4val=0)

一ヶ月の食費目安は約47,000円なため一日平均約1,550円となるが、**できる限り美味しいものはいっぱい食べたいため**価格の上限を少し引き上げた。

また先述通り、たんぱく質の値は基準値より高めに設定しました(一般的に筋肉を大きくするためには体重×2gのたんぱく質が必要と言われているが、体重65kgの自分には食事のみで補うのはお腹が破裂するので90gとした)。

```python
one_da_nutrition_dict = {
    "価格(円)" : 1650.0,
    "熱量(kcal)" : 2650.0 ,
    "たんぱく質(g)" : 90.0 ,
    "脂質(g)" : 73.0 ,
    "炭水化物(g)" : 331.0 ,
    "糖質(g)" : 310.0 ,
    "食物繊維(g)" : 21.0 ,
    "食塩相当量(g)" : 7.5 ,
}

```

### 各商品情報に対応するリストを作成

各商品の情報を栄養価別に格納していきます。

```python
name,price,calorie,protein,fat,carbohydrates,sugar,dietary_Fiber,salt_equivalent = [],[],[],[],[],[],[],[],[]

eiyou_data = dict()

for row in Products_Data:
    name.append(row[0])
    price.append(row[1])
    calorie.append(row[2])
    protein.append(row[3])
    fat.append(row[4])
    carbohydrates.append(row[5])
    sugar.append(row[6])
    dietary_Fiber.append(row[7])
    salt_equivalent.append(row[8])
for row in Products_Data:
    eiyou_data[row[0]] = row[1:] 
```

### 問題の定義

線形計画法で解く問題を定義します。

線形計画法ではある目的関数に対してその値を大きくする、もしくは小さくすることを目的とするのでそのようにコードを書きます。

今回は最適な食品選ぶ観点から、価格を最小にすることが目的なので`Minimize`を選択し、最大化をする場合はコメントアウトしてある`Maxmize`を選択します。

```python
## 問題の定義
## 最小化か、最大化か、どちらかを指定
problem = pulp.LpProblem(name="セブンイレブン", sense=pulp.LpMinimize)
#problem = pulp.LpProblem(name="セブンイレブン", sense=pulp.LpMaximize)
```

### 変数の定義


`lowBound`は最小値、`upBound`は最大値を表しています。

最大値は入力しなくてもよいのですが、最初は適当に100と設定します。これによってどんなに良い商品があっても100個までしか選択できなくなります。

最小値は非負整数なので0とします。

```python
## 変数の定義
xs = [pulp.LpVariable(x, cat='Integer', lowBound=0, upBound=100) for x in name]
```

### 目的関数の定義

先述通り価格を最小化するため`price`を設定します。

```python
## 目的関数(最小or最大にすべき関数)
## 価格を最小化する
problem += pulp.lpDot(price, xs)
```

### 制約条件の定義

続いて制約条件を定義していきます。

無駄なカロリーを消費したくないため熱量、脂質、炭水化物、糖質、食塩相当量は以下に設定します。

```python
## 制約条件の定義
problem += pulp.lpDot(price, xs) >= one_da_nutrition_dict["価格(円)"]
problem += pulp.lpDot(calorie, xs) <= one_da_nutrition_dict["熱量(kcal)"]
problem += pulp.lpDot(protein, xs) >= one_da_nutrition_dict["たんぱく質(g)"]
problem += pulp.lpDot(fat, xs) <= one_da_nutrition_dict["脂質(g)"]
problem += pulp.lpDot(carbohydrates, xs) <= one_da_nutrition_dict["炭水化物(g)"]
problem += pulp.lpDot(sugar, xs) <= one_da_nutrition_dict["糖質(g)"]
problem += pulp.lpDot(dietary_Fiber, xs) >= one_da_nutrition_dict["食物繊維(g)"]
problem += pulp.lpDot(salt_equivalent, xs) <= one_da_nutrition_dict["食塩相当量(g)"]
```

### 問題を解いていただく

制約を書いたら問題を解いていただき、この時に問題が解けていた(最適解が得られていた)ら`Optimal`と出力されます。

```python
status = problem.solve()
print("Status", pulp.LpStatus[status])
## ※「Optimal」であることを確認すること。
```

### 結果を出力する

計算終了後、結果を出力していきます。

```python

## 各種値を初期化
price_lists,calorie_lists,protein_lists,fat_lists,carbohydrates_lists,sugar_lists,dietary_Fiber_lists,salt_equivalent_lists = 0,0,0,0,0,0,0,0

for i in range(len(name)):
    k = name[i]
    x = xs[i]
    price_lists += eiyou_data[k][0]*x.value()
    calorie_lists += eiyou_data[k][1]*x.value()
    protein_lists += eiyou_data[k][2]*x.value()
    fat_lists += eiyou_data[k][3]*x.value()
    carbohydrates_lists += eiyou_data[k][4]*x.value()
    sugar_lists += eiyou_data[k][5]*x.value()
    dietary_Fiber_lists += eiyou_data[k][6]*x.value()
    salt_equivalent_lists += eiyou_data[k][7]*x.value()
print("Result")
print("------------------------------------------------")

for x in xs:
    if x.value() != 0:
        print(str(x) + " × "+ str(int(x.value())))
print("------------------------------------------------")
print("価格 : "+str("{:.0f}".format(price_lists))+" 円")
print("熱量 : " + str("{:.1f}".format(calorie_lists))+" kcal")
print("たんぱく質 : "+str("{:.1f}".format(protein_lists))+" g")
print("脂質 : "+str("{:.1f}".format(fat_lists))+" g")
print("炭水化物 : "+str("{:.1f}".format(carbohydrates_lists))+" g")
print("糖質 : "+str("{:.1f}".format(sugar_lists))+" g")
print("食物繊維 : "+str("{:.1f}".format(dietary_Fiber_lists))+" g")
print("食塩相当量 : "+str("{:.1f}".format(salt_equivalent_lists))+" g")
print("------------------------------------------------")

```

## 結果

```python
Result
------------------------------------------------
７Ｐスティックメロンパン６本入 × 3
糖質を控えたミルククリームブレッド × 1
７プレミアムこうや豆腐 × 1
７プレミアムトッピング用温泉たまご × 1
７プレミアム彩り大根サラダ × 3
７プレミアム緑豆もやし × 13
ななから(むね) × 1
おでん味しみ牛すじ串 × 1
------------------------------------------------
価格 : 1650 円
熱量 : 2132.0 kcal
たんぱく質 : 90.8 g
脂質 : 71.3 g
炭水化物 : 311.5 g
糖質 : 248.8 g
食物繊維 : 28.9 g
食塩相当量 : 4.9 g
------------------------------------------------
```

数値だけ見ると中々理にかなった結果になりました。
しかし`７プレミアム緑豆もやし`は1袋250g入っているので、一日**3,250g**食べなければなりません。


<img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg"><img width="150" alt="代替テキスト" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/837411/ec92fcc6-6f38-cc10-c551-6506bfe4f83b.jpeg">

もやし好きでも飽きてしまう量なので、変数の最大値を2にして再計算します。

### 再計算 part.1

```python

Result
------------------------------------------------
糖質を控えたミルククリームブレッド × 2
７プレミアムデミグラスハンバーグ × 1
７プレミアム味付き半熟とろっとゆでたまご × 1
７プレミアム半熟煮たまご２個入 × 2
ツナと玉子のサラダ × 2
おでん味しみ絹厚揚げ × 2
おでんたこ串 × 1
------------------------------------------------
価格 : 1650 円
熱量 : 1258.0 kcal
たんぱく質 : 90.0 g
脂質 : 68.0 g
炭水化物 : 89.1 g
糖質 : 52.3 g
食物繊維 : 36.8 g
食塩相当量 : 6.6 g
------------------------------------------------

```

今度は`７プレミアム緑豆もやし × 13`ような結果には至りませんが、たまごが圧倒的な存在感を出しています。

しかしこれだけでは数値上では満たしても、主食が少なくてカロリーも低くすぎてお腹が減りそうな量ですね。

現在、カロリーを2,650以下に設定しているためかなり厳しい条件となっていますが、お腹が減ってしまうことから2,000カロリーは摂取したいので、

- `one_da_nutrition_dict`の`熱量(kcal)`を2,000に
- `熱量(kcal)`の変数を以下から以上に

これらの変更点を踏まえて再度実行していきます。

また計算中に **「一日の最適な食事をしたいのにアイスやスイーツを対象とするのはズレてね？」** と思い計算の対象外とすることにしました。

そして別問題かもしれませんが、菓子パンは気軽に食べれるのにも関わらず、栄養価がかなりお粗末だと感じたのでそれらもアイスと同様に独断と偏見で対象外とすることにしました。

またカロリー爆弾である **ドーナツ系統** も私怨ですが対象外としていきます(~~もうめちゃくちゃだとか言わない~~)。

### 再計算 part.2

```python
Result
------------------------------------------------
御飯 × 1
ブリトーチーズ２倍ハム＆５種チーズ × 1
お肉ぎっしり肉焼売 × 1
７プレミアムトッピング用温泉たまご × 1
７プレミアムコールスロー × 2
７プレミアム刻み白ねぎ × 1
７プレミアム緑豆もやし × 1
ななから(むね) × 2
カリッと揚げ餃子 × 1
フライドポテト × 1
ふわっふわ×濃厚ごまあんまん × 2
------------------------------------------------
価格 : 1650 円
熱量 : 2132.0 kcal
たんぱく質 : 92.4 g
脂質 : 72.0 g
炭水化物 : 291.8 g
糖質 : 267.6 g
食物繊維 : 21.6 g
食塩相当量 : 7.1 g
------------------------------------------------
```

だいぶそれっぽい値に近づいてきました。

明らかにトッピング用の刻みネギがあったり、1個単位で購入できる揚げ物で残りの栄養価を捲くっているように見受けられます。

そこで一個単位で購入できる揚げ物類(単価60円以下のもの)を削除して最後の計算を行います。

### 再計算 part.3

```python

Result
------------------------------------------------
御飯(大盛) × 2
たんぱく質が摂れるチキン＆エッグ × 2
７プレミアムピリ辛もつ煮込み × 1
７プレミアムトッピング用温泉たまご × 2
７プレミアム緑豆もやし × 2
ビッグアメリカンドッグ × 1
------------------------------------------------
価格 : 1650 円
熱量 : 2065.0 kcal
たんぱく質 : 103.6 g
脂質 : 61.0 g
炭水化物 : 297.8 g
糖質 : 249.6 g
食物繊維 : 38.3 g
食塩相当量 : 7.1 g
------------------------------------------------

```

すごい理想的な結果になってきました。

主食としても十分な食品が多数揃っており、日本人が不足しがちな食物繊維も基準値より高く他の数値も申し分ないです。

ツッコミどころがある方もいるかもしれませんが、これ以上計算を行っても近い結果しか得ることができないと判断し、今回はこちらの食品を本投稿の最適な食品としたいと思います。


## まとめ

お気づきの方もいるかもしれませんが、これらのデータでの線形最適化の場合ビタミンやらカルシウムやらの他の栄養素が反映されていないため、実際には**最適な食品**とは言えません。

データの範囲外のことは当然計算できないため、食品の見た目がかなり茶色くなってしまった。

実装前は最適な食品をすぐ求まると思っていたが、変数や制約条件によっては中々結びつかず、思った通りの結果を得ることはできなかったのがとても勉強になった。

今後近い内容の計算をする際は、十分なデータを入手できれば再現性が高い結果が得られるのではと感じました。

## 最後に

初投稿でよくわからんこと書いてるかもしれません。その場合はコメントにてお伝え下さい。

なお一度投稿しましたが計算をやり直すため削除しました。

今後の課題は投稿内容とは関係ないですが、基本的な文法を理解することだと思います(ほんとに大変だった)。

~~セブンイレブンさん、お願いだからビタミンとかも載せてください~~


