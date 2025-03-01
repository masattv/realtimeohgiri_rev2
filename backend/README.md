# リアルタイム大喜利 バックエンド

AIが大喜利のお題を生成し、回答を評価するバックエンドAPIサーバーです。

## 機能

- AIによる大喜利のお題生成（4時間ごとに更新）
- お題に対する回答の登録
- AIによる回答の評価

## 技術スタック

- Python 3.8+
- FastAPI
- SQLAlchemy
- OpenAI API
- SQLite（開発）/ PostgreSQL（本番）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd <repository-dir>/backend
```

### 2. 仮想環境の作成と有効化

```bash
python -m venv venv
# Windowsの場合
venv\Scripts\activate
# Linuxの場合
source venv/bin/activate
```

### 3. 依存関係のインストール

```bash
pip install -r requirements.txt
```

### 4. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成し、必要な環境変数を設定します。

```bash
cp .env.example .env
# .envファイルを編集してAPIキーなどを設定
```

### 5. データベースの初期化と起動

```bash
python run.py
```

## APIエンドポイント

### お題関連

- `GET /api/topics/active`: 現在アクティブなお題を取得
- `GET /api/topics/{topic_id}`: 特定のお題の詳細を取得
- `GET /api/topics`: 最近のお題リストを取得
- `POST /api/topics/generate`: 新しいお題を生成

### 回答関連

- `POST /api/answers`: 新しい回答を登録
- `GET /api/answers/topic/{topic_id}`: お題に対する回答一覧を取得
- `GET /api/answers/{answer_id}`: 特定の回答を取得
- `POST /api/answers/evaluate`: 特定の回答にAI評価をリクエスト

## デプロイ

本番環境へのデプロイには [Render](https://render.com) や [Railway](https://railway.app) などのサービスが利用できます。

### Renderへのデプロイ手順

1. Renderアカウントを作成
2. 「New Web Service」を選択
3. GitHubリポジトリを連携
4. 以下の設定を行う:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - 環境変数に `.env` ファイルの内容を設定

## ライセンス

MIT 