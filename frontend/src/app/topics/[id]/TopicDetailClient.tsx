"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { topicsApi, answersApi } from '../../api/apiClient';
import { TopicDetail, Answer, AnswerFormValues } from '../../types';
import { FiClock, FiSend, FiUser, FiMessageCircle, FiAward, FiArrowLeft } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

interface TopicDetailClientProps {
  topicId: string;
}

export default function TopicDetailClient({ topicId }: TopicDetailClientProps) {
  const router = useRouter();
  const numericTopicId = parseInt(topicId);
  
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string>('');
  
  // 回答フォームの状態
  const [formValues, setFormValues] = useState<AnswerFormValues>({
    content: '',
    user_name: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // ユーザーIDを生成または取得
  useEffect(() => {
    // localStorage からユーザーIDを取得
    const storedUserId = localStorage.getItem('ohgiri_user_id');
    
    if (storedUserId) {
      setUserId(storedUserId);
      console.log('既存のユーザーID:', storedUserId);
    } else {
      // 新しいUUIDを生成して保存
      const newUserId = uuidv4();
      localStorage.setItem('ohgiri_user_id', newUserId);
      setUserId(newUserId);
      console.log('新規ユーザーID生成:', newUserId);
    }
  }, []);

  // お題の詳細とその回答を取得
  const fetchTopicDetail = async () => {
    setLoading(true);
    try {
      const data = await topicsApi.getTopicDetail(numericTopicId);
      setTopic(data);
      setError('');
    } catch (err) {
      console.error('お題の取得に失敗しました', err);
      setError('お題の取得に失敗しました。後でもう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 初回ロード時にデータを取得
  useEffect(() => {
    if (isNaN(numericTopicId)) {
      setError('無効なお題IDです');
      return;
    }
    fetchTopicDetail();
  }, [numericTopicId]);

  // フォームの入力値を更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  // 回答を送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('ユーザーIDが生成されていません。ページを再読み込みしてください。');
      return;
    }
    
    setSubmitting(true);
    console.log('🔄 回答送信開始', { ...formValues, topic_id: numericTopicId, user_id: userId });

    try {
      await answersApi.createAnswer({
        topic_id: numericTopicId,
        content: formValues.content,
        user_name: formValues.user_name,
        user_id: userId
      });
      
      toast.success('回答を送信しました！AIが評価中です...');
      setFormValues({ content: '', user_name: '' });
      
      // 回答リストを更新
      fetchTopicDetail();
    } catch (err) {
      console.error('回答の送信に失敗しました', err);
      toast.error('回答の送信に失敗しました。後でもう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  // 日付を相対時間に変換（例：「3時間前」）
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ja });
    } catch (e) {
      return dateString;
    }
  };

  if (error) {
    return (
      <div className="glass-card p-6 border-rose-900/50 text-rose-300">
        <p>{error}</p>
        <Link href="/" className="btn btn-secondary mt-4 inline-flex items-center">
          <FiArrowLeft className="mr-2" />
          トップページに戻る
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 bg-neutral-800 rounded-xl w-3/4"></div>
        <div className="h-32 bg-neutral-800 rounded-xl"></div>
        <div className="h-64 bg-neutral-800 rounded-xl"></div>
      </div>
    );
  }

  if (!topic) {
    return null;
  }

  return (
    <div className="space-y-12">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1f1f23',
          color: '#e4e4e7',
          borderRadius: '0.5rem',
        }
      }} />
      
      <div className="mb-4">
        <Link href="/" className="text-neutral-400 hover:text-white inline-flex items-center transition-colors">
          <FiArrowLeft className="mr-2" />
          トップページに戻る
        </Link>
      </div>

      <section className="relative">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl opacity-30"></div>
        
        <div className="glass-card p-8 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 gradient-text">{topic.content}</h1>
          <div className="flex items-center text-neutral-400 font-mono text-sm">
            <FiClock className="mr-2" />
            <span>{formatRelativeTime(topic.created_at)}</span>
          </div>
        </div>
      </section>
      
      <section className="space-y-6">
        <h2 className="text-xl font-bold gradient-text flex items-center">
          <FiMessageCircle className="mr-2" />
          回答する
        </h2>
        
        <form onSubmit={handleSubmit} className="glass-card p-6">
          <div className="mb-6">
            <label htmlFor="user_name" className="block text-neutral-300 font-medium mb-2">
              ニックネーム
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
                <FiUser />
              </div>
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={formValues.user_name}
                onChange={handleChange}
                placeholder="あなたの名前を入力"
                required
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-neutral-300 font-medium mb-2">
              回答内容
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-neutral-500">
                <FiMessageCircle />
              </div>
              <textarea
                id="content"
                name="content"
                value={formValues.content}
                onChange={handleChange}
                placeholder="面白い回答を考えてください..."
                required
                rows={4}
                className="input-field pl-10 resize-y"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full btn btn-primary flex justify-center items-center"
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                送信中...
              </span>
            ) : (
              <span className="flex items-center">
                <FiSend className="mr-2" />
                回答を送信
              </span>
            )}
          </button>
        </form>
      </section>
      
      <section className="space-y-6">
        <h2 className="text-xl font-bold gradient-text flex items-center">
          <FiAward className="mr-2" />
          みんなの回答 <span className="ml-2 text-neutral-400">({topic.answers.length}件)</span>
        </h2>
        
        {topic.answers.length > 0 ? (
          <div className="space-y-6">
            {topic.answers.map((answer: Answer) => (
              <div key={answer.id} className="glass-card p-6 transition-all hover:bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-lg">
                      {answer.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">{answer.user_name}</h3>
                      <p className="text-neutral-500 text-xs font-mono">{formatRelativeTime(answer.created_at)}</p>
                    </div>
                  </div>
                  {answer.ai_score && (
                    <div className={`rounded-full px-3 py-1 text-sm font-medium ${getScoreClass(answer.ai_score)}`}>
                      {answer.ai_score}/10点
                    </div>
                  )}
                </div>
                
                <p className="mb-6 text-lg">{answer.content}</p>
                
                {answer.ai_comment && (
                  <div className="glass-card p-4 border-indigo-900/30">
                    <h4 className="font-medium mb-2 text-sm text-indigo-300">AIの評価</h4>
                    <p className="text-neutral-300 text-sm">{answer.ai_comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-neutral-400">
              まだ回答はありません。最初の回答者になりましょう！
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// スコアに応じたクラスを返す関数
function getScoreClass(score: number): string {
  if (score >= 9) return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white";
  if (score >= 7) return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
  if (score >= 5) return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
  if (score >= 3) return "bg-gradient-to-r from-indigo-500 to-purple-500 text-white";
  return "bg-gradient-to-r from-neutral-600 to-neutral-700 text-white";
} 