"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
export const dynamic = "force-dynamic";

// 分離出使用 useSearchParams 的組件
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const { login, isAuthenticated } = useAuth();
  const { login, isAuthenticated, loading } = useAuth(); // 取出 loading

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      handleGoogleCallback(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleGoogleCallback = async (code: string) => {
    try {
      await login(code);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="font-display min-h-screen flex flex-col relative overflow-hidden bg-[#050508] text-white">
      {/* Mesh Gradient Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.3) 0, transparent 50%),
            radial-gradient(at 100% 0%, rgba(88, 28, 135, 0.2) 0, transparent 50%),
            radial-gradient(at 100% 100%, rgba(30, 58, 138, 0.3) 0, transparent 50%),
            radial-gradient(at 0% 100%, rgba(88, 28, 135, 0.2) 0, transparent 50%),
            radial-gradient(at 50% 50%, rgba(15, 23, 42, 1) 0, transparent 80%)
          `,
        }}
      />

      {/* Background Decorative Icons */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] text-[white] z-0">
        <span
          className="absolute text-[120px]"
          style={{ top: "10%", left: "5%" }}
        >
          📖
        </span>
        <span
          className="absolute text-[80px]"
          style={{ top: "70%", left: "15%" }}
        >
          📚
        </span>
        <span
          className="absolute text-[100px]"
          style={{ top: "20%", right: "10%" }}
        >
          📑
        </span>
        <span
          className="absolute text-[90px]"
          style={{ top: "60%", right: "5%" }}
        >
          🔖
        </span>
        <span
          className="absolute text-[60px]"
          style={{ bottom: "15%", left: "40%" }}
        >
          📔
        </span>
      </div>

      {/* Header */}
      <header className="w-full border-b border-white/10 bg-black/30 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-500" size={24} />
            <span className="text-lg font-bold tracking-tight">Libro</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl rounded-2xl border border-white/10 bg-white/5 p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]">
            <div className="text-center space-y-2 mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Welcome Back
              </h1>
              <p className="text-sm text-neutral-400">
                Sign in to access your library
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex items-center justify-center gap-3 rounded-lg text-sm font-semibold transition-all duration-200 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] h-12 px-8 shadow-lg"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className="mt-10 text-center">
              <p className="text-xs text-neutral-500 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link
                  className="underline underline-offset-4 hover:text-white transition-colors"
                  href="/"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  className="underline underline-offset-4 hover:text-white transition-colors"
                  href="/"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-neutral-400">
            <Link
              className="hover:text-white transition-colors inline-flex items-center justify-center gap-1 group"
              href="/"
            >
              <ArrowLeft
                className="text-base transition-transform group-hover:-translate-x-1"
                size={16}
              />
              Back to home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-neutral-600">
          © 2026 Libro Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// 主組件使用 Suspense 包裹
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050508] flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
