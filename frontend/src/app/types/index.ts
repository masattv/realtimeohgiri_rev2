// お題の型定義
export interface Topic {
  id: number;
  content: string;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  answers?: Answer[];
}

// お題の詳細（回答を含む）
export interface TopicDetail extends Topic {
  answers: Answer[];
}

// 回答の型定義
export interface Answer {
  id: number;
  topic_id: number;
  content: string;
  user_name: string;
  user_id: string;
  created_at: string;
  ai_score?: number;
  ai_comment?: string;
  vote_count?: number;
}

// 回答作成フォームの入力値
export interface AnswerFormValues {
  content: string;
  user_name: string;
}

export interface CreateAnswerRequest {
  topic_id: number;
  content: string;
  user_name: string;
  user_id: string;
} 