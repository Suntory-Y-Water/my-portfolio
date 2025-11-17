---
title: GitHub Actionsでビルドしたファイルをリリースノートに格納する
slug: include-build-files-release-notes-github
date: 2024-09-13
description:
icon: 📒
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Ledger/Flat/ledger_flat.svg
tags:
  - GitHubActions
---

# 背景

最近、友人と自分用に Google Chrome の拡張機能を開発しています。

大々的に公開するわけではないので、`manifest.json` を含めたファイルをそれぞれの PC に手動で配置して動かしています。

しかし、友人たちはエンジニアではないので、アップデート作業ができるだけ簡単に行えるようにしたいと考えました。

拡張機能自体は、Vite + TypeScript で構築しています。前に記事で紹介したように、非エンジニア向けに手間をかけず、更新後は簡単に拡張機能をアップデートできる仕組みが必要でした。

https://zenn.dev/sui_water/articles/7d7daef8f4d057

# 実装の流れ

自動化のフローは以下のような感じです。

1. `main` ブランチに変更をマージ
2. GitHub Actions で自動的にファイルをビルドし、Zip 圧縮
3. リリースノートに圧縮されたファイルをアップロード
4. 利用者がリリースノートからダウンロードし解凍
5. 解凍したファイルを既存の拡張機能に上書きする

利用者はファイルをダウンロードしてコピペするだけで、最新の拡張機能にアップデートできます。

## GitHub Actionsでの自動化設定

次に、GitHub Actions を使って自動化する際の設定を紹介します。

GitHub Actions では、pull request が `main` ブランチにマージされたタイミングでビルドと圧縮が自動で行われ、リリースノートにアップロードされる仕組みにしました。

以下はその例です。

```yaml
name: Create Release Note

on:
  pull_request:
    # PRが閉じたタイミングで実行
    types:
      - closed
    # mainブランチのみを対象とする
    branches:
      - main

jobs:
  build-and-release:
    permissions:
      contents: write
      pull-requests: write
    # リリースブランチからマージのみ実施
    if: github.event.pull_request.merged == true && startsWith(github.head_ref, 'release')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: install dependencies
        run: pnpm install --frozen-lockfile

      - name: build dependencies
        run: pnpm build

      - name: Zip the dist directory
        run: zip -r dist.zip dist

      - name: Create Release and Upload Assets
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # PRのタイトルと内容をRELEASE_TAGに設定する
          RELEASE_TAG: ${{ github.event.pull_request.title }}
        uses: softprops/action-gh-release@v2
        with:
          files: dist.zip
          tag_name: ${{ env.RELEASE_TAG }}
          name: Release ${{ env.RELEASE_TAG }}
          draft: false
          prerelease: false

```

## 課題と改善点

実装はうまくいったものの、問題もありました。

リリースノートにアップロードした `dist.zip` をダウンロードしようとすると、ウイルスとして検出されてしまい、ダウンロードができないという状況に直面しました😭

セキュリティを落とさずに対応できる方法を調べ、`zip-release` というアクションを使うことで改善しました。

https://github.com/TheDoctor0/zip-release

修正したところ、無事 Release Note にファイルを添付できました。
https://github.com/Suntory-Y-Water/flea-assist-plus/releases/tag/0.0.3

```yaml
name: Create Release Note

on:
  pull_request:
    # PRが閉じたタイミングで実行
    types:
      - closed
    # mainブランチのみを対象とする
    branches:
      - main

jobs:
  build-and-release:
    permissions:
      contents: write
      pull-requests: write
    # リリースブランチからマージのみ実施
    if: github.event.pull_request.merged == true && startsWith(github.head_ref, 'release')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: install dependencies
        run: pnpm install --frozen-lockfile

      - name: build dependencies
        run: pnpm build

      # ZIPファイルを作成する（distディレクトリを対象）
      - name: Archive Release
        uses: thedoctor0/zip-release@main
        with:
          type: 'zip'
          filename: extensions.zip
          # distディレクトリにZIPファイルを作成
          directory: dist

      # リリースを作成し、生成されたZIPファイルをアップロードする
      - name: Create Release and Upload Assets
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # PRのタイトルと内容をRELEASE_TAGに設定する
          RELEASE_TAG: ${{ github.event.pull_request.title }}
        uses: softprops/action-gh-release@v2
        with:
          # dist内のZIPファイルを指定
          files: dist/extensions.zip
          tag_name: ${{ env.RELEASE_TAG }}
          name: ${{ env.RELEASE_TAG }}
          draft: false
          prerelease: false
```

# 最後に

最終的には、GitHub Actions を活用した自動更新フローを構築できました。

これで、エンジニアでない友人たちも手軽に最新バージョンを使い続けることができるようになり、非常に便利になったと感じています。

技術的な部分も少しずつ改善しながら、今後もさらに使いやすい形にしていきたいと思います。

# 参考

https://qiita.com/0kq/items/f32e70899c0e9c33cfdd