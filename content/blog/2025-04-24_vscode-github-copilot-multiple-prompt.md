---
title: GitHub Copilotもルールを強制させる
public: true
date: 2025-04-24T00:00:00.000Z
icon: >-
  https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Airplane%20departure/Flat/airplane_departure_flat.svg
slug: vscode-github-copilot-multiple-prompt
tags:
  - GitHub
  - GitHub Copilot
  - Visual Studio Code
description: >-
  VSCodeで使えるGitHub Copilotでも
  Cursorと同じようなルールを設定することができます。この記事では複数のルールを設定して開発を行う方法を解説します。
---


GitHub Copilotでもカスタムルールを設定して、コード生成の品質を向上させることができます。
この記事では、Cursorの「Project rules」と同様の機能をGitHub Copilot上で実現する方法を解説します。
具体的には、複数のルールを設定して体系的に開発を進める手順を紹介します。


> [!NOTE]
> カスタムルールを読み込む設定はパブリックプレビュー段階であり、変更される可能性があります。



公式ドキュメントを参考に、実践していきましょう。
https://docs.github.com/ja/enterprise-cloud@latest/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot

## ベースとなるルールの作成

この記事では2つのルールを作成します。
- 出力時の作法をまとめた基本ルール
- フレームワークに関係しないベースとなるコーディングルール


## 基本ルール

リポジトリのルートに `.github/copilot-instructions.md` という名前のファイルを作成します。
このファイルではコーディングルールなどは記載せず、出力するときの形式やコードを分析するときの手順を記載しています。


```markdown
# `.github/copilot-instructions.md` Structured Outline

# Precondition

- Once you have loaded this file, output the file name at the beginning of the text.

# Role and Assumptions

- You are an AI assistant with advanced problem-solving abilities.
- Follow instructions efficiently and accurately to complete your tasks.

---

# Step 1: Analyze and Plan the Instruction

- Briefly summarize the major tasks.
- Check the **Rules to Follow Directory/Files**.
- Identify critical requirements and constraints.
- List potential challenges.
- Break down the execution steps in detail.
- Determine the optimal order for executing those steps.

# Prevent Duplicate Implementations

Before proceeding, check for:

- Existing similar functions
- Functions/components with the same or similar names
- Overlapping API endpoints
- Processes that can be shared

> This section guides the entire process. Perform a thorough and comprehensive analysis.

---

# Step 2: Task Execution

- Execute the identified steps one at a time.
- After each step, provide a brief progress report.
- During implementation, adhere to:
  - Proper directory structure
  - Consistent naming conventions
  - Logical placement of common processes

---

# Step 3: Quality Control and Problem Handling

- Promptly verify the results of each execution step.
- If errors or inconsistencies occur, follow this procedure:

  1. Isolate the issue and identify the cause (e.g., log analysis)
  2. Create and implement a countermeasure
  3. Verify operation post-fix
  4. Analyze debug logs

- Record verification results using the following format:
  1. Verification items and expected results
  2. Actual results and any discrepancies
  3. Required corrective actions (if any)

---

# Step 4: Final Confirmation

- After all tasks are complete:
  - Evaluate the final deliverables
  - Confirm consistency with original instructions
  - Ensure no duplicated functionality

---

# Step 5: Report of Results

Provide the final results in the following format:

```markdown
# Execution Result Report

# Summary

[Brief overview of the task and results.]

# Execution Steps

1. [Step 1 description and result]
2. [Step 2 description and result]
   ...

# Final Deliverables

[Details and links to deliverables, if applicable]

# Issue Response (if applicable)

- Issues encountered and response actions
- Future considerations

---

# Important Notes

- **Always respond in Japanese.**
- If any uncertainties arise, obtain confirmation before proceeding.
- For any significant decisions, report and obtain approval first.
- Immediately report unexpected problems and propose solutions.
- **Do not make any changes not explicitly instructed.**
  - If a change seems necessary, submit a proposal and wait for approval.
- **Do not change UI/UX design (layout, colors, fonts, spacing, etc.) without approval.**
- **Do not change versions of APIs, frameworks, or libraries without approval.**
  - If a change is required, clearly explain the reason and obtain approval before applying it.

---

Follow these instructions carefully to ensure a reliable, high-quality implementation. Act only within the given scope and avoid unnecessary changes. Always confirm when uncertain or when major decisions are needed.
```


ルールが正しく読み込まれているかは以下の手順で確認できます。VScodeを開き、`Ctrl + Alt + I`を押してチャットを起動すると、ファイルが読み込まれたことが確認できます。
今回設定したルールでは、読み込み時にファイル名を出力するよう指定しているため、これによって動作確認ができます(長いため画像は省略しています)。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-f633910d-8802-498f-88f1-9fd8cfe3bd8a.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-f633910d-8802-498f-88f1-9fd8cfe3bd8a.png)

### ルールが読み込まれなかったときにやること

これはGitHub Copilotに限った話ではないですが、ルールが呼ばれるときと、呼ばれているか分からないときがあります。
そんなときには、ルールの先頭で無意味な言葉を叫ばせる。という方法があります。
https://docs.cline.bot/improving-your-prompting-skills/prompting#memory-and-confidence-checks
今回設定したルールでは、ファイルを読み込んだときの冒頭に、読み込んだファイル名を出力させるようにしています。

## 追加ルール(コーディングルール)の作成

以下の設定を行うと、`.github/prompts`配下に用途ごとのルールを作成して読み込ませることも可能です。
1. `Ctrl + Shift + P`でコマンドパレットを開く
2. 「Open Workspace Settings (JSON)」と入力し、表示されるオプションを選びます。
3. `settings.json` ファイルに `"chat.promptFiles": true` を追加します。

これで、`.github/prompts` フォルダーはプロンプトファイルの場所として有効になります。
実際にコーディングルールを作成していきましょう。

```markdown
<!-- .github/prompts/coding-rules.prompt.md -->

