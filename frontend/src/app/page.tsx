"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { topicsApi } from './api/apiClient';
import { Topic } from './types';
import { FiRefreshCw, FiClock, FiArrowRight, FiMessageCircle, FiAlertCircle } from 'react-icons/fi';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function Home() {
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [debug, setDebug] = useState<any>(null);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<string>('');
  const [isNearExpiry, setIsNearExpiry] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // アクティブなお題と最近のお題を取得
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    console.log('📌 fetchTopics 開始');
    try {
      console.log('📌 getActiveTopic 呼び出し前');
      const activeTopicData = await topicsApi.getActiveTopic();
      console.log('📌 getActiveTopic 呼び出し後', activeTopicData);
      setActiveTopic(activeTopicData);
      setError('');
    } catch (err: any) {
      console.error('📌 アクティブなお題の取得結果:', err);
      
      // 404エラーは正常系として扱う
      if (err.response?.status === 404) {
        setActiveTopic(null);
        setError('');
      } else {
        console.error('📌 お題の取得に失敗しました', err);
        
        // エラー詳細の保存
        setDebug({
          message: err.message,
          name: err.name,
          stack: err.stack,
          config: err.config,
          response: err.response,
          isAxiosError: err.isAxiosError
        });
        
        setError(`お題の取得に失敗しました: ${err.message || 'Unknown error'}`);
      }
    }
    
    try {
      console.log('📌 getTopics 呼び出し前');
      const recentTopicsData = await topicsApi.getTopics(5);
      console.log('📌 getTopics 呼び出し後', recentTopicsData);
      setRecentTopics(recentTopicsData);
    } catch (err: any) {
      console.error('📌 お題の取得に失敗しました', err);
      
      // エラー詳細の保存
      setDebug({
        message: err.message,
        name: err.name,
        stack: err.stack,
        config: err.config,
        response: err.response,
        isAxiosError: err.isAxiosError
      });
      
      setError(`お題の取得に失敗しました: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      console.log('📌 fetchTopics 完了');
    }
  }, []);

  // 新しいお題を生成
  const generateNewTopic = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await topicsApi.generateTopic();
      setMessage(response.message);
      await fetchTopics();
    } catch (err) {
      console.error('お題の生成に失敗しました', err);
      setError('お題の生成に失敗しました。後でもう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 新しいお題を強制的に生成
  const forceGenerateNewTopic = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await topicsApi.generateTopicForce();
      setMessage(response.message);
      
      // 少し待ってからトピックを再取得
      setTimeout(async () => {
        await fetchTopics();
      }, 3000);
    } catch (err) {
      console.error('お題の強制生成に失敗しました', err);
      setError('お題の強制生成に失敗しました。後でもう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 有効期限までの時間を更新
  const updateExpiryTime = useCallback(() => {
    if (activeTopic?.expires_at) {
      const expiryDate = new Date(activeTopic.expires_at);
      const now = new Date();
      const minutesUntilExpiry = differenceInMinutes(expiryDate, now);
      
      // 期限切れまで30分以内の場合は警告を表示
      setIsNearExpiry(minutesUntilExpiry <= 30 && minutesUntilExpiry > 0);
      
      // 期限切れの場合はトピックを再取得
      if (minutesUntilExpiry <= 0) {
        fetchTopics();
        return;
      }
      
      setTimeUntilExpiry(formatDistanceToNow(expiryDate, { addSuffix: true, locale: ja }));
    }
  }, [activeTopic?.expires_at, fetchTopics]);

  // 初回ロード時にデータを取得
  useEffect(() => {
    console.log('📌 useEffect 発火 - 初回データ取得開始');
    fetchTopics();
  }, [fetchTopics]);

  // 1分ごとに有効期限までの時間を更新
  useEffect(() => {
    updateExpiryTime();
    const interval = setInterval(updateExpiryTime, 60000);
    return () => clearInterval(interval);
  }, [updateExpiryTime]);

  // 5分ごとにデータを自動更新
  useEffect(() => {
    const interval = setInterval(fetchTopics, 300000);
    return () => clearInterval(interval);
  }, [fetchTopics]);

  // 日付を相対時間に変換（例：「1時間前」）
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ja });
    } catch (e) {
      return dateString;
    }
  };

  // データ取得のトライキャッチ処理を強化
  const fetchActiveTopic = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const topicData = await topicsApi.getActiveTopic();
      console.log('アクティブなお題を取得しました:', topicData);
      setActiveTopic(topicData);
      setError('');
    } catch (err: any) {
      console.error('アクティブなお題の取得に失敗しました:', err);
      setError(err?.message || 'アクティブなお題の取得に失敗しました');
      // 続行できるようエラー状態も適切に設定
      setActiveTopic(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 max-w-4xl mx-auto mt-4">
          <strong className="font-bold">エラー: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="space-y-16">
        <section className="relative">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl opacity-20"></div>
          
          <div className="relative z-10 text-center space-y-6 py-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">リアルタイム大喜利</h1>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              AIが生成したお題に対して、あなたの面白い回答を投稿しよう。他のユーザーの回答を見て楽しんだり、AIによる評価を受けたりできます。
            </p>
          </div>
        </section>
        
        {debug && (
          <div className="glass-card p-4 border-yellow-900/50 text-yellow-300 text-xs overflow-auto max-h-80">
            <h3 className="font-bold mb-2">デバッグ情報</h3>
            <pre>{JSON.stringify(debug, null, 2)}</pre>
          </div>
        )}

        {message && (
          <div className="glass-card p-4 border-indigo-900/50 text-indigo-300 text-sm">
            {message}
          </div>
        )}
        
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold gradient-text">現在のお題</h2>
            <div className="flex space-x-3">
              <button 
                onClick={generateNewTopic}
                disabled={loading}
                className="btn btn-secondary text-sm"
              >
                <FiRefreshCw className={`mr-2 inline ${loading ? 'animate-spin' : ''}`} />
                更新する
              </button>
              <button 
                onClick={forceGenerateNewTopic}
                disabled={loading}
                className="btn btn-danger text-sm"
              >
                <FiRefreshCw className={`mr-2 inline ${loading ? 'animate-spin' : ''}`} />
                強制更新
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="card animate-pulse">
              <div className="h-8 bg-neutral-800 rounded-md w-3/4 mb-4"></div>
              <div className="h-4 bg-neutral-800 rounded-md w-1/4"></div>
            </div>
          ) : activeTopic ? (
            <div className="glass-card p-8 group hover:bg-white/10 transition-all duration-300">
              <p className="text-2xl md:text-3xl font-medium mb-6">{activeTopic.content}</p>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-neutral-400 font-mono text-sm">
                    <FiClock className="mr-2" />
                    <span>作成: {formatRelativeTime(activeTopic.created_at)}</span>
                  </div>
                  <div className={`flex items-center font-mono text-sm ${isNearExpiry ? 'text-yellow-400' : 'text-neutral-400'}`}>
                    {isNearExpiry && <FiAlertCircle className="mr-2 animate-pulse" />}
                    <FiClock className="mr-2" />
                    <span>終了まで: {timeUntilExpiry}</span>
                  </div>
                </div>
                <Link 
                  href={`/topics/${activeTopic.id}`} 
                  className="btn btn-primary group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-all"
                >
                  回答する
                  <FiArrowRight className="ml-2 inline opacity-60 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-neutral-400 mb-6">現在アクティブなお題はありません。</p>
              <button 
                onClick={forceGenerateNewTopic}
                className="btn btn-primary"
              >
                新しいお題を生成する
              </button>
            </div>
          )}
        </section>
        
        <section className="space-y-6">
          <h2 className="text-2xl font-bold gradient-text">最近のお題</h2>
          {recentTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentTopics.map((topic) => (
                <Link key={topic.id} href={`/topics/${topic.id}`} className="card card-hover group">
                  <p className="text-lg font-medium mb-4 group-hover:text-white transition-colors">{topic.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-neutral-500 font-mono text-xs">
                      <FiClock className="mr-1.5" />
                      <span>{formatRelativeTime(topic.created_at)}</span>
                    </div>
                    <div className="text-neutral-500 text-sm flex items-center group-hover:text-neutral-300 transition-colors">
                      <FiMessageCircle className="mr-1.5" />
                      詳細を見る
                      <FiArrowRight className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-neutral-400">
              <p>まだお題はありません。</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
