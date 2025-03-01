from app.database import engine
from sqlalchemy import text

# データベースマイグレーション - user_idカラム追加
def migrate_db():
    with engine.connect() as conn:
        # answersテーブルにuser_idカラムがなければ追加
        try:
            conn.execute(text("ALTER TABLE answers ADD COLUMN user_id VARCHAR(100) NOT NULL DEFAULT 'anonymous'"))
            print("user_id column added to answers table")
            conn.commit()
        except Exception as e:
            print(f"Migration error or column already exists: {e}")

if __name__ == "__main__":
    migrate_db()
    print("マイグレーション完了") 