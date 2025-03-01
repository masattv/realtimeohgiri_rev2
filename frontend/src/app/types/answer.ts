export interface Answer {
  id: number;
  topic_id: number;
  content: string;
  user_name: string;
  user_id: string;
  created_at: string;
  score?: number;
  evaluation?: string;
} 