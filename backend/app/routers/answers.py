from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from sqlalchemy import func

from app.database import get_db
from app.models.models import Answer, Topic, Vote
from app.schemas.schemas import AnswerCreate, AnswerResponse, AnswerWithAIEvaluation, AIEvaluationRequest
from app.services.ai_service import evaluate_answer

router = APIRouter()

# 回答を作成
@router.post("/", response_model=AnswerResponse)
async def create_answer(answer: AnswerCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # お題が存在するか確認
    topic = db.query(Topic).filter(Topic.id == answer.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="指定されたお題が見つかりません")
    
    # 同じユーザーからの1分以内の投稿をチェック
    one_minute_ago = datetime.now() - timedelta(minutes=1)
    recent_answer = db.query(Answer).filter(
        Answer.user_id == answer.user_id,
        Answer.created_at >= one_minute_ago
    ).first()
    
    if recent_answer:
        raise HTTPException(status_code=429, detail="1分間に1回しか回答できません。少し待ってからお試しください。")
    
    # 回答を保存
    db_answer = Answer(
        topic_id=answer.topic_id,
        content=answer.content,
        user_name=answer.user_name,
        user_id=answer.user_id
    )
    
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    
    # バックグラウンドでAI評価を実行
    background_tasks.add_task(_evaluate_answer_with_ai, db_answer.id, db)
    
    return db_answer

# お題に対する回答を取得
@router.get("/topic/{topic_id}", response_model=List[AnswerResponse])
async def get_answers_by_topic(topic_id: int, db: Session = Depends(get_db)):
    # お題が存在するか確認
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="指定されたお題が見つかりません")
    
    # 回答を取得し、各回答の投票数を計算
    answers = db.query(Answer).filter(Answer.topic_id == topic_id).all()
    
    # 各回答に投票数を追加
    for answer in answers:
        answer.vote_count = db.query(func.count("*")).select_from(Vote).filter(Vote.answer_id == answer.id).scalar() or 0
    
    return answers

# 特定の回答を取得
@router.get("/{answer_id}", response_model=AnswerResponse)
async def get_answer(answer_id: int, db: Session = Depends(get_db)):
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="指定された回答が見つかりません")
    
    # 投票数を取得
    answer.vote_count = db.query(func.count("*")).select_from(Vote).filter(Vote.answer_id == answer.id).scalar() or 0
    
    return answer

# 手動でAI評価を実行
@router.post("/evaluate", response_model=AnswerWithAIEvaluation)
async def request_ai_evaluation(request: AIEvaluationRequest, db: Session = Depends(get_db)):
    answer = db.query(Answer).filter(Answer.id == request.answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="指定された回答が見つかりません")
    
    topic = db.query(Topic).filter(Topic.id == answer.topic_id).first()
    
    # AI評価を実行
    evaluation = evaluate_answer(topic.content, answer.content)
    
    # 評価を保存
    answer.ai_score = evaluation["score"]
    answer.ai_comment = evaluation["comment"]
    
    db.commit()
    db.refresh(answer)
    
    return answer

# バックグラウンドでAI評価を実行する関数
async def _evaluate_answer_with_ai(answer_id: int, db: Session):
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        return
    
    topic = db.query(Topic).filter(Topic.id == answer.topic_id).first()
    
    # AI評価を実行
    evaluation = evaluate_answer(topic.content, answer.content)
    
    # 評価を保存
    answer.ai_score = evaluation["score"]
    answer.ai_comment = evaluation["comment"]
    
    db.commit() 