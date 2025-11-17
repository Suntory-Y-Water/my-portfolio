---
title: "住んでいる地域の人口増減を一目でわかるWebサイトをつくった"
emoji: "🗾"
type: "tech"
topics:
  - "nextjs"
  - "個人開発"
  - "recharts"
  - "shadcn"
published: true
published_at: "2024-11-16 17:29"
---

# 概要

都道府県を選択して市区町村を選ぶだけで、その地域の人口動態（生産年齢人口、老年人口、年少人口）を可視化できるサイトを作成しました。

https://population-trend-graph.pages.dev/

引っ越しやお住まいの地域で人口の変化を気にしている方は、ぜひ試してみてください！😄

![](https://storage.googleapis.com/zenn-user-upload/8ef470b1fff9-20241113.png)


# 技術的なこと

## フレームワーク(Next.js)

インタラクティブな操作が多いのでVite + Reactの採用も考えましたが、OGP対応などを考慮するとNext.jsのほうがさまざまな点で便利であり、今後改修する際にファイルベースルーティングが魅力的であるため採用しました。

## デザイン(Tailwind CSS + shadcn/ui)

https://ui.shadcn.com/charts

shadcn/uiのChartsを実装してみたいと考え、何かグラフで比較するデータを探し始めたことがこのサイトを作成するきっかけとなりました。

今までChart.jsしか使ったことはなかったのですが、カスタマイズ性が非常に高いと感じました。
shadcn/uiのグラフはrechartsを使用しており、公式ドキュメントが充実している点も魅力的です。

https://recharts.org/en-US/

## デプロイ(Cloudflare Pages)

なんだかんだ使ったことなかったので、触ってみようと思ったのがきっかけです。
デプロイはCloudflareのコンソール上でリポジトリを紐づけ、`@cloudflare/next-on-pages`を使用しています。

push or マージ時に`pnpm next-on-pages`が走ってデプロイまで自動で行ってくれます。

# その他実装で工夫したところ

## グラフのレスポンシブデザイン
スマートフォンでは画面の横幅が小さいため、グラフを縦長にして変化量を分かりやすくするように工夫しました。
```tsx
      <ChartContainer config={chartParamsConfig} className='w-full h-[500px] md:h-[500px] py-2'>
        <LineChart
          accessibilityLayer
          data={chartParams}
          margin={{
            top: 36,
            left: 24,
            right: 36,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey='year'
            tick={{ fontSize: 12, style: { fill: '#333' } }}
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            label={{ value: '(年)', position: 'insideRight', offset: -35, style: { fill: '#333' } }}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis
            width={40}
            tick={{ fontSize: 12, style: { fill: '#333' } }}
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            label={{ value: '(人)', position: 'top', offset: 15, style: { fill: '#333' } }}
            tickFormatter={(tick: number) => tick.toLocaleString()}
            tickCount={6}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator='line' labelKey={'none'} />}
          />
          {selectedMunicipalities.map((municipalityName, index) => (
            <Line
              key={municipalityName}
              dataKey={municipalityName}
              type='natural'
              stroke={colorPalette[index % colorPalette.length]}
              strokeWidth={2}
              dot={{ fill: colorPalette[index % colorPalette.length] }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
```

画像は東京都千代田区と中央区を比較した結果です。
![](https://storage.googleapis.com/zenn-user-upload/acb92fc484ff-20241113.png =300x)

## DBを使用しない

人口データは政府統計の総合窓口(e-Stat)(https://www.e-stat.go.jp/)の住民基本台帳に基づく人口、人口動態及び世帯数調査(政府統計コード:00200241)を加工して作成しています。

使用したデータはDBを使用せずにソースコードに直接ハードコーディングする形で実装しました。

理由は以下の4つです。

1. 基本的にデータは1年に1度しか更新されない
2. 各地域の2019年~2024年のデータだけでも2MB弱にしかならない(比較年が多いとグラフが逆に見づらい)
3. 動的データではない
4. APIで取得する場合、先にデータを取得しておかないとボタン押下時にラグがある

2.で過去5年に絞った理由は、直近の人口が減少しているか増加しているかが分かれば十分と考えたためです。

下記は作成したデータの一例で`municipalities`は市区町村の一覧データで別れており、実際に人口データを取得するときは`municipalityCode`をキーにして`populations`を検索します。

```tsx
export const municipalities = [
  {
    municipalityCode: '011002',
    prefectureCode: '01',
    prefectureName: '北海道',
    municipalityName: '札幌市',
  },
  {
    municipalityCode: '011011',
    prefectureCode: '01',
    prefectureName: '北海道',
    municipalityName: '札幌市中央区',
  },
  ...
]

export const populations = [
  {
    year: 2024,
    municipalityCode: '011002',
    youngPopulation: 206184,
    workingPopulation: 1192995,
    elderlyPopulation: 557749,
  },
  {
    year: 2024,
    municipalityCode: '011011',
    youngPopulation: 22971,
    workingPopulation: 161543,
    elderlyPopulation: 60509,
  },
  ...
]
```

## 全部CSRにしない

ささやかながらSSGを取り入れたいと思い、都道府県の変更はクエリパラメータで設定してSSGでできそうな箇所とCSRで行うべき箇所を明確に分けて実装を行いました。

URLの`prefecture=`に無効な値(hogehoge県)を指定しても初期値に戻るだけです。

# 改修するなら？

もしデータ量が増えて改修するならハードコードしている部分をDBに移す想定です。
現在は2MB程度なので操作に影響はありませんが、データが数MBになると動作が重くなると考えられるため、最も現実的な対応としては県の選択時に対象の県のデータをDBからSELECTする実装を検討することです。

# おわりに
試しに5年分のみのデータを掲載していますが、それでも人口が増加している地区と減少している地区の違いが明確に分かります。
グラフの良いレイアウト案が思いついた場合は、10年、20年とデータ量を増やすことを検討したいと思います。