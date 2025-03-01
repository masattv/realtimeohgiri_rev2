import { Suspense } from 'react';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import TopicDetailClient from './TopicDetailClient';

type Props = {
  params: {
    id: string;
  };
};

export default async function TopicDetailPage({ params }: Props) {
  // Next.js 15では、paramsオブジェクトを使用する前にawaitが必要
  const resolvedParams = await params;
  console.log('🔄 トピック詳細ページパラメータ解決', resolvedParams);

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="flex items-center text-blue-500 hover:text-blue-700">
          <FiArrowLeft className="mr-2" />
          トップに戻る
        </Link>
      </div>
      
      <Suspense fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      }>
        <TopicDetailClient topicId={resolvedParams.id} />
      </Suspense>
    </main>
  );
} 