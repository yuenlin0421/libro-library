"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useBooksWithNotes } from "@/hooks/use-books";
import { booksApi } from "@/lib/api/books";
import { Search, Eye, Heart, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function NotesPage() {
  const { books, loading, refetch } = useBooksWithNotes();
  const [activeModal, setActiveModal] = useState<"view" | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenView = (note: any) => {
    setSelectedNote(note);
    setActiveModal("view");
  };

  const triggerNotification = async (
    bookId: number,
    title: string,
    currentFavorite: boolean,
  ) => {
    try {
      await booksApi.updateBook(bookId, { is_favorite: !currentFavorite });
      setSelectedNote({ title });
      setShowNotification(true);
      refetch();
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-[#020617] text-white items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading notes...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const recentNotes = filteredBooks.slice(0, 3);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#0a0c1b] text-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,#1e1b4b,#0a0c1b)]">
          <header className="p-8 flex items-center gap-6 sticky top-0 bg-[#0a0c1b]/80 backdrop-blur-md z-30">
            <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
            <div className="flex-1 max-w-2xl flex items-center gap-3">
              <div className="relative flex-1 group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                  size={18}
                />
                <input
                  className="w-full bg-slate-900/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500/50 outline-none"
                  placeholder="Search in notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </header>

          <div className="p-8 space-y-12">
            {/* Recent Notes Section */}
            <section>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                Recent Notes{" "}
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleOpenView(note)}
                    className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer shadow-2xl transition-all hover:scale-[1.01]"
                  >
                    <div className="absolute inset-0 bg-slate-800">
                      {note.image_url ? (
                        <Image
                          src={note.image_url}
                          alt={note.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-slate-600">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="text-2xl font-bold mb-1">{note.title}</h3>
                      <p className="text-sm text-slate-300 mb-4">
                        {note.author}
                      </p>
                      <div className="p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-xs italic text-slate-200 line-clamp-2">
                        "{note.personal_notes || "No notes available"}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* All Books with Notes Section */}
            <section>
              <h2 className="text-xl font-semibold mb-6 text-slate-300">
                All Books with Notes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col space-y-4 group hover:bg-white/[0.08] transition-all"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-slate-800 flex items-center justify-center">
                      {book.image_url ? (
                        <Image
                          src={book.image_url}
                          alt={book.title}
                          fill
                          className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <span className="text-slate-600">No Cover</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerNotification(
                            book.id,
                            book.title,
                            book.is_favorite,
                          );
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-rose-500 transition-colors z-10"
                      >
                        <Heart
                          size={16}
                          fill={book.is_favorite ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg truncate">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-400">{book.author}</p>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3 flex-1 text-xs text-slate-300 italic line-clamp-3">
                      "{book.personal_notes || "No notes available"}"
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleOpenView(book)}
                        className="w-full text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-2 text-xs font-semibold py-1"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>

        {/* View Modal */}
        {activeModal === "view" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            <div className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedNote?.title}
                    </h2>
                    <p className="text-indigo-400 text-sm">
                      {selectedNote?.author}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="text-slate-500 hover:text-white" size={20} />
                  </button>
                </div>
                <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-xl italic text-slate-200 mb-6">
                  "{selectedNote?.personal_notes || "No notes available"}"
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {showNotification && (
          <div className="fixed bottom-8 right-8 bg-[#0f172a] border border-white/10 p-5 rounded-2xl shadow-2xl flex items-center gap-4 z-[110]">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
              <Heart fill="currentColor" size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Added to Favorites</p>
              <p className="text-xs text-slate-400">
                "{selectedNote?.title}" has been updated.
              </p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
