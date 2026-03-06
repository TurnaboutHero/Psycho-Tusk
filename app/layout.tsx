import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "심리 Tusk 게임",
  description: "심리 Tusk 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
