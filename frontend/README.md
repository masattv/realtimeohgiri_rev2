# リアルタイム大喜利 フロントエンド

AIが大喜利のお題を生成し、回答を評価するWebアプリのフロントエンド部分です。

## 機能

- 現在のお題と最近のお題の表示
- 大喜利のお題に対する回答の投稿
- AIによる回答評価の表示

## 技術スタック

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- SWR（データフェッチング）
- Axios（APIクライアント）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd <repository-dir>/frontend
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルをプロジェクトルートに作成し、必要な環境変数を設定します。

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

バックエンドのURLを適切に設定してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてアプリケーションにアクセスできます。

## デプロイ

このアプリケーションは [Vercel](https://vercel.com) を使って簡単にデプロイできます。

### Vercelへのデプロイ手順

1. GitHubリポジトリをVercelに接続
2. 適切な環境変数を設定
3. デプロイを実行

## バックエンドとの連携

このフロントエンドは `/backend` ディレクトリにあるFastAPIバックエンドと連携するように設計されています。バックエンドサーバーを先に起動してから、フロントエンドを実行してください。

# バックエンド
backend/.env
backend/__pycache__/
backend/**/__pycache__/
backend/app/__pycache__/
backend/*.db

# フロントエンド
frontend/.env.local
frontend/.next/
frontend/node_modules/
