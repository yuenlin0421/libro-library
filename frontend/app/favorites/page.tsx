"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useFavorites } from "@/hooks/use-books";
import { booksApi } from "@/lib/api/books";
import { Search, Heart, X, Info } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { favorites, loading, refetch } = useFavorites();
  const [showNotification, setShowNotification] = useState(false);
  const [removedBook, setRemovedBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFavorites = favorites.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRemoveFavorite = async (id: number, title: string) => {
    try {
      await booksApi.updateBook(id, { is_favorite: false });
      setRemovedBook(title);
      setShowNotification(true);
      refetch();

      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      toast.error("Failed to remove from favorites");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-[#020617] text-white items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading favorites...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#020617] text-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[linear-gradient(135deg,#0f172a_0%,#020617_100%)]">
          <header className="px-8 h-20 flex items-center justify-between border-b border-white/5 bg-black/30 backdrop-blur-md sticky top-0 z-40 gap-8">
            <h1 className="text-3xl font-bold">Favorites</h1>
            <div className="flex flex-1 justify-end items-center gap-4 max-w-2xl">
              <div className="relative w-full group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors"
                  size={18}
                />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  placeholder="Search in favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </header>

          <div className="p-8 space-y-12">
            {/* Recently Favorited Section */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Recently Favorited{" "}
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              </h2>
              <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                {filteredFavorites.slice(0, 3).map((book) => (
                  <div
                    key={book.id}
                    className="flex-shrink-0 w-80 group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.2)] bg-slate-900"
                  >
                    {book.image_url ? (
                      <Image
                        src={book.image_url}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-slate-500">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 pr-12">
                      <h3 className="text-xl font-bold truncate">
                        {book.title}
                      </h3>
                      <p className="text-slate-400 text-sm">{book.author}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveFavorite(book.id, book.title)}
                      className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/10 text-rose-500 hover:scale-110 active:scale-95 transition-all"
                    >
                      <Heart size={24} fill="currentColor" />
                    </button>
                  </div>
                ))}

                {filteredFavorites.length === 0 && (
                  <div className="w-full h-64 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                    <Heart size={48} className="mb-4 opacity-20" />
                    <p>Your favorites list is currently empty.</p>
                  </div>
                )}
              </div>
            </section>

            {/* All Favorites Grid */}
            <section>
              <h2 className="text-xl font-bold mb-6">All Favorites</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredFavorites.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white/5 border border-white/10 p-3 rounded-xl hover:-translate-y-2 transition-all group relative"
                  >
                    <div className="aspect-[2/3] bg-slate-800 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      {book.image_url ? (
                        <Image
                          src={book.image_url}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-slate-600 text-xs italic">
                          No Cover
                        </span>
                      )}
                      <Heart
                        size={16}
                        className="absolute top-2 right-2 text-rose-500"
                        fill="currentColor"
                      />
                    </div>
                    <h4 className="text-sm font-bold truncate">{book.title}</h4>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Notification Toast */}
          {showNotification && (
            <div className="fixed bottom-8 right-8 bg-[#0f172a] border border-white/10 p-5 rounded-2xl shadow-2xl flex items-center gap-5 animate-in slide-in-from-right-10 duration-500 z-[100]">
              <div className="w-12 h-12 bg-slate-500/10 rounded-2xl flex items-center justify-center">
                <Info className="text-slate-400" size={24} />
              </div>
              <div className="pr-8">
                <h4 className="font-bold text-base text-white">
                  Removed from Favorites
                </h4>
                <p className="text-sm text-slate-400">
                  "{removedBook}" has been removed from your list.
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
