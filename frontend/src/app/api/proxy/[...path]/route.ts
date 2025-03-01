import { NextRequest, NextResponse } from 'next/server';

// バックエンドAPIのURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  console.log('🔄 GETリクエスト開始', request.url);
  const resolvedParams = await params;
  console.log('🔄 パラメータ解決', resolvedParams);
  
  const path = resolvedParams.path.join('/');
  const url = new URL(request.url);
  const apiURL = `${API_BASE_URL}/${path}${url.search}`;

  console.log(`🔄 プロキシGETリクエスト: ${apiURL}`);

  try {
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ バックエンドエラー: ${apiURL}`, {
        status: response.status,
        statusText: response.statusText
      });
      
      // レスポンスがJSONかどうかを確認
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          return NextResponse.json(errorData, { status: response.status });
        } catch (e) {
          console.error('❌ JSONパースエラー:', e);
          return NextResponse.json(
            { error: await response.text() },
            { status: response.status }
          );
        }
      } else {
        const errorText = await response.text();
        return NextResponse.json(
          { error: errorText },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log(`✅ プロキシGETレスポンス: ${apiURL}`, data);
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`❌ プロキシエラー: ${apiURL}`, error);
    return NextResponse.json(
      { error: 'API通信エラー' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  console.log('🔄 POSTリクエスト開始', request.url);
  const resolvedParams = await params;
  console.log('🔄 パラメータ解決', resolvedParams);
  
  const path = resolvedParams.path.join('/');
  const apiURL = `${API_BASE_URL}/${path}`;
  
  console.log(`🔄 プロキシPOSTリクエスト: ${apiURL}`);
  
  try {
    let requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // リクエストボディの処理
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const body = await request.json();
        console.log('🔄 リクエストボディ', body);
        requestOptions.body = JSON.stringify(body);
      } catch (e) {
        console.log('🔄 JSONボディなし');
      }
    } else {
      console.log('🔄 リクエストボディなし');
    }
    
    const response = await fetch(apiURL, requestOptions);
    
    if (!response.ok) {
      console.error(`❌ バックエンドエラー: ${apiURL}`, {
        status: response.status,
        statusText: response.statusText
      });
      
      // レスポンスがJSONかどうかを確認
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          return NextResponse.json(errorData, { status: response.status });
        } catch (e) {
          console.error('❌ JSONパースエラー:', e);
          return NextResponse.json(
            { error: await response.text() },
            { status: response.status }
          );
        }
      } else {
        const errorText = await response.text();
        return NextResponse.json(
          { error: errorText },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log(`✅ プロキシPOSTレスポンス: ${apiURL}`, data);
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`❌ プロキシエラー: ${apiURL}`, error);
    return NextResponse.json(
      { error: 'API通信エラー' },
      { status: 500 }
    );
  }
} 