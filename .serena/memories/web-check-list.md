## セキュリティ

### 認証に関わるCookieの属性

- **HttpOnly属性が設定されていること**
	- XSSの緩和策（あくまでも緩和）
- **SameSite属性が `Lax` もしくは `Strict` になっていること**
	- 主にCSRF対策のため。 `Lax` の場合、GETリクエストで更新処理を行っているエンドポイントがないか合わせて確認
- **Secure属性が設定されていること**
	- HTTPS通信でのみCookieが送られるように
- **Domain属性が適切に設定されていること**
	- サブドメインにもCookieが送られる設定の場合、他のサブドメインのサイトに脆弱性があるとそこからインシデントに繋がるリスクを理解しておく
	- 例: `example.com` のCookieが採用サイトの `jobs.example.com` にも送られるようになっており、そのサーバーに脆弱性がある等
	- 参考: [CookieのDomain属性は\*指定しない\*が一番安全](https://blog.tokumaru.org/2011/10/cookiedomain.html)
	- Cookie名の接頭辞を `__Host-` とするとDomain属性が空になっていないCookieの指定を無視してくれる（参考: [Cookie Prefixのバイパス](https://www.mbsd.jp/research/20221005/cookie-prefix/) ）

### レスポンスヘッダ

- **`Strict-Transport-Security` がレスポンスヘッダに指定されていること**
	- ブラウザに指定された期間中、指定されたドメインへの接続は常にHTTPではなくHTTPSを使用するように指示
		```jsx
		{
		  key: 'Strict-Transport-Security',
		  value: 'max-age=31536000; includeSubDomains; preload'
		}
		```
-  [CSPの `frame-ancestors` を設定した方が良いようです](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
	- 参考 [[X-Frame-Options header - HTTP  MDN]]
	- 想定していない他サイト上でのiframe等によるページの埋め込みを防ぐ = クリックジャッキング対策
- **`X-Content-Type-Options: nosniff` が指定されていること**
	- 参考: [X-Content-Type-Options: nosniff はIE以外にも必要](https://blog.ohgaki.net/x-content-type-options-nosniff-is-required-by-other-than-ie)

### その他セキュリティ

- **サーバーで発生したエラーメッセージをそのままブラウザに表示していないこと**
## SEO

- **全ページでtitleタグが適切に指定されていること**
- **SEO上重要になるページで [canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=ja) の設定がされていること**
	- 例: `https://example.com/products/foo` と `https://example.com/products/foo?query=bar` が同一内容であることを検索エンジンが認識できるようにする
- **エラー関連のページのステータスコードが40xもしくは50xになっている、もしくはnoindexになっていること**
- **検索結果ページに [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=ja) もしくはcanonical URLが設定されていること**
	- もしくは `<title>` タグと `<h1>` タグの内容に「検索結果: ◯◯」と明確に含めるようにする。でないと、おかしなキーワードが検索結果にインデックスされてしまう可能性がある
	- 例: `https://example.com/search?keyword=UNKO` のページタイトルが「UNKO」になっていたら「UNKO」が検索結果にインデックスされてしまうかも
- **トップページなどの検索流入が多くなるであろうページにmeta descriptionが設定されていること**
	- 個人的にはユーザー生成のページなどでは無理に設定しなくてもいいと思っている派。おかしなmeta descriptionが設定されるくらいなら無くていい。
- **動的にパブリックなページが生成される場合、XMLサイトマップを作成し、Search Consoleに登録されていること**

## OGP

- **頻繁にシェアされることが想定されるページの [OGPの設定](https://ogp.me/) が完了していること**
	- このあたりを設定しておきたい
		- og:title
		- og:description
		- og:url
		- og:image
		- twitter:card （ [Xのカードの形式](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards) ）

## アクセシビリティ

- **画像（ `<img>` ）のalt属性が適切に指定されていること**
	- altの指定の仕方は [情報バリアフリーポータルサイト](https://jis8341.net/jirei_sample/jirei_chapter_01.html) が参考になる
- **内部がsvgアイコンだけの `<button>` や `<a>` の役割がスクリーンリーダーからも認識できるようになっていること**
	```html
	<a href="/" aria-label="リンクの役割を示すテキスト">
	  <svg aria-hidden="true" ... ></svg>
	</a>
	```

この2つは忘れがちなのでチェックリストに入れました。その他の項目ついては [freeeアクセシビリティー・ガイドライン](https://a11y-guidelines.freee.co.jp/index.html) が参考になります。

## パフォーマンス

- **余計なモジュールがバンドルJSに含まれていないこと**
	- リリース前にbundle-analyzerなどで確認するのが良い
- **静的ファイルがCDNにキャッシュされていること**
	- Next.jsやNuxt.jsなどのフレームワークでは大量のjs/cssファイルにリクエストが飛ぶが、これらの静的ファイルはCDNから配信したい
- **画像によるレイアウトシフトが起きないこと**
	- img要素にCSSのaspect-ratio もしくは width/height属性を指定する
- **必要以上に巨大な画像が読み込まれていないこと**
	- 例: 幅400pxで小さく表示されている画像のサイズが実は2MBだった。よく見かける

## 複数環境での動作確認

- **スマホやタブレットサイズの画面で表示したときにUIが崩れないこと**
	- これめっちゃよく見る
- **各OSで見たときにフォントがおかしなことになっていないこと**
	- font-familyがMac、Windows、iOS、Android、(Linux)など各OSでも不自然にならない指定になっていること
- **（開発環境がMacの場合）システム環境設定で「スクロールバーを常に表示」にしても問題がないこと**
	- スクロールバーが常に表示される設定では、モーダルを開くとき等にガタつきがち。 [scrollbar-gutter](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter) による対応が必要になるかも

## その他

- **ローカルストレージやhttp-onlyでないCookie等が7日で消えても問題がないこと**
	- あまり知られていないが、最近のiOS SafariではITPの仕様により、ブラウザ上のJavaScriptから保存されたCookieやローカルストレージの内容は7日以上ユーザーが触らないと自動で削除される（ [参考](https://www.theregister.com/2020/03/26/apple_relax_were_not_totally/) ）
- **サードパーティCookieに依存していないこと**
	- 参考: [サードパーティCookieの廃止に向けた準備](https://developer.chrome.com/ja/blog/cookie-countdown-2023oct/)
- **日本語サイトの場合、 `<html lang="ja">` となっていること**
	- フレームワークによってはデフォルトで `lang="en"` となっていることがあるので注意
- **404ページや50x系ページが悪くない感じになっていること**
	- 404の場合はトップページ等へのリンク等、次のアクションへの導線が表示されていること
- **ファビコンが設定されていること**
- **apple-touch-iconが設置されていること**
- **Google Analyticsなどアクセス解析ツールを導入していること** （必要なら）

