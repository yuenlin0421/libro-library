// lib/api/books.ts
import axios from "./client";

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  pdf?: string;
  image_url?: string;
  progress_percentage: number;
  personal_notes?: string | null;
  is_favorite: boolean;
  ocr_status?: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface BookListItem {
  id: number;
  title: string;
  author: string;
  image_url?: string;
  progress_percentage: number;
  is_favorite: boolean;
  updated_at: string;
  personal_notes?: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AnnualGoalResponse {
  annual_goal: number;
  books_read: number;
  progress_percentage: number;
  remaining: number;
}

export interface BookCreateData {
  title: string;
  author: string;
  isbn?: string;
  pdf?: File;
  image_url?: string;
}

export interface BookUpdateData {
  title?: string;
  author?: string;
  isbn?: string;
  progress_percentage?: number;
  is_favorite?: boolean;
  personal_notes?: string;
}

export const booksApi = {
  /**
   * Get all books (paginated)
   */
  async getAllBooks(): Promise<PaginatedResponse<BookListItem>> {
    const response = await axios.get<PaginatedResponse<BookListItem>>(
      "/api/library/books/",
    );
    return response.data;
  },

  /**
   * Get a specific book by ID
   */
  async getBook(id: number): Promise<Book> {
    const response = await axios.get<Book>(`/api/library/books/${id}/`);
    return response.data;
  },

  /**
   * Create a new book
   */
  async createBook(data: BookCreateData): Promise<Book> {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("author", data.author);
    if (data.isbn) formData.append("isbn", data.isbn);
    if (data.pdf) formData.append("pdf", data.pdf);
    if (data.image_url) formData.append("image_url", data.image_url);

    const response = await axios.post<Book>("/api/library/books/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Update a book (PATCH - partial update)
   */
  async updateBook(id: number, data: BookUpdateData): Promise<BookUpdateData> {
    const response = await axios.patch<BookUpdateData>(
      `/api/library/books/${id}/`,
      data,
    );
    return response.data;
  },

  /**
   * Replace a book (PUT - full update)
   */
  async replaceBook(id: number, data: Partial<Book>): Promise<BookUpdateData> {
    const response = await axios.put<BookUpdateData>(
      `/api/library/books/${id}/`,
      data,
    );
    return response.data;
  },

  /**
   * Delete a book
   */
  async deleteBook(id: number): Promise<{ message: string }> {
    const response = await axios.delete<{ message: string }>(
      `/api/library/books/${id}/`,
    );
    return response.data;
  },

  /**
   * Get books updated in current month
   */
  async getCurrentMonthBooks(): Promise<BookListItem[]> {
    const response = await axios.get<BookListItem[]>(
      "/api/library/books/current-month/",
    );
    return response.data;
  },

  /**
   * Get favorite books
   */
  async getFavorites(): Promise<BookListItem[]> {
    const response = await axios.get<BookListItem[]>(
      "/api/library/books/favorites/",
    );
    return response.data;
  },

  /**
   * Get books with notes
   */
  async getBooksWithNotes(): Promise<BookListItem[]> {
    const response = await axios.get<BookListItem[]>(
      "/api/library/books/with-notes/",
    );
    return response.data;
  },

  /**
   * Get annual reading goal progress
   */
  async getAnnualGoal(): Promise<AnnualGoalResponse> {
    const response = await axios.get<AnnualGoalResponse>(
      "/api/library/books/annual-goal/",
    );
    return response.data;
  },

  /**
   * Reprocess OCR for a book
   */
  async reprocessOCR(
    id: number,
  ): Promise<{ message: string; book_id: number; status: string }> {
    const response = await axios.post<{
      message: string;
      book_id: number;
      status: string;
    }>(`/api/library/books/${id}/reprocess-ocr/`);
    return response.data;
  },

  /**
   * Search all books
   */
  async searchBooks(query: string): Promise<BookListItem[]> {
    const response = await axios.get<BookListItem[]>(
      "/api/library/books/search/",
      {
        params: { q: query },
      },
    );
    return response.data;
  },

  /**
   * Search favorite books
   */
  async searchFavorites(query: string): Promise<BookListItem[]> {
    const response = await axios.get<BookListItem[]>(
      "/api/library/books/search-favorites/",
      {
        params: { q: query },
      },
    );
    return response.data;
  },

  /**
   * Search books with notes
   */
  async searchWithNotes(query: string): Promise<BookListItem[]> {
    const response = await axios.get<BookListItem[]>(
      "/api/library/books/search-with-notes/",
      {
        params: { q: query },
      },
    );
    return response.data;
  },
};
