"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { TrendingUp, BookOpen, Target, Calendar } from "lucide-react";
import { booksApi } from "@/lib/api/books";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    thisMonth: 0,
    totalCollection: 0,
    annualGoal: 0,
    goalProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [booksData, goalData, monthData] = await Promise.all([
        booksApi.getAllBooks(),
        booksApi.getAnnualGoal(),
        booksApi.getCurrentMonthBooks(),
      ]);

      setStats({
        thisMonth: monthData.length,
        totalCollection: booksData.count,
        annualGoal: goalData.annual_goal,
        goalProgress: goalData.progress_percentage,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayStats = [
    {
      label: "This Month",
      value: `${stats.thisMonth} Books`,
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      label: "Total Collection",
      value: `${stats.totalCollection} Books`,
      icon: BookOpen,
      color: "text-emerald-400",
    },
    {
      label: "Annual Goal",
      value: `${stats.annualGoal} Books`,
      icon: Target,
      color: "text-amber-400",
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-[#020617] text-white items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#020617] text-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,#1e1b4b_0%,#020617_100%)]">
          <header className="px-8 h-20 flex items-center justify-between border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-10">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </header>

          <div className="p-8 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayStats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-slate-400 text-sm font-medium">
                      {stat.label}
                    </p>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </h3>
                </div>
              ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl min-h-[450px]">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-xl font-bold">Reading Progress</h2>
                  <p className="text-slate-400 text-sm">
                    {stats.goalProgress}% of annual goal completed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Books
                  </span>
                </div>
              </div>

              {/* Simple Progress Bar */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{stats.goalProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all"
                    style={{ width: `${stats.goalProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
