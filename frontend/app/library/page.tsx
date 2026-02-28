"use client";

import { useState, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { BookCard } from "@/components/book-card";
import { ProtectedRoute } from "@/components/protected-route";
import { useBooks } from "@/hooks/use-books";
import { booksApi } from "@/lib/api/books";
import {
  Search,
  Plus,
  X,
  Upload,
  Book,
  User,
  Hash,
  Link as LinkIcon,
  AlertTriangle,
  Heart as HeartIcon,
  Pencil,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function LibraryPage() {
  const { books, loading, updateBook, deleteBook, fetchBooks } = useBooks();
  type ModalType = "add" | "edit" | "delete" | "favorite" | null;

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Book Form State
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    image_url: "",
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Book Form State
  const [editFormData, setEditFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    image_url: "",
    progress_percentage: 0,
    personal_notes: "",
  });

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggleFavorite = async (book: any) => {
    try {
      await updateBook(book.id, { is_favorite: !book.is_favorite });
      setSelectedBook({ ...book, is_favorite: !book.is_favorite });
      setActiveModal("favorite");
      setTimeout(() => {
        setActiveModal((current) => (current === "favorite" ? null : current));
      }, 3000);
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    try {
      await deleteBook(selectedBook.id);
      toast.success("Book deleted successfully");
      setActiveModal(null);
    } catch (error) {
      toast.error("Failed to delete book");
    }
  };

  // Handle Add Book Modal Open
  const handleAddBookClick = () => {
    setNewBook({ title: "", author: "", isbn: "", image_url: "" });
    setPdfFile(null);
    setActiveModal("add");
  };

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        toast.error("File size must be less than 50MB");
        return;
      }
      setPdfFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  // Handle Add Book Submit
  const handleAddBookSubmit = async () => {
    // Validation
    if (!newBook.title.trim()) {
      toast.error("Please enter a book title");
      return;
    }
    if (!newBook.author.trim()) {
      toast.error("Please enter an author name");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookData = {
        title: newBook.title,
        author: newBook.author,
        isbn: newBook.isbn || undefined,
        image_url: newBook.image_url || undefined,
        pdf: pdfFile || undefined,
      };

      await booksApi.createBook(bookData);
      toast.success("Book added successfully!");
      setActiveModal(null);
      fetchBooks(); // Refresh the book list
    } catch (error: any) {
      console.error("Failed to add book:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add book";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Modal Open
  const handleEditClick = (book: any) => {
    setSelectedBook(book);
    setEditFormData({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      image_url: book.image_url || "",
      progress_percentage: book.progress_percentage || 0,
      personal_notes: book.personal_notes || "",
    });
    setActiveModal("edit");
  };

  // Handle Edit Book Submit
  const handleEditBookSubmit = async () => {
    if (!selectedBook) return;

    setIsSubmitting(true);

    try {
      await updateBook(selectedBook.id, {
        title: editFormData.title,
        author: editFormData.author,
        isbn: editFormData.isbn,
        progress_percentage: editFormData.progress_percentage,
        personal_notes: editFormData.personal_notes,
      });

      toast.success("Book updated successfully!");
      setActiveModal(null);
      fetchBooks();
    } catch (error) {
      console.error("Failed to update book:", error);
      toast.error("Failed to update book");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-[#020617] text-white items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading library...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#020617] text-white">
        <Sidebar />

        <main className="flex-1 flex flex-col bg-transparent overflow-y-auto">
          <header className="px-8 h-20 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#020617]/80 backdrop-blur-md z-30">
            <h1 className="text-3xl font-bold">My Library</h1>
            <div className="flex-1 max-w-2xl flex items-center gap-4 ml-8">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-indigo-500/50"
                  placeholder="Search your library..."
                />
              </div>
              <button
                type="button"
                onClick={handleAddBookClick}
                className="flex items-center gap-2 bg-[#5551ff] hover:bg-[#4440ff] text-white px-6 py-2 rounded-xl font-medium transition-all shrink-0 relative z-50"
              >
                <Plus size={18} />
                <span>Add Book</span>
              </button>
            </div>
          </header>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {filteredBooks.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-slate-400 text-lg mb-4">
                  No books in your library yet
                </p>
                <button
                  onClick={handleAddBookClick}
                  className="inline-flex items-center gap-2 bg-[#5551ff] hover:bg-[#4440ff] text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  <Plus size={18} />
                  <span>Add Your First Book</span>
                </button>
              </div>
            ) : (
              filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  {...book}
                  title={book.title}
                  author={book.author}
                  progress={book.progress_percentage}
                  isFavorite={book.is_favorite}
                  image={book.image_url || ""}
                  onEdit={() => handleEditClick(book)}
                  onDelete={() => {
                    setSelectedBook(book);
                    setActiveModal("delete");
                  }}
                  onFavorite={() => handleToggleFavorite(book)}
                />
              ))
            )}
          </div>
        </main>

        {/* Modals */}
        {activeModal && activeModal !== "favorite" && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isSubmitting && setActiveModal(null)}
            />

            <div className="relative z-[201] max-h-[90vh] overflow-y-auto">
              {/* Add Modal */}
              {activeModal === "add" && (
                <div className="w-full max-w-[600px] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold">Add Book</h2>
                    <button
                      onClick={() => setActiveModal(null)}
                      disabled={isSubmitting}
                    >
                      <X className="cursor-pointer text-slate-500 hover:text-white" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Book size={14} /> Book Title *
                      </label>
                      <input
                        value={newBook.title}
                        onChange={(e) =>
                          setNewBook({ ...newBook, title: e.target.value })
                        }
                        placeholder="Enter book title"
                        className="w-full bg-[#0a0f1d] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                          <User size={14} /> Author *
                        </label>
                        <input
                          value={newBook.author}
                          onChange={(e) =>
                            setNewBook({ ...newBook, author: e.target.value })
                          }
                          placeholder="Enter author name"
                          className="w-full bg-[#0a0f1d] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                          <Hash size={14} /> ISBN
                        </label>
                        <input
                          value={newBook.isbn}
                          onChange={(e) =>
                            setNewBook({ ...newBook, isbn: e.target.value })
                          }
                          placeholder="e.g. 978-0735211292"
                          className="w-full bg-[#0a0f1d] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <LinkIcon size={14} /> Image URL
                      </label>
                      <input
                        value={newBook.image_url}
                        onChange={(e) =>
                          setNewBook({ ...newBook, image_url: e.target.value })
                        }
                        placeholder="https://example.com/cover.jpg"
                        className="w-full bg-[#0a0f1d] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1 mb-3">
                        <Upload size={14} /> PDF File (Optional)
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                      >
                        <Upload className="text-slate-500 mb-3 group-hover:text-indigo-400" />
                        <p className="text-sm text-slate-400">
                          {pdfFile ? (
                            <span className="text-emerald-400">
                              ✓ {pdfFile.name} (
                              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          ) : (
                            <>
                              Drop your PDF here or{" "}
                              <span className="text-[#5551ff]">browse</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleAddBookSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-[#5551ff] py-4 rounded-xl font-bold text-lg hover:bg-[#4440ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Adding..." : "Add Book"}
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Modal */}
              {activeModal === "edit" && (
                <div className="w-full max-w-[600px] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Pencil className="text-emerald-400" size={18} />
                      </div>
                      <h2 className="text-xl font-bold">Edit Book Details</h2>
                    </div>
                    <button
                      onClick={() => setActiveModal(null)}
                      disabled={isSubmitting}
                    >
                      <X className="cursor-pointer text-slate-500 hover:text-white" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          Book Title
                        </label>
                        <input
                          value={editFormData.title}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              title: e.target.value,
                            })
                          }
                          className="w-full bg-[#0a0f1d] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          Author
                        </label>
                        <input
                          value={editFormData.author}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              author: e.target.value,
                            })
                          }
                          className="w-full bg-[#0a0f1d] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Progress Percentage
                        </label>
                        <span className="text-sm font-bold text-emerald-400">
                          {editFormData.progress_percentage}%
                        </span>
                      </div>
                      <input
                        type="range"
                        value={editFormData.progress_percentage}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            progress_percentage: parseInt(e.target.value),
                          })
                        }
                        min="0"
                        max="100"
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#5551ff]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Personal Notes
                      </label>
                      <textarea
                        value={editFormData.personal_notes}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            personal_notes: e.target.value,
                          })
                        }
                        className="w-full bg-[#0a0f1d] border border-white/5 rounded-xl p-4 text-sm text-slate-300 h-32 outline-none focus:border-indigo-500/50 resize-none"
                        placeholder="Add your notes here..."
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setActiveModal(null)}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEditBookSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-2.5 rounded-xl text-sm font-bold bg-[#5551ff] hover:bg-[#4440ff] text-white transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Modal */}
              {activeModal === "delete" && (
                <div className="w-full max-w-[400px] bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-rose-500" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Delete Book?</h2>
                  <p className="text-slate-400 mb-10">
                    Are you sure you want to delete{" "}
                    <span className="text-white font-medium">
                      "{selectedBook?.title}"
                    </span>
                    ?
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteBook}
                      className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Favorite Toast */}
        {activeModal === "favorite" && (
          <div className="fixed bottom-8 right-8 bg-[#0f172a] border border-white/10 p-5 rounded-2xl shadow-2xl flex items-center gap-5 z-[200]">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedBook?.is_favorite ? "bg-rose-500/20" : "bg-slate-500/10"}`}
            >
              <HeartIcon
                className={
                  selectedBook?.is_favorite ? "text-rose-500" : "text-slate-500"
                }
                fill={selectedBook?.is_favorite ? "currentColor" : "none"}
                size={24}
              />
            </div>
            <div>
              <h4 className="font-bold text-white">
                {selectedBook?.is_favorite
                  ? "Added to Favorites"
                  : "Removed from Favorites"}
              </h4>
              <p className="text-sm text-slate-400">
                "{selectedBook?.title}" has been updated.
              </p>
            </div>
            <button onClick={() => setActiveModal(null)}>
              <X
                size={16}
                className="absolute top-4 right-4 text-slate-600 hover:text-white"
              />
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
