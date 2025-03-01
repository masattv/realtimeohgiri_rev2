import axios from 'axios';
import { Answer } from '../types';

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

// プロキシルートを使って内部APIパスを構築
const getProxyPath = (path: string) => {
  // 先頭のスラッシュを削除（ある場合）
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // /api を削除（ある場合）
  const finalPath = cleanPath.startsWith('api/') 
    ? cleanPath.substring(4) 
    : cleanPath;
    
  // Vercel環境では直接/apiパスを使用する
  return `/api/${finalPath}`;
};

// APIクライアントの設定
const apiClient = axios.create({
  // 同一オリジンのプロキシURLを使用
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

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
    const url = getProxyPath('topics/active');
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
    const url = getProxyPath(`topics/${topicId}`);
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
    const url = getProxyPath(`topics?limit=${limit}&offset=${offset}`);
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
    const url = getProxyPath('topics/generate');
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
    const url = getProxyPath('topics/generate/force');
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
    const url = getProxyPath('answers');
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
    const url = getProxyPath(`answers/topic/${topicId}`);
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
    const url = getProxyPath(`answers/${answerId}`);
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
    const url = getProxyPath('answers/evaluate');
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