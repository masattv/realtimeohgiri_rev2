# デプロイガイド

このガイドでは、リアルタイム大喜利アプリケーションを無料または低コストでデプロイする方法を説明します。

## バックエンドのデプロイ

バックエンドは FastAPI で実装されており、Render.com や Railway.app などのサービスに無料または低コストでデプロイできます。

### Render.com へのデプロイ

Render.com は無料枠があり、個人プロジェクトに最適です。

1. [Render.com](https://render.com) にアカウントを作成
2. ダッシュボードから「New +」ボタンをクリックし、「Web Service」を選択
3. GitHub リポジトリを連携し、バックエンドディレクトリを指定
4. 以下の設定を行う:
   - Name: `realtime-ohgiri-backend` など
   - Region: Tokyo または近い地域
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Instance Type: Free（無料枠）
5. 「Advanced」を開き、以下の環境変数を設定:
   - `OPENAI_API_KEY`: OpenAI の API キー
   - `DATABASE_URL`: データベース URL（Render の PostgreSQL を使用する場合は自動設定される）
   - `ALLOWED_ORIGINS`: フロントエンドの URL（例: `https://your-frontend-domain.vercel.app`）
6. 「Create Web Service」をクリックしてデプロイを開始

注意: 無料枠は15分間のアイドル状態で自動的にスリープモードになります。最初のリクエストは起動に時間がかかる場合があります。

### Railway.app へのデプロイ

Railway.app は月に $5 から利用でき、常時稼働させたい場合に適しています。

1. [Railway.app](https://railway.app) にアカウントを作成
2. 「New Project」から「Deploy from GitHub repo」を選択
3. GitHub リポジトリを連携
4. 「Add Variables」から環境変数を設定:
   - `OPENAI_API_KEY`: OpenAI の API キー
   - `DATABASE_URL`: データベース URL
   - `ALLOWED_ORIGINS`: フロントエンドの URL
5. 「Settings」タブから:
   - Root Directory: `backend`
   - Start Command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. 「Deploy」ボタンをクリックしてデプロイを開始

## フロントエンドのデプロイ

フロントエンドは Next.js で実装されており、Vercel に無料でデプロイできます。

### Vercel へのデプロイ

1. [Vercel](https://vercel.com) にアカウントを作成
2. 「New Project」ボタンをクリック
3. GitHub リポジトリをインポート
4. 以下の設定を行う:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. 「Environment Variables」セクションで以下を設定:
   - `NEXT_PUBLIC_API_URL`: バックエンドの URL（例: `https://realtime-ohgiri-backend.onrender.com/api`）
6. 「Deploy」ボタンをクリックしてデプロイを開始

## データベースのセットアップ

### Supabase を使用する場合（無料枠あり）

1. [Supabase](https://supabase.com) にアカウントを作成
2. 新しいプロジェクトを作成
3. 「SQL Editor」からデータベースのテーブルを作成:

```sql
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_score INTEGER,
  ai_comment TEXT
);
```

4. 「Project Settings」→「Database」からデータベース接続情報を取得
5. バックエンドの環境変数に `DATABASE_URL` として設定:
   - `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres`

## 定期的なお題生成の設定

4時間ごとにお題を生成するために、以下のいずれかの方法を使用できます：

### 方法1: GitHub Actions を使用する場合

1. リポジトリのルートに `.github/workflows/generate-topic.yml` ファイルを作成:

```yaml
name: Generate New Topic

on:
  schedule:
    - cron: '0 */4 * * *'  # 4時間ごとに実行

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Generate new topic
        run: |
          curl -X POST https://your-backend-url.com/api/topics/generate
```

### 方法2: Uptime Robot を使用する場合

1. [Uptime Robot](https://uptimerobot.com/) に無料アカウントを作成
2. 「Add New Monitor」をクリック
3. 以下の設定を行う:
   - Monitor Type: HTTP(s)
   - Friendly Name: Ohgiri Topic Generator
   - URL: https://your-backend-url.com/api/topics/generate
   - Method: POST
   - Monitoring Interval: 4 hours

## ドメイン設定（オプション）

独自ドメインを使用する場合:

1. お好みのドメインレジストラでドメインを購入
2. Vercel の「Project Settings」→「Domains」からドメインを追加
3. 表示される DNS レコードをドメインレジストラに追加
4. バックエンドの `ALLOWED_ORIGINS` 環境変数に新しいドメインを追加

## 定期的なメンテナンス

- API キーと費用: 月に一度、API キーの使用状況と費用を確認
- データベースバックアップ: 重要なデータは定期的にバックアップ
- サービスの監視: Uptime Robot などでサービスの稼働状況を監視

以上のステップに従うことで、リアルタイム大喜利アプリケーションを無料または低コストでデプロイすることができます。 