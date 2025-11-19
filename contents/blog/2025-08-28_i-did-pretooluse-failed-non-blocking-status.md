---
title: PreToolUseがfailed with non-blocking status code 127になったときにやったこと
slug: i-did-pretooluse-failed-non-blocking-status
date: 2025-08-28
modified_time: 2025-08-28
description: Claude CodeのPreToolUseがfailed with non-blocking status code 127になったときの解決方法を解説します。改行コードがCRLFになっている場合にLFに変更することで解決します。
icon: 🎐
icon_url: https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wind%20chime/Flat/wind_chime_flat.svg
tags:
  - ClaudeCode
  - Serena
---

## 結論

改行コードが**CRLF**になっていると思うので、**LF**にしてください。

## 実際に発生したエラー

いつも使っていた PreToolUse がいきなり動かなくなり、1 時間くらい使っても解決しなかったので途方に暮れていました。
エラーは以下のような内容です。

```bash
● PreToolUse:Bash [~/.claude/scripts/hook_stop_words.sh] failed with non-blocking status code 127: /bin/sh: 1: ~/.claude/scripts/hook_stop_words.q: not found
```

このエラーを見て最初は「ファイルが見つからない」と思いましたが、全く触っていないのでファイルがなくなることはありえず、原因が分からなかったため一時的に PreToolUse を削除して対応していました。

### 基本的な確認をしても問題なし

ありえることとすればファイルの実行権限がなくなることや、shebang 行が正しく設定されているか、といった基本的な点です。
ですが、当たり前のように設定されており実行できなかったため困りました。。。

```bash
## ファイルの存在と権限を確認
$ ls -la /home/sui/.claude/scripts/hook_stop_words.sh
-rwxr-xr-x 1 sui sui 245 Dec 15 10:30 /home/sui/.claude/scripts/hook_stop_words.sh

## shebang行も正しい
$ head -n 1 /home/sui/.claude/scripts/hook_stop_words.sh
#!/bin/bash
```

### デバッグモードで試してみる

Claude Code は `-d` オプションでデバッグモードとして起動が可能です。
共同作業で続けたところ、ファイルが「CRLF line terminators」で保存されていることが分かり、これが原因でした。

```bash
$ file /home/sui/.claude/scripts/hook_stop_words.sh
/home/sui/.claude/scripts/hook_stop_words.sh: Bourne-Again shell script, ASCII text executable, with CRLF line terminators
```

### いまさらCRLF問題の仕組みをちょっと調べる

Windows と Linux では改行コードが異なります。

- Windows: CRLF(`\r\n`)
- Linux: LF(`\n`)

Linux カーネルが shebang 行を読み込む時、CRLF 形式だと以下のように解釈されます。

- 正常な場合(LF)
	- ファイル内容: `#!/bin/bash\n`
	- システムの解釈: `/bin/bash` を実行
- 問題の場合(CRLF)
	- ファイル内容: `#!/bin/bash\r\n`
	- システムの解釈: `/bin/bash\r` を実行しようとする

`/bin/bash\r` というファイルは存在しないため、「not found」エラーになります。

### 解決方法

以下のコマンドで CRLF を LF に変換し、スクリプトは正常に動作するようになりました🎉

```bash
sed -i 's/\r$//' /home/sui/.claude/scripts/hook_stop_words.sh
```

## 参考

https://wa3.i-3-i.info/word14689.html

## おまけ：なんでこれが起きた？

おそらく serena を導入したときに `git config --global core.autocrlf true` にしたからかなと思っています..。

 >⚠️ Important: since Serena will write to files using the system-native line endings and it might want to look at the git diff, it is important to set git config core.autocrlf to true on Windows. With git config core.autocrlf set to false on Windows, you may end up with huge diffs only due to line endings. It is generally a good idea to globally enable this git setting on Windows:
 >`git config --global core.autocrlf true`

https://github.com/oraios/serena/blob/main/README.md?plain=1#L645-L654