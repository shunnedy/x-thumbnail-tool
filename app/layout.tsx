import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grid Compositor — X / Twitter 4枚グリッド投稿ツール",
  description:
    "1枚の画像を4分割し、L字テクスチャで結合部をカモフラージュ。X（Twitter）の4枚グリッド投稿で1枚の絵に見せるクリエイター向けツール。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
