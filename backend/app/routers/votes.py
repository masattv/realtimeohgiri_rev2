from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from sqlalchemy import func

from app.database import get_db
from app.models.models import Vote, Answer, Topic
from app.schemas.schemas import VoteCreate, VoteResponse
from app.services.ai_service import evaluate_answer, reevaluate_popular_answer

router = APIRouter(prefix="/votes", tags=["votes"])

# 投票を作成
@router.post("/", response_model=VoteResponse)
async def create_vote(vote: VoteCreate, db: Session = Depends(get_db)):
    # 回答が存在するか確認
    answer = db.query(Answer).filter(Answer.id == vote.answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="指定された回答が見つかりません")
    
    # 同じユーザーが同じ回答に投票していないか確認
    existing_vote = db.query(Vote).filter(
        Vote.user_id == vote.user_id,
        Vote.answer_id == vote.answer_id
    ).first()
    
    if existing_vote:
        raise HTTPException(status_code=400, detail="すでにこの回答に投票しています")
    
    # 投票を保存
    db_vote = Vote(
        answer_id=vote.answer_id,
        user_id=vote.user_id
    )
    
    db.add(db_vote)
    db.commit()
    db.refresh(db_vote)
    
    # 投票数を取得
    vote_count = db.query(func.count("*")).select_from(Vote).filter(Vote.answer_id == vote.answer_id).scalar()
    
    # 投票数が一定数（例：5票）以上かつ最も投票された回答の場合、AI評価を更新
    if vote_count >= 5:
        # そのお題の中で最も投票された回答かチェック
        topic_id = answer.topic_id
        most_voted_answer = db.query(Answer)\
            .join(Vote, Answer.id == Vote.answer_id)\
            .filter(Answer.topic_id == topic_id)\
            .group_by(Answer.id)\
            .order_by(func.count(Vote.id).desc())\
            .first()
        
        # この回答が最も投票された回答であれば、AI評価を更新
        if most_voted_answer and most_voted_answer.id == answer.id:
            topic = db.query(Topic).filter(Topic.id == topic_id).first()
            
            # 人気回答のAI再評価を実行
            evaluation = reevaluate_popular_answer(topic.content, answer.content, vote_count)
            
            # 評価を更新
            answer.ai_score = evaluation["score"]
            answer.ai_comment = evaluation["comment"]
            db.commit()
    
    return db_vote

# 回答に対する投票一覧を取得
@router.get("/answer/{answer_id}", response_model=List[VoteResponse])
async def get_votes_by_answer(answer_id: int, db: Session = Depends(get_db)):
    # 回答が存在するか確認
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="指定された回答が見つかりません")
    
    votes = db.query(Vote).filter(Vote.answer_id == answer_id).all()
    return votes

# 投票数を取得
@router.get("/count/{answer_id}")
async def get_vote_count(answer_id: int, db: Session = Depends(get_db)):
    # 回答が存在するか確認
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="指定された回答が見つかりません")
    
    vote_count = db.query(func.count("*")).select_from(Vote).filter(Vote.answer_id == answer_id).scalar() or 0
    return {"answer_id": answer_id, "vote_count": vote_count} 