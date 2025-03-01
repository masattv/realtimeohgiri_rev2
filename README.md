# リアルタイム大喜利

AIが大喜利のお題を生成し、回答を評価するリアルタイムウェブアプリケーションです。4時間ごとに新しいお題が生成され、ユーザーはお題に対して回答を投稿できます。AIが回答を評価し、点数とコメントを提供します。

![リアルタイム大喜利イメージ](docs/app_image.png)

## 機能

- **AIによるお題生成**: 4時間ごとに新しい大喜利のお題をAIが自動生成
- **回答投稿**: ユーザーは各お題に対して回答を投稿可能
- **AIによる回答評価**: 投稿された回答をAIが評価し、点数とコメントを提供
- **リアルタイム更新**: 新しい回答や評価がリアルタイムで表示

## 技術スタック

### バックエンド
- Python 3.8+
- FastAPI
- SQLAlchemy
- OpenAI API
- SQLite (開発環境) / PostgreSQL (本番環境)

### フロントエンド
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Axios

## セットアップ

### 前提条件
- Python 3.8+
- Node.js 18+
- npm または yarn
- OpenAI APIキー

### インストール手順

#### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd <repository-dir>
```

#### 2. バックエンドのセットアップ
```bash
cd backend
python -m venv venv
# Windowsの場合
venv\Scripts\activate
# Linuxの場合
source venv/bin/activate

pip install -r requirements.txt

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してOpenAI APIキーなどを設定
```

#### 3. フロントエンドのセットアップ
```bash
cd ../frontend
npm install

# 環境変数の設定
cp .env.local.example .env.local
# 必要に応じて.env.localを編集
```

#### 4. アプリケーションの起動
```bash
# バックエンドの起動（backendディレクトリで）
python run.py

# フロントエンドの起動（frontendディレクトリで）
npm run dev
```

ブラウザで http://localhost:3000 を開いてアプリケーションにアクセスできます。

## デプロイ

### バックエンド
バックエンドは [Render](https://render.com) や [Railway](https://railway.app) などのPythonをサポートするサービスにデプロイすることができます。

1. Renderアカウントを作成
2. 「New Web Service」を選択
3. GitHubリポジトリを連携
4. 以下の設定を行う:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - 環境変数を設定（OpenAI APIキー、データベースURL等）

### フロントエンド
フロントエンドは [Vercel](https://vercel.com) を使ってデプロイするのが最も簡単です。

1. Vercelアカウントを作成
2. GitHubリポジトリをインポート
3. フロントエンドのディレクトリをルートディレクトリとして設定
4. 環境変数を設定（バックエンドAPIのURLなど）
5. デプロイを実行

## ライセンス

MIT

## 謝辞

このプロジェクトは以下のテクノロジーとサービスに支えられています：

- [OpenAI](https://openai.com) - AIによるお題生成と回答評価
- [FastAPI](https://fastapi.tiangolo.com) - 高速なAPIフレームワーク
- [Next.js](https://nextjs.org) - Reactフレームワーク
- [Tailwind CSS](https://tailwindcss.com) - ユーティリティファーストCSSフレームワーク 