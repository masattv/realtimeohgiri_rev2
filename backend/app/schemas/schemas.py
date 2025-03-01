from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Topic関連のスキーマ
class TopicBase(BaseModel):
    content: str = Field(..., description="大喜利のお題内容")

class TopicCreate(TopicBase):
    pass

class TopicResponse(BaseModel):
    id: Optional[int] = None
    content: Optional[str] = None
    created_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None
    message: Optional[str] = None
    
    class Config:
        from_attributes = True

# トピック生成レスポンス用のスキーマ
class TopicGenerationResponse(BaseModel):
    message: str = Field(..., description="トピック生成に関するメッセージ")
    
    class Config:
        from_attributes = True

# Answer関連のスキーマ
class AnswerBase(BaseModel):
    content: str = Field(..., description="回答内容")
    user_name: str = Field(..., min_length=1, max_length=100, description="回答者の名前")

class AnswerCreate(AnswerBase):
    topic_id: int = Field(..., description="回答対象のお題ID")
    user_id: str = Field(..., description="回答者のユニークID")

class AnswerResponse(AnswerBase):
    id: int
    topic_id: int
    created_at: datetime
    user_id: str
    ai_score: Optional[int] = None
    ai_comment: Optional[str] = None
    vote_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class AnswerWithAIEvaluation(AnswerResponse):
    ai_score: int
    ai_comment: str
    
    class Config:
        from_attributes = True

# トピック詳細（回答を含む）スキーマ
class TopicDetail(TopicResponse):
    answers: List[AnswerResponse] = []
    
    class Config:
        from_attributes = True

# AI評価リクエストスキーマ
class AIEvaluationRequest(BaseModel):
    answer_id: int = Field(..., description="評価する回答のID")

# 投票関連のスキーマ
class VoteBase(BaseModel):
    answer_id: int = Field(..., description="投票対象の回答ID")
    user_id: str = Field(..., description="投票者のユニークID")

class VoteCreate(VoteBase):
    pass

class VoteResponse(VoteBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True 