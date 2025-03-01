import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });

export const metadata: Metadata = {
  title: "リアルタイム大喜利 - AIが評価する大喜利アプリ",
  description: "AIが4時間ごとに大喜利のお題を生成し、回答を評価するリアルタイム大喜利アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className={`${inter.variable} ${robotoMono.variable} font-sans bg-neutral-950 text-neutral-200 min-h-screen`}>
        <header className="border-b border-neutral-800 py-6">
          <div className="container max-w-6xl mx-auto px-4 flex justify-between items-center">
            <a href="/" className="group flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">大</div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">リアルタイム大喜利</span>
            </a>
            <div className="text-sm text-neutral-400 font-mono">
              <span>AI Powered Ohgiri</span>
            </div>
          </div>
        </header>
        
        <main className="container max-w-6xl mx-auto px-4 py-10">
          {children}
        </main>
        
        <footer className="border-t border-neutral-800 py-10 mt-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">大</div>
                  <h3 className="text-xl font-bold tracking-tight">リアルタイム大喜利</h3>
                </div>
                <p className="text-neutral-400 text-sm">AIが大喜利のお題を生成し、回答を評価する次世代プラットフォーム</p>
              </div>
              <div className="text-center md:text-right text-neutral-400 text-sm">
                <p>&copy; {new Date().getFullYear()} リアルタイム大喜利</p>
                <p className="mt-1 font-mono">Powered by AI & Creativity</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
