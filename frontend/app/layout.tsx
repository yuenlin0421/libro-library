import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // 定義 CSS 變數
});

export const metadata: Metadata = {
  title: "Libro - Book Management System",
  description: "AI-powered book management and reading assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 加上 class="dark" 確保顏色套用
    <html lang="en" className={`dark ${inter.variable}`}>
      <AuthProvider>
        <body className="font-sans">{children}</body>
        <Toaster />
      </AuthProvider>
    </html>
  );
}