# Clean Code Guidelines

First, when referencing this file, say the name of this file.

Example: "Loaded copilot-instructions.md".

# TypeScript coding rules

# Constants over magic numbers

- Replace hard-coded numbers with named constants
- Use clear constant names that explain the purpose of the values
- Place constants at the top of the file or in a dedicated constants file

# Meaningful names

- Give variables, functions, and classes clear names
- Names should explain why they exist and how they are used
- Avoid abbreviations that are not commonly understood

# Smart comments

- Don't write comments that explain what the code does - Make the code itself easy to understand
- Use comments to explain why you chose to implement it the way you did
- Provide documentation comments for APIs, complex algorithms, and non-obvious side effects

# Single responsibility

- Each function does only one thing
- Keep functions small and focused
- Split up functions when comments explaining what they do are needed

# DRY (Don't Repeat Yourself)

- Extract repetitive code into reusable functions
- Share common logic through appropriate abstractions
- Have a single source of truth for each piece of information

# Clean structure

- Group related code together
- Organize code in a logical hierarchy
- Use consistent file and folder naming conventions
- Use early returns instead of if-else chains
- For processes with low chances of exceptions, such as fetching and file conversion, use proper error handling rather than overusing try-catch

# Encapsulation

- Hide implementation details
- Expose clear interfaces
- Prefer type over interface when defining types
- Extract complex conditional branching into appropriately named functions

# Use TypeScript types

- Avoid using any types, and use unknown types when necessary
- Use generics to write type-safe, reusable code
- Use union types (|) and intersection types (&) appropriately
- Actively use optional properties (?), optional chaining (?.), and nullish coalescing (??)
- Understand and utilize utility types (Partial, Required, Pick, Omit, Exclude, Extract, ReturnType, etc.), and add MECE explanations when generating code

- Use Readonly to represent immutable data

# Asynchronous processing

- Use Promise.all to run multiple asynchronous processes in parallel and optimize them
- Prefer async/await over .then()/.catch() to avoid callback hell
- Always implement proper error handling in asynchronous processing

# Performance optimization

- When updating large objects, use immutable methods (such as the spread operator) appropriately

# Security

- Always validate user input and sanitize data appropriately
- Do not write secret information such as API keys and passwords directly in code
- Implement countermeasures against common vulnerabilities such as XSS, CSRF, and SQL injection
- Minimize type coercion (use of the as keyword)
- Regularly check the security of external libraries

# Maintainability and scalability

- Use linters and formatters to maintain a consistent code style
- Monitor code complexity and refactor overly complex functions
- Split large components into smaller reusable components
- Clearly separate business logic from display logic
- Design to minimize the impact of adding new features on existing code

# Error handling

- Consider type-safe error handling patterns (such as Either and Result, if implemented) over exception handling
- Provide clear error messages for users
- Log errors appropriately and notify monitoring systems as needed
- Keep try-catch blocks to a minimum and catch specific exception types

# Code quality and review

- Manage technical debt by leaving "TODO" comments for code that should be improved later
```


実際に作成したコードを使用する方法は以下のとおりです。
1. Copilot Chat の下部にある**コンテキストを追加する**を選択します。
2. ドロップダウン メニューの**プロンプト**を選択し、使うプロンプトファイルを選択します。

読み込みが完了するとこのようにラベルのようなアイコンでファイルが設定されます。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-4afc8f45-1bc6-414a-8047-63dc9f5431db.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-4afc8f45-1bc6-414a-8047-63dc9f5431db.png)

プロンプトを送信すると、正しく読み込まれていることが確認できます。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-48494a54-0281-4daf-b96b-a242cb60e962.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-48494a54-0281-4daf-b96b-a242cb60e962.png)

## 注意点

カスタム指示機能もシステムプロンプト同様に、指示した内容全てを忠実に守ってくれるわけではありません。
公式ドキュメントにも記載されてる通り、以下のような指示の精度はあまり高くないようです。
1. 外部リソースへの参照の要望
2. 回答方法のフォーマット化
3. 回答時に詳細に出力するよう指示
https://docs.github.com/ja/enterprise-cloud@latest/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot

また、Cursorと異なり、GitHub Copilotでは`copilot-instructions.md`内から他のファイルをパス指定で読み込むことができません。
`copilot-instructions.md`から`coding-rules.prompt.md`を読み込むようなプロンプトを入れて試してみると、読み込めないとCopilotからエラーが表示されます。
![https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-e6375277-0150-4ea2-a6b7-7346605364f4.png](https://pub-37c337e4f6b74be784982bc3041040b4.r2.dev/images/image.png-e6375277-0150-4ea2-a6b7-7346605364f4.png)


## まとめ

GitHub Copilotでも複数のカスタムルールを設定することで、コード生成の品質を向上させることができます。本記事では以下の内容を解説しました。
1. 基本ルールを`.github/copilot-instructions.md`に設定する方法
2. コーディングルールを`.github/prompts`ディレクトリに追加する方法
3. ルールの読み込み確認方法と注意点

これらの設定を活用することで、チーム開発における一貫性のあるコードスタイルの維持が保たれます。
プロンプトを継続的に改善していくことで、より質の高いコード生成を実現でしょう。
