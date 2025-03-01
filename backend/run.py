import uvicorn
import os
from dotenv import load_dotenv
from app.database import engine, Base

# データベースの初期化
Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    # 環境変数の読み込み
    load_dotenv()
    
    # サーバー設定
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    
    # サーバーの起動
    uvicorn.run("app.main:app", host=host, port=port, reload=True) 