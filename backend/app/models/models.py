from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import pytz
from datetime import datetime

# 日本時間を取得する関数 - SQLite互換バージョン
def get_jst_time():
    # SQLiteでは単純にfunc.now()を使い、Pythonでタイムゾーン変換を行う
    return func.now()

class Topic(Base):
    """大喜利のお題モデル"""
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # リレーションシップ
    answers = relationship("Answer", back_populates="topic", cascade="all, delete-orphan")

class Answer(Base):
    """大喜利の回答モデル"""
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    content = Column(Text, nullable=False)
    user_name = Column(String(100), nullable=False)
    user_id = Column(String(100), nullable=False)  # 同一ユーザー判定用のID - このカラムが必要
    created_at = Column(DateTime, server_default=func.now())
    
    # AI評価
    ai_score = Column(Integer, nullable=True)
    ai_comment = Column(Text, nullable=True)
    
    # リレーションシップ
    topic = relationship("Topic", back_populates="answers")
    votes = relationship("Vote", back_populates="answer", cascade="all, delete-orphan")

class Vote(Base):
    """回答への投票モデル"""
    __tablename__ = "votes"
    
    id = Column(Integer, primary_key=True, index=True)
    answer_id = Column(Integer, ForeignKey("answers.id"), nullable=False)
    user_id = Column(String(100), nullable=False)  # 投票者のID
    created_at = Column(DateTime, server_default=func.now())
    
    # リレーションシップ
    answer = relationship("Answer", back_populates="votes") 