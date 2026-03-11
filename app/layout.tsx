import type { Metadata } from "next";
import { Bebas_Neue } from 'next/font/google';
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
});

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
      <body className={`antialiased ${bebasNeue.variable}`}>
        {children}
      </body>
    </html>
  );
}
