---

# 📚 Libro Book Management

## 📖 About the Project

- Introduction. Libro Book Management
  - 📖 The Libro Book Management Project is a project I developed to manage my personal PDF digital books. I usually use Notion for note-taking, but Notion has a file upload limit. I found a similar book management software called Calibre. While using it, I discovered that some digital book PDFs consist of images. Sometimes I wanted to extract parts of the content to Notion for note-taking, but because they were images, it wasn't very convenient. So, in this project, I used Tesseract OCR to scan for images if the content was in images format to solve this problem. Then, I thought about what if I wanted to ask questions related to the books, so I created a RAG architecture combined with OLLAMA to answer questions based on the books the user owns, helping me quickly understand the book's content.
- 👥 Author
  - _Yu En Lin (林語恩)_

## 🛠 Tech Stack

```
| **Category** | **Technology** |
| :--- | :--- |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) ![Stitch AI](https://img.shields.io/badge/Stitch_AI-000000?style=for-the-badge&logo=icloud&logoColor=white) ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white) |
| **Backend** | ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white) ![DRF](https://img.shields.io/badge/Django_REST-092E20?style=for-the-badge&logo=django&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white) ![Google OAuth2](https://img.shields.io/badge/Google_OAuth2.0-4285F4?style=for-the-badge&logo=google&logoColor=white) <br> ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![Celery](https://img.shields.io/badge/Celery-373737?style=for-the-badge&logo=celery&logoColor=96D701) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white) |
| **AI & RAG** | ![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white) ![Chroma](https://img.shields.io/badge/Chroma_DB-4EAA25?style=for-the-badge&logo=google-cloud&logoColor=white) ![RAG](https://img.shields.io/badge/RAG-Architecture-blue?style=for-the-badge) <br> ![Tesseract](https://img.shields.io/badge/Tesseract_OCR-211F1F?style=for-the-badge) ![Prompt Engineering](https://img.shields.io/badge/Prompt_Engineering-FFD700?style=for-the-badge&logo=sparkar&logoColor=black) |
| **DevOps** | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![CI/CD](https://img.shields.io/badge/CI/CD-FF6A00?style=for-the-badge&logo=github&logoColor=white) |
| **Server** | ![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white) |
```

## ⚡ Quick Start

### Prerequisites

- You should have `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
  - https://console.developers.google.com/?hl=zh-tw
    ![image.png](attachment:50dd6fb5-8457-4dc4-bdc0-6a32a5f9e478:image.png)

### Installation

1. Clone the repo: `git clone https://github.com/yuenlin0421/libro-library.git`
2. Set up Environment Variables
   - `libro-library`
     - `backend/.env`

       ```
       # Google OAuth
       GOOGLE_CLIENT_ID=
       GOOGLE_CLIENT_SECRET=

       # Django
       SECRET_KEY=django-insecure-m16bnu*e7nkboin&a=+$))3mst_e#%(@h_3g6kvsdirap5z-%x
       # DJANGO_SECRET_KEY=your-secret-key-here
       DEBUG=True
       # DJANGO_DEBUG=False
       DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend

       # PostgreSQL Database
       POSTGRES_DB=libro_db
       POSTGRES_USER=libro_user
       POSTGRES_PASSWORD=libro_password
       DATABASE_URL=postgresql://libro_user:libro_password@db:5432/libro_db

       # Redis & Celery
       REDIS_URL=redis://redis:6379/0
       CELERY_BROKER_URL=redis://redis:6379/0

       # Ollama
       OLLAMA_HOST=http://ollama:11434
       # OLLAMA_BASE_URL=http://ollama:11434

       # Frontend
       NEXT_PUBLIC_API_URL=http://localhost:8000
       NEXT_PUBLIC_GOOGLE_CLIENT_ID=283981770088-dud5v1g7sm6pout2cnic24rqudqsh53p.apps.googleusercontent.com
       NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/login

       ```

     - `.env`

       ```
       # Google OAuth
       GOOGLE_CLIENT_ID=
       GOOGLE_CLIENT_SECRET=

       # PostgreSQL Database
       POSTGRES_DB=libro_db
       POSTGRES_USER=libro_user
       POSTGRES_PASSWORD=libro_password
       DATABASE_URL=postgresql://libro_user:libro_password@db:5432/libro_db

       # Frontend
       NEXT_PUBLIC_API_URL=http://localhost:8000
       NEXT_PUBLIC_GOOGLE_CLIENT_ID=283981770088-dud5v1g7sm6pout2cnic24rqudqsh53p.apps.googleusercontent.com
       NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/login

       ```

