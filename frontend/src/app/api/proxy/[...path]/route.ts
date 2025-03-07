import { NextRequest, NextResponse } from 'next/server';

// バックエンドAPIのベースURL
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://realtimeohgiri-backend.onrender.com/api'
  : 'http://localhost:8000/api';

// CORSヘッダー
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONSリクエスト（プリフライト）の処理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// API Gateway - バックエンドへのプロキシ
export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = new URL(req.url);
  const queryString = url.search;
  
  try {
    const response = await fetch(`${API_BASE_URL}/${path}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(`Error proxying GET request to /${path}:`, error);
    return NextResponse.json(
      { error: 'APIリクエストの処理中にエラーが発生しました' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const body = await req.json();
  
  try {
    const response = await fetch(`${API_BASE_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(`Error proxying POST request to /${path}:`, error);
    return NextResponse.json(
      { error: 'APIリクエストの処理中にエラーが発生しました' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// 他のHTTPメソッド（PUT, DELETE）も同様に追加できます 