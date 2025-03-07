from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from app.database import SessionLocal, engine, Base
from app.routers import topics, answers, votes
from app.models import *
import uvicorn

# 環境変数から許可するオリジンを取得、なければデフォルト値を使用
FRONTEND_URLS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,https://realtimeohgiri-rev2.vercel.app,https://realtimeohgiri-rev2-git-main-masattv.vercel.app").split(",")

# ngrokのURLを許可リストに追加
ALLOWED_ORIGINS = [
    "http://localhost:3000",              # ローカル開発用
    "https://realtimeohgiri-rev2.vercel.app",  # Vercel本番環境
    "https://realtimeohgiri-rev2-git-main-masattv.vercel.app",  # Vercel開発環境
    "https://f245-2402-6b00-be46-7100-40bc-4f6-7e50-f89f.ngrok-free.app",  # 過去のngrok URL
    "https://f42f-2402-6b00-be46-7100-40bc-4f6-7e50-f89f.ngrok-free.app",  # 過去のngrok URL
    "https://b99a-2402-6b00-be46-7100-a824-f355-9d94-3095.ngrok-free.app",  # 現在のngrok URL
    "https://*.ngrok-free.app",  # ngrokの一般的なドメインパターン
    "https://*.ngrok.io",        # 旧ngrokドメインパターン
]

app = FastAPI(
    title="リアルタイム大喜利 API",
    description="リアルタイムに大喜利のお題と回答を管理するAPI",
    version="0.1.0",
)

# CORSミドルウェアを追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # 許可するオリジンのリスト
    allow_credentials=True,
    allow_methods=["*"],  # すべてのHTTPメソッドを許可
    allow_headers=["*"],  # すべてのHTTPヘッダーを許可
)

# ルーターの登録
app.include_router(topics.router, prefix="/api/topics", tags=["topics"])
app.include_router(answers.router, prefix="/api/answers", tags=["answers"])
app.include_router(votes.router, prefix="/api/votes", tags=["votes"])

@app.get("/api")
async def root():
    return {"message": "リアルタイム大喜利APIへようこそ！"}

@app.get("/health")
async def health_check():
    """
    ヘルスチェックエンドポイント（Renderのデプロイ確認用）
    """
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 