3. Setup the docker, ollama , django

   ```bash
   cd Path/libro-library/
   # Docker Setup
   docker compose up
   # ollama Setup
   docker-compose exec ollama ollama pull tinyllama
   docker-compose exec ollama ollama pull nomic-embed-text
   # Django setup
   # 執行遷移，將資料表建立到 db 容器中
   docker-compose exec backend python manage.py makemigrations
   docker-compose exec backend python manage.py migrate
   # Create super user
   docker-compose exec backend python manage.py createsuperuser
   ```

4. Create an account → Log in
   - http://localhost:3000/login
5. You're free to use the application right now.

### URLs

- Home
  - http://localhost:3000/
- Auth
  - http://localhost:3000/login
- Core Pages
  - http://localhost:3000/dashboard
  - http://localhost:3000/library
  - http://localhost:3000/favorites
  - http://localhost:3000/notes
  - http://localhost:3000/chat

## 📂 About Project Structure

- 給我 tree structure 列出 folders and files in 1 code block, with any descriptions禁止遺漏任何一個

```
libro-library/
├── backend/                    # Django Backend Application Root
│   ├── auth_app/               # Authentication module (JWT, Google OAuth2.0, User models)
│   ├── chatbot/                # AI Engine (RAG logic, Ollama integration, Query processing)
│   ├── core/                   # Project configuration (settings.py, urls.py, wsgi/asgi)
│   ├── library/                # Core business logic (Book CRUD, Tesseract OCR processing)
│   ├── pdfs/                   # Directory for storing/processing PDF documents
│   ├── staticfiles/            # Collected static assets for production deployment
│   ├── vector/                 # ChromaDB vector store for RAG document embeddings
│   ├── media/                  # Persistent user-uploaded media and generated files
│   ├── .env                    # Backend-specific environment variables and secrets
│   ├── .gitignore              # Python/Django specific files to ignore in Git
│   ├── .python-version         # Python version specification (e.g., for pyenv or uv)
│   ├── conftest.py             # Shared fixtures and configuration for Pytest
│   ├── Dockerfile              # Backend container image definition
│   ├── manage.py               # Django command-line utility for administrative tasks
│   ├── pyproject.toml          # Modern Python build system and tool configuration
│   ├── pytest.ini              # Configuration file for the Pytest framework
│   ├── requirements.txt        # Legacy Python dependency list
│   └── uv.lock                 # Lockfile for the 'uv' manager ensuring reproducible builds
├── frontend/                   # Next.js Frontend Application Root
│   ├── .next/                  # Next.js build output and cache (generated)
│   ├── app/                    # Next.js App Router (File-based routing system)
│   │   ├── (auth)/             # Grouped routes for Login and Registration flows
│   │   ├── chat/               # Interactive AI Chat interface for library queries
│   │   ├── dashboard/          # Dashboard for user
│   │   ├── favorites/          # Section for bookmarked or starred digital books
│   │   ├── library/            # Main digital library explorer and file management
│   │   ├── notes/              # Interface for viewing OCR text and personal notes
│   ├── components/             # Reusable UI components (shadcn/ui, buttons, cards)
│   ├── contexts/               # React Context providers for global state
│   ├── hooks/                  # Custom React hooks for API fetching and UI logic
│   ├── lib/                    # Shared utilities and Axios/API client configurations
│   └── Dockerfile              # Frontend container image definition
├── nginx/                      # Reverse Proxy / Web Server configuration
│   └── nginx.conf              # Nginx routing rules for Frontend and Backend API
├── .env                        # Global environment variables (shared across services)
└── docker-compose.yml          # Container orchestration (Django, Postgres, Redis, Nginx)
```

## ✨ Key Features

- 🔐 **Dual JWT & Google OAuth2.0 Integration** improves security and login convenience by utilizing Google’s social authentication alongside a robust Dual-Token system (Access and Refresh) stored in HttpOnly cookies to prevent XSS attacks while ensuring seamless session persistence.
- 🤖 **Intelligent RAG with Ollama & ChromaDB** enhances the user experience by transforming static PDF collections into an interactive knowledge base where a specialized `BookChatbot` uses semantic retrieval and local LLMs to answer complex questions based specifically on the user's private library content.
- 🚀 **Asynchronous OCR Processing with Celery & Redis** offload resource-intensive Tesseract OCR tasks to background workers, allowing the application to remain responsive while extracting text from image-based PDFs in real-time.
- 🔍 **Automated Smart Book Detection** improves retrieval accuracy through a unique implementation of the `difflib` library and `SequenceMatcher` algorithm, which intelligently identifies the most relevant book from a user’s query even when the title provided is partial or slightly imprecise.

## 🗄 Database Schema

## 🖼 UI & Demo

### Home + Auth Page

### Manipulation Books

### SEO

### Settings
