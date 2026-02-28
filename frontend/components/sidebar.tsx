"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  LibraryBig,
  Heart,
  FileText,
  MessageSquare,
  LogOut,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const menu = [
    { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { name: "My Library", icon: LibraryBig, path: "/library" },
    { name: "Favorite", icon: Heart, path: "/favorites" },
    { name: "Notes", icon: FileText, path: "/notes" },
    { name: "Chat Bot", icon: MessageSquare, path: "/chat" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <aside
        className={cn(
          "bg-[#0f172a]/50 border-r border-white/5 flex flex-col h-screen sticky top-0 transition-all duration-300 relative z-10", // 🔥 z-50 → z-10
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1e293b] border border-white/10 flex items-center justify-center z-50 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* User Info */}
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
              <User size={16} className="text-slate-400" />
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap">
                <h2 className="text-xs font-bold text-emerald-400 leading-none">
                  {user?.first_name || user?.username || "User"}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-lg font-black tracking-tighter text-white">
                    Libro
                  </span>
                  <BookOpen size={14} className="text-emerald-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 px-3">
          {menu.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 cursor-pointer transition-all rounded-lg",
                  isActive
                    ? "bg-indigo-600/20 text-white border border-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                  isCollapsed && "justify-center px-0",
                )}
              >
                <item.icon
                  size={20}
                  className={cn("shrink-0", isActive && "text-indigo-400")}
                />
                {!isCollapsed && (
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-white/5">
          <div
            onClick={() => setIsLogoutModalOpen(true)}
            className={cn(
              "flex items-center gap-4 text-rose-500 cursor-pointer hover:bg-rose-500/10 p-2 rounded-lg transition-all",
              isCollapsed && "justify-center p-0 hover:bg-transparent",
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-sm font-bold">Log out</span>}
          </div>
        </div>
      </aside>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsLogoutModalOpen(false)}
          />
          <div className="relative w-full max-w-[400px] bg-[#0f172a] border border-white/10 rounded-[32px] p-10 shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <AlertTriangle className="text-rose-500" size={28} />
            </div>

            <h2 className="text-2xl font-bold mb-4 text-white">Log out</h2>

            <p className="text-slate-400 mb-10 leading-relaxed px-4">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-4 rounded-2xl bg-[#e11d48] hover:bg-[#be123c] text-white font-bold transition-all shadow-lg shadow-rose-900/20"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
