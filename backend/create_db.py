import os
from app.database import engine, Base
from app.models.models import Topic, Answer, Vote
from sqlalchemy import text

# データベースのテーブルを初期化
print("データベースを初期化しています...")
Base.metadata.drop_all(bind=engine)

# データベーススキーマの作成
def create_schema():
    Base.metadata.create_all(bind=engine)

# データベースマイグレーション
def migrate_db():
    with engine.connect() as conn:
        # answersテーブルにuser_idカラムがなければ追加
        try:
            conn.execute(text("ALTER TABLE answers ADD COLUMN user_id VARCHAR(100) NOT NULL DEFAULT 'anonymous'"))
            print("user_id column added to answers table")
            conn.commit()
        except Exception as e:
            print(f"Migration error or column already exists: {e}")
            conn.rollback()

if __name__ == "__main__":
    # データベースファイルが存在するかチェック
    db_exists = os.path.exists("app.db")
    
    # スキーマ作成
    create_schema()
    
    # 既存のDBの場合はマイグレーションを実行
    if db_exists:
        migrate_db()

    print("データベース初期化が完了しました。") 