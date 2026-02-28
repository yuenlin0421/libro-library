"use client";

import { useState, useEffect } from "react";
import { booksApi, BookListItem } from "@/lib/api/books";

export function useBooks() {
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksApi.getAllBooks();
      setBooks(response.results);
      setError(null);
    } catch (err) {
      setError("Failed to fetch books");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const addBook = async (data: any) => {
    try {
      const newBook = await booksApi.createBook(data);
      setBooks([...books, newBook as any]);
      return newBook;
    } catch (err) {
      console.error("Failed to add book:", err);
      throw err;
    }
  };

  const updateBook = async (id: number, data: any) => {
    try {
      await booksApi.updateBook(id, data);
      setBooks(
        books.map((book) => (book.id === id ? { ...book, ...data } : book)),
      );
    } catch (err) {
      console.error("Failed to update book:", err);
      throw err;
    }
  };

  const deleteBook = async (id: number) => {
    try {
      await booksApi.deleteBook(id);
      setBooks(books.filter((book) => book.id !== id));
    } catch (err) {
      console.error("Failed to delete book:", err);
      throw err;
    }
  };

  return {
    books,
    loading,
    error,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
  };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await booksApi.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return { favorites, loading, refetch: fetchFavorites };
}

export function useBooksWithNotes() {
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooksWithNotes = async () => {
    try {
      setLoading(true);
      const data = await booksApi.getBooksWithNotes();
      setBooks(data);
    } catch (err) {
      console.error("Failed to fetch books with notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksWithNotes();
  }, []);

  return { books, loading, refetch: fetchBooksWithNotes };
}
