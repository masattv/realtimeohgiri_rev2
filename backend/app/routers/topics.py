from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import pytz

from app.database import get_db
from app.models.models import Topic
from app.schemas.schemas import TopicCreate, TopicResponse, TopicDetail, TopicGenerationResponse
from app.services.ai_service import generate_topic

router = APIRouter()

# 現在アクティブなお題を取得
@router.get("/active", response_model=TopicResponse)
async def get_active_topic(db: Session = Depends(get_db)):
    now = datetime.now(pytz.UTC)
    print(f"現在のUTC時刻: {now}")
    
    # 全てのアクティブなトピックを取得してログに出力
    all_active_topics = db.query(Topic).filter(Topic.is_active == True).all()
    print(f"全てのアクティブなトピック: {len(all_active_topics)}件")
    for topic in all_active_topics:
        # タイムゾーン情報を付与して比較
        topic_expires_at = pytz.UTC.localize(topic.expires_at) if topic.expires_at.tzinfo is None else topic.expires_at
        print(f"ID: {topic.id}, 内容: {topic.content}, 期限: {topic_expires_at}")
        print(f"期限切れ？: {topic_expires_at < now}")
    
    # 期限内のアクティブなトピックを取得
    # SQLiteはタイムゾーン情報を持たないため、文字列として比較
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")
    topic = db.query(Topic).filter(
        Topic.is_active == True,
        Topic.expires_at > now_str
    ).order_by(Topic.created_at.desc()).first()
    
    if not topic:
        raise HTTPException(status_code=404, detail="現在アクティブなお題はありません")
    
    return topic

# お題の詳細を取得（回答を含む）
@router.get("/{topic_id}", response_model=TopicDetail)
async def get_topic_detail(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    
    if not topic:
        raise HTTPException(status_code=404, detail="お題が見つかりません")
    
    return topic

# 新しいお題を生成（バックグラウンドで実行）
@router.post("/generate", response_model=TopicGenerationResponse)
async def create_topic(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 既存のアクティブなお題を確認
    now = datetime.now(pytz.UTC)
    active_topic = db.query(Topic).filter(
        Topic.is_active == True,
        Topic.expires_at > now
    ).first()
    
    if active_topic:
        return TopicGenerationResponse(message=f"既存のアクティブなお題があります。ID: {active_topic.id}")
    
    # バックグラウンドでお題を生成して保存
    background_tasks.add_task(_generate_and_save_topic, db)
    
    # 処理開始を通知
    return TopicGenerationResponse(message="新しいお題を生成中です。しばらく待ってから再度確認してください。")

# 新しいお題を強制的に生成（既存のアクティブなお題を無視）
@router.post("/generate/force", response_model=TopicGenerationResponse)
async def force_create_topic(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    print("強制生成エンドポイントが呼び出されました")
    
    try:
        # 古いアクティブなお題を非アクティブに設定
        old_topics = db.query(Topic).filter(Topic.is_active == True).all()
        print(f"非アクティブ化する古いお題: {len(old_topics)}件")
        for topic in old_topics:
            topic.is_active = False
            print(f"ID: {topic.id}を非アクティブ化")
        db.commit()
        
        # 新しいお題を生成
        content = generate_topic()
        print(f"生成されたお題: {content}")
        
        # 有効期限は4時間後
        expires_at = datetime.now(pytz.UTC) + timedelta(hours=4)
        
        # お題を保存
        new_topic = Topic(
            content=content,
            expires_at=expires_at,
            is_active=True
        )
        
        db.add(new_topic)
        db.commit()
        db.refresh(new_topic)
        
        print(f"新しいお題を保存しました。ID: {new_topic.id}")
        return TopicGenerationResponse(message=f"新しいお題を生成しました。ID: {new_topic.id}")
    except Exception as e:
        print(f"お題の生成中にエラーが発生しました: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"お題の生成中にエラーが発生しました: {str(e)}"
        )

# 最新のお題リストを取得
@router.get("/", response_model=List[TopicResponse])
async def get_topics(limit: int = 10, offset: int = 0, db: Session = Depends(get_db)):
    topics = db.query(Topic).order_by(Topic.created_at.desc()).offset(offset).limit(limit).all()
    return topics

# バックグラウンドで実行するお題生成関数
async def _generate_and_save_topic(db: Session):
    # 古いアクティブなお題を非アクティブに設定
    old_topics = db.query(Topic).filter(Topic.is_active == True).all()
    for topic in old_topics:
        topic.is_active = False
    
    # 新しいお題を生成
    content = generate_topic()
    
    # 有効期限は4時間後
    expires_at = datetime.now(pytz.UTC) + timedelta(hours=4)
    
    # お題を保存
    new_topic = Topic(
        content=content,
        expires_at=expires_at,
        is_active=True
    )
    
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    
    return new_topic 