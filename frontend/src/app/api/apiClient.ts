import axios from 'axios';
import { Answer } from '../types';

// APIクライアントの設定
const apiClient = axios.create({
  // バックエンドのベースURL（ngrok URLを使用）
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://f42f-2402-6b00-be46-7100-40bc-4f6-7e50-f89f.ngrok-free.app/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// デバッグ用ログ関数
const logRequest = (method: string, url: string, data: any = null) => {
  console.log(`🔍 API ${method} リクエスト: ${url}`, data ? { data } : '');
};

const logResponse = (method: string, url: string, response: any) => {
  console.log(`✅ API ${method} レスポンス: ${url}`, response);
};

const logError = (method: string, url: string, error: any) => {
  console.error(`❌ API ${method} エラー: ${url}`, error);
  console.error('エラーの詳細:', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    config: error.config
  });
};

// インターセプターを追加
apiClient.interceptors.request.use(
  (config) => {
    console.log('📤 リクエスト送信:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('📤 リクエストエラー:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 レスポンス受信:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('📥 レスポンスエラー:', {
      message: error.message,
      config: error.config,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'レスポンスなし'
    });
    return Promise.reject(error);
  }
);

// APIメソッド
export const topicsApi = {
  // アクティブなお題を取得
  getActiveTopic: async () => {
    const url = 'topics/active';
    logRequest('GET', url);
    try {
      const response = await apiClient.get(url);
      logResponse('GET', url, response.data);
      return response.data;
    } catch (error) {
      logError('GET', url, error);
      throw error;
    }
  },

  // 特定のお題の詳細を取得（回答も含む）
  getTopicDetail: async (topicId: number) => {
    const url = `topics/${topicId}`;
    logRequest('GET', url);
    try {
      const response = await apiClient.get(url);
      logResponse('GET', url, response.data);
      return response.data;
    } catch (error) {
      logError('GET', url, error);
      throw error;
    }
  },

  // お題一覧を取得（ページネーション対応）
  getTopics: async (limit: number = 5, offset: number = 0) => {
    const url = `topics?limit=${limit}&offset=${offset}`;
    logRequest('GET', url);
    try {
      const response = await apiClient.get(url);
      logResponse('GET', url, response.data);
      return response.data;
    } catch (error) {
      logError('GET', url, error);
      throw error;
    }
  },

  // 新しいお題を生成
  generateTopic: async () => {
    const url = 'topics/generate';
    logRequest('POST', url);
    try {
      const response = await apiClient.post(url);
      logResponse('POST', url, response.data);
      return response.data;
    } catch (error) {
      logError('POST', url, error);
      throw error;
    }
  },

  // 強制的に新しいお題を生成
  generateTopicForce: async () => {
    const url = 'topics/generate/force';
    logRequest('POST', url);
    try {
      const response = await apiClient.post(url);
      logResponse('POST', url, response.data);
      return response.data;
    } catch (error) {
      logError('POST', url, error);
      throw error;
    }
  },
};

export const answersApi = {
  // 回答を投稿
  createAnswer: async (data: { topic_id: number, content: string, user_name: string, user_id: string }) => {
    const url = 'answers';
    logRequest('POST', url, data);
    try {
      const response = await apiClient.post(url, data);
      logResponse('POST', url, response.data);
      return response.data;
    } catch (error) {
      logError('POST', url, error);
      throw error;
    }
  },

  // トピックに対する回答一覧を取得
  getAnswersByTopic: async (topicId: number) => {
    const url = `answers/topic/${topicId}`;
    logRequest('GET', url);
    try {
      const response = await apiClient.get(url);
      logResponse('GET', url, response.data);
      return response.data;
    } catch (error) {
      logError('GET', url, error);
      throw error;
    }
  },

  // 特定の回答を取得
  getAnswer: async (answerId: number) => {
    const url = `answers/${answerId}`;
    logRequest('GET', url);
    try {
      const response = await apiClient.get(url);
      logResponse('GET', url, response.data);
      return response.data;
    } catch (error) {
      logError('GET', url, error);
      throw error;
    }
  },

  // 回答をAIで評価
  evaluateAnswer: async (answerId: number) => {
    const url = 'answers/evaluate';
    const requestData = { answer_id: answerId };
    logRequest('POST', url, requestData);
    try {
      const response = await apiClient.post(url, requestData);
      logResponse('POST', url, response.data);
      return response.data;
    } catch (error) {
      logError('POST', url, error);
      throw error;
    }
  }
};

export default apiClient; 