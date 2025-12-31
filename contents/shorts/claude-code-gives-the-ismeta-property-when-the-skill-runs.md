---
title: "Claude Code でスキルが実行されると isMeta プロパティが付与される"
date: 2025-12-29
---

Claude Code の出力で、スキル実行時は必ず `Skill` ツールが存在し、その後続メッセージとして `isMeta: true` プロパティが付与される。
skills を利用するように指示したのに `isMeta` プロパティがない場合、処理を停止するような Hooks の作成も検討できる。

---

```json
[
  {
    "parentUuid": "f0bf7803-0c84-4067-aa3b-96ece209cbfe",
    "type": "user",
    "message": {
      "role": "user",
      "content": [
        {
          "type": "tool_result",
          "tool_use_id": "toolu_013q6ybYPmAwJxHq87k1u6UC",
          "content": "Launching skill: managing-git-github-workflow"
        }
      ]
    },
    "uuid": "d6dcd6c5-e965-4d22-b044-378435d708fb"
  },
  {
    "parentUuid": "d6dcd6c5-e965-4d22-b044-378435d708fb",
    "type": "user",
    "message": {
      "role": "user",
      "content": [
        {
          "type": "text",
           // SKILL.md の本文が注入される
          "text": "Base directory for this skill: /Users/{user}/.claude/.claude/skills/managing-git-github-workflow\n\n# Git & GitHub ワークフロー\n\n## 基本ワークフロー\n\n..."
        }
      ]
    },
    "isMeta": true,
    "uuid": "154263cd-04a3-45e9-bb1b-4a000841ab1c"
  }
]
```
