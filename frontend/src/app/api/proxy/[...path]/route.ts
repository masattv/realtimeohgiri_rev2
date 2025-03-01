import { NextRequest, NextResponse } from 'next/server';

// バックエンドAPI URLの設定（環境変数または指定のURL）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://b99a-2402-6b00-be46-7100-a824-f355-9d94-3095.ngrok-free.app/api';

/**
 * API へのプロキシリクエストを処理する関数
 */
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  
  // パラメータをログに出力
  console.log(`GET リクエストのパラメータ解決: ${path}`);
  
  try {
    // バックエンドAPIにリクエストを転送
    const apiUrl = `${API_BASE_URL}/${path}${request.nextUrl.search}`;
    console.log(`バックエンドURL: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // レスポンスのクローンを作成して内容を確認
    const responseClone = response.clone();
    
    try {
      // JSON レスポンスを解析
      const data = await responseClone.json();
      
      // エラーレスポンスの場合の処理
      if (!response.ok) {
        console.error(`バックエンドからのエラー: ${response.status} ${response.statusText}`, data);
        return NextResponse.json(data, { status: response.status });
      }
      
      return NextResponse.json(data);
    } catch (error) {
      // JSON 以外のレスポンスの場合は素のレスポンスを返す
      console.log('バックエンドからのレスポンスは JSON ではありません');
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        },
      });
    }
  } catch (error) {
    console.error(`プロキシエラー: ${error}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * API へのプロキシPOSTリクエストを処理する関数
 */
export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  
  // パラメータをログに出力
  console.log(`POST リクエストのパラメータ解決: ${path}`);
  
  try {
    // リクエストボディの取得
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      console.log('JSON リクエストボディがありません');
      requestBody = null;
    }
    
    // バックエンドAPIにリクエストを転送
    const apiUrl = `${API_BASE_URL}/${path}`;
    console.log(`バックエンドURL: ${apiUrl}`, requestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });
    
    // レスポンスのクローンを作成して内容を確認
    const responseClone = response.clone();
    
    try {
      // JSON レスポンスを解析
      const data = await responseClone.json();
      
      // エラーレスポンスの場合の処理
      if (!response.ok) {
        console.error(`バックエンドからのエラー: ${response.status} ${response.statusText}`, data);
        return NextResponse.json(data, { status: response.status });
      }
      
      return NextResponse.json(data);
    } catch (error) {
      // JSON 以外のレスポンスの場合は素のレスポンスを返す
      console.log('バックエンドからのレスポンスは JSON ではありません');
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        },
      });
    }
  } catch (error) {
    console.error(`プロキシエラー: ${error}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 