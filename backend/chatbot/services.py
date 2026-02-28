import os
from django.conf import settings
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import re 
import difflib  # 🔹 引入字串比對庫

# 🔥 Global in-memory cache
VECTORSTORE_CACHE = {}

class BookChatbot:
    """RAG-based chatbot for book conversations"""
    """
    Smart RAG chatbot:
    - Auto-detect relevant books from message
    - Limit search scope
    - Cache vectorstores
    """

    def __init__(self, user, book=None):
        self.user = user
        self.book = book
        self.embeddings = OllamaEmbeddings(
            model="nomic-embed-text",
            base_url=settings.OLLAMA_HOST
        )
        self.llm = ChatOllama(
            model="tinyllama",
            temperature=0,
            base_url=settings.OLLAMA_HOST
        )
        
        if book and book.ocr_status == 'completed':
            self.setup_rag_chain(query)
        else:
            self.retriever = None
            self.rag_chain = None
    # --------------------------------------------------
    # 🔥 Step 1: Find relevant books from message
    # --------------------------------------------------
    def _detect_relevant_books(self, query):
        from library.models import Book
        import difflib

        user_books = Book.objects.filter(user=self.user).only("id", "title")

        if not user_books.exists():
            return []

        query_lower = query.lower()
        scored_books = []

        for book in user_books:
            if not book.title:
                continue
                
            title_lower = book.title.lower()
            
            # 1. 計算基礎相似度 (0.0 ~ 1.0)
            # ratio() 對於長度差異巨大的字串（如書名 vs 整個長句子）分數會很低
            base_score = difflib.SequenceMatcher(None, title_lower, query_lower).ratio()
            
            # 2. 權重加成：如果 query 裡完整包含了書名，給予極高加分 (Bonus)
            # 這是為了處理 "Tell me about [Book Title]" 這種情境
            if title_lower in query_lower:
                # 加上一個權重，確保包含關係的優先級最高
                # 例如直接給予 1.0 的加成，或設定一個保底高分
                base_score += 1.0 
            
            scored_books.append((base_score, book))

        # 3. 按分數由高到低排序
        scored_books.sort(key=lambda x: x[0], reverse=True)

        # 4. 判斷最高分是否達到門檻
        if scored_books:
            best_score, best_book = scored_books[0]
            
            # 如果有分數（包含匹配或有一定相似度）
            if best_score > 0.1:  # 門檻值可以根據測試微調
                return [best_book]

        # 5. Fallback：如果分數都太低，且語義提到關鍵字，回傳最近的一本書
        if any(k in query_lower for k in ["book", "read", "書", "內容"]):
            return list(user_books[:1])

        return []
    # --------------------------------------------------
    # 🔥 Step 2: Build retriever with cache
    # --------------------------------------------------

    def _build_retriever(self, books):

        retrievers = []

        for book in books:
            if not book.vector_db_path:
                continue
            if not os.path.exists(book.vector_db_path):
                continue

            cache_key = f"book_{book.id}"

            if cache_key in VECTORSTORE_CACHE:
                vectorstore = VECTORSTORE_CACHE[cache_key]
            else:
                vectorstore = Chroma(
                    persist_directory=book.vector_db_path,
                    embedding_function=self.embeddings
                )
                VECTORSTORE_CACHE[cache_key] = vectorstore

            retrievers.append(
                vectorstore.as_retriever(search_kwargs={"k": 2})
            )

        if not retrievers:
            return None

        if len(retrievers) == 1:
            return retrievers[0]

        return MergerRetriever(retrievers=retrievers)
    
    def setup_rag_chain(self, query=None):
        """Setup RAG chain with vector store"""
        """
        Setup RAG chain.
        If book exists → single book retriever
        Else → load all user's books and merge retrievers
        """
        from library.models import Book
        from langchain.retrievers import MergerRetriever
        
        
        if not os.path.exists(self.book.vector_db_path):
            self.retriever = None
            self.rag_chain = None
            return
        retrievers = []

        # 🔹 Case 1: specific book
        if self.book:
            books = [self.book]
        else:
            # 🔥 Strategy 1: 先用標題做 keyword 過濾,  策略優化：獲取該使用者所有已完成 OCR 的書
            all_user_books = Book.objects.filter(
                user=self.user,
            ).only("id", "title", "vector_db_path")
            print(f'query:{query}')
            if query:
                query_lower = query.lower()
                # 檢查書名是否出現在使用者的提問中
                matched_books = [
                    b for b in all_user_books 
                    if b.title and b.title.lower() in query_lower
                ]

                # 如果有匹配到特定的書，就用匹配到的
                if matched_books:
                    books = matched_books[:3]  # 限制最多 3 本避免檢索太慢
                else:
                    # 🔥 Fallback: 找不到關鍵字匹配，取最近的 5 本
                    books = all_user_books[:5]
            else:
                # 沒有 query 時預設載入前 5 本
                books = all_user_books[:5]

        for book in books:

            if not book.vector_db_path:
                continue
            if not os.path.exists(book.vector_db_path):
                continue

            cache_key = f"book_{book.id}"

            # 🔥 1️⃣ Use cached vectorstore if exists, Cache vectorstore
            if cache_key in VECTORSTORE_CACHE:
                vectorstore = VECTORSTORE_CACHE[cache_key]
            else:
                vectorstore = Chroma(
                    persist_directory=book.vector_db_path,
                    embedding_function=self.embeddings
                )
                VECTORSTORE_CACHE[cache_key] = vectorstore

            retriever = vectorstore.as_retriever(
                search_kwargs={"k": 2}
            )
            retrievers.append(retriever)

        if not retrievers:
            return
        # 🔥 Merge multiple retrievers
        if len(retrievers) == 1:
            self.retriever = retrievers[0]
        else:
            self.retriever = MergerRetriever(retrievers=retrievers)


        # Setup RAG chain
        template = """You are a helpful and logical Reading Assistant. 

        GUIDELINES:
        1. Provide a well-organized response using a short paragraph.
        2. Ensure each book or item listed is distinct. Do NOT repeat the same book or mix up character names (e.g., ensure characters belong to their correct books).
        3. If the user asks for recommendations, provide a brief (1-2 sentence) reason for each.
        4. Keep the formatting clean and professional.
        5. NO conversational filler (e.g., "Sure, I'd be happy to help").
        6. NO extra explanations about what your answer provides.
        7. Only answer based on retrieved context.
        8. Do NOT mix content from different books incorrectly.
        9. No need to use any list format.

        Conversation History:
        {conversation}

        User Question: {question}

        Assistant Response:"""

        prompt = ChatPromptTemplate.from_template(template)

        self.rag_chain = (
            {"context": self.retriever, "question": RunnablePassthrough()}
            | prompt
            | self.llm
            | StrOutputParser()
        )

    @staticmethod
    def _clean_response(text):
        if not text:
            return ""
        
        # 1. 強制切斷：如果 AI 把 Prompt 的標籤 (User/Assistant/Conversation) 吐出來，只取之後的內容
        # 這能解決你遇到的 "Conversation:\nUser:..." 問題
        if "Assistant:" in text:
            text = text.split("Assistant:")[-1]
        elif "Answer:" in text:
            text = text.split("Answer:")[-1]

        # 2. 移除特定的開場廢話
        noise_patterns = [
            r"^Sure,?\s*(I'd be happy to help|here is the information|I can help with that).*",
            r"^Certainly!.*",
            r"^Great question!.*",
            r"Sure, I'd be happy to help!",
            r"Here are some ways it can help:",
            r"Conversation:",
            r"User:.*?\n",
            "Sure thing!"
        ]
        for pattern in noise_patterns:
            text = re.sub(pattern, "", text, flags=re.IGNORECASE)

        # 3. 清洗格式：將重複換行縮減，移除首尾空白
        text = re.sub(r'\n{3,}', '\n\n', text)
        # 1. 清除字串開頭的任何「換行 + 數字」組合 (例如 \n\n1 或 \n3)
        # 這能解決 AI 莫名其妙從數字開始輸出的問題
        text = re.sub(r'^[\n\s]*\d+[\.\s]*', '', text)
        # 2. 清除字串中多餘的換行與編號殘留
        # 針對 \n\n1, \n\n2 這種格式進行優化，統整成標準換行
        text = re.sub(r'\n+\d+[\.\s]*', '\n', text)
        # 
        text = text.replace('\n', ' ')
        text = text.replace('\"', ' ')
        return text.strip()


    # --------------------------------------------------
    # 🔥 Step 3: Generate response
    # --------------------------------------------------
    def get_response(self, query, conversation_history=None):

        # books = self._detect_relevant_books(query)
        # retriever = self._build_retriever(books)
        # # 記錄下被匹配到的主要書籍（通常是第一本）
        # matched_book = books[0] if books else None
        books = self._detect_relevant_books(query)
        matched_book = books[0] if books else None
        retriever = self._build_retriever(books)

        
        if retriever:
            template = """You are a precise reading assistant.
                    Only answer based on retrieved context.
                    Keep response concise and professional.

                    User Question:
                    {question}

                    Assistant Response:"""

            prompt = ChatPromptTemplate.from_template(template)

            chain = (
                {"context": retriever, "question": RunnablePassthrough()}
                | prompt
                | self.llm
                | StrOutputParser()
            )

            response = ""
            for chunk in chain.stream(query):
                response += chunk
            # # 回傳 response 以及 匹配到的書
            return self._clean_response(response), matched_book

        # 🔥 If no retriever → general LLM mode
        # 如果走 general mode，回傳 response 和 None
        # return self._general_response(query, conversation_history), None
        return self._clean_response(self._general_response(query, conversation_history)), matched_book



    def _general_response(self, query, conversation_history=None):
        """Generate general response without book context"""
        try:
            # Build conversation context
            messages = []
            
            if conversation_history:
                for conv in conversation_history[-5:]:  # Last 5 conversations
                    messages.append(f"User: {conv.user_message}")
                    messages.append(f"Assistant: {conv.bot_response}")
            
            messages.append(f"User: {query}")
            
            context = "\n".join(messages)
            
            template = """You are a helpful reading assistant. Please provide a helpful response to the user's question.

Conversation:
{conversation}

Please respond naturally and helpfully."""

            prompt = ChatPromptTemplate.from_template(template)
            
            chain = prompt | self.llm | StrOutputParser()
            
            response = ""
            for chunk in chain.stream({"conversation": context}):
                response += chunk
            
            return response.strip()
        except Exception as e:
            return f"I'm sorry, I encountered an error: {str(e)}"



def get_chatbot_response(user, message):

    from chatbot.models import Conversation

    chatbot = BookChatbot(user=user)

    # response = chatbot.get_response(message)
    response, matched_book = chatbot.get_response(message)
    print(f'matched_book:{matched_book} ', flush=True)
    conversation = Conversation.objects.create(
        user=user,
        book=matched_book,
        user_message=message,
        bot_response=response
    )

    return response, conversation
