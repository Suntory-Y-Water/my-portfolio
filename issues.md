翻訳ライブラリを試す
背景としては、Shortsのスラグを自動で翻訳するようにしたい

現状はUUIDをベースにスラグとしているので、SEOの観点や検索性に難がある
ポイントは大きく分けて、２点

無料であることと、npm ライブラリで簡単に扱えること（もし無理なら スプレッドシート とGASで簡易サーバ立てて翻訳する）

この中で適しているのが以下の２つ（どちらも非公式だが試す価値はある）

* **`google-translate-api-jp`**
  非公式で Google 翻訳の仕組みを利用する無料・無制限の npm ライブラリ。日本語→英語にも対応できます。インストールしてすぐ使える例あり。([npm][1])

  ```bash
  npm i google-translate-api-jp
  ```

* **`api-translator`**
  無料・非公式の翻訳パッケージで、Google Translate をベースにして翻訳できます（非公式なので利用は自己責任）。([GitHub][2])

  ```bash
  npm i api-translator
  ```

* **`multranslate`**
  複数の翻訳ソースを使うツール。Google や DeepL 経由で翻訳しますが、インターネット経由（非公式 API）なので無料で使える可能性があります。([npm.io][3])

[1]: https://www.npmjs.com/package/google-translate-api-jp?utm_source=chatgpt.com "google-translate-api-jp - npm"
[2]: https://github.com/egyjs/API-Translator?utm_source=chatgpt.com "GitHub - egyjs/API-Translator: Free API Translator NPM package, a free and unlimited translation API that uses Google Translate"
[3]: https://npm.io/package/multranslate?utm_source=chatgpt.com "Multranslate NPM | npm.io"
[4]: https://www.skypack.dev/view/jp-en?utm_source=chatgpt.com "npm:jp-en | Skypack"
