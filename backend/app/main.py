from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.routers import topics, answers, votes

app = FastAPI(title="リアルタイム大喜利API", description="AIが大喜利のお題を生成し、回答を評価するAPI")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",              # ローカル開発用
        "https://realtimeohgiri-rev2.vercel.app",  # Vercel本番環境
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(topics.router, prefix="/api/topics", tags=["topics"])
app.include_router(answers.router, prefix="/api/answers", tags=["answers"])
app.include_router(votes.router, prefix="/api/votes", tags=["votes"])

@app.get("/")
async def root():
    return {"message": "リアルタイム大喜利APIへようこそ！"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 