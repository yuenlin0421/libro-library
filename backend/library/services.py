import os
import pytesseract
from pdf2image import convert_from_path
from celery import shared_task
from django.conf import settings

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document


# =========================
# OCR + Vector 建立任務
# =========================

@shared_task(bind=True)
def process_book_ocr(self, book_id):
    from library.models import Book

    try:
        book = Book.objects.get(id=book_id)
        book.ocr_status = 'processing'
        book.save()

        pdf_path = book.pdf.path

        raw_docs = load_pdf_with_smart_detection(pdf_path)

        if not raw_docs:
            book.ocr_status = 'failed'
            book.save()
            return f"Failed to extract content from book {book_id}"

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150
        )
        splits = text_splitter.split_documents(raw_docs)

        embeddings = OllamaEmbeddings(
            model="nomic-embed-text",
            base_url=settings.OLLAMA_HOST
        )

        os.makedirs(book.vector_db_path, exist_ok=True)

        Chroma.from_documents(
            documents=splits,
            embedding=embeddings,
            persist_directory=book.vector_db_path
        )

        book.ocr_status = 'completed'
        book.save()

        return f"Successfully processed book {book_id}"

    except Exception as e:
        try:
            book = Book.objects.get(id=book_id)
            book.ocr_status = 'failed'
            book.save()
        except:
            pass
        return f"Error processing book {book_id}: {str(e)}"


# =========================
# 🔥 智慧判斷 PDF 是否需要 OCR
# =========================
def is_text_readable(text: str) -> bool:
    if not text:
        return False

    # 1. 如果有一定長度的文字，我們先初步信任
    clean_text = text.strip()
    if len(clean_text) < 10:  # 極短內容才視為無效
        return False

    # 2. 檢查是否包含常見的中文字符範圍 (U+4E00 - U+9FFF) 或英文字母
    # 這樣可以避免純 binary/亂碼被誤判
    import re
    has_content = bool(re.search(r'[\u4e00-\u9fff]|[a-zA-Z0-9]', clean_text))
    if not has_content:
        return False

    # 3. 移除過嚴的 non_ascii_ratio 判斷，改為檢查「控制字元」比例
    # 如果文本中包含大量不可見的控制字元，通常才是損壞的 PDF
    control_chars = sum(1 for c in clean_text if ord(c) < 32 and c not in '\n\r\t')
    if len(clean_text) > 0 and (control_chars / len(clean_text)) > 0.3:
        return False

    return True

def load_pdf_with_smart_detection(pdf_path):
    """
    先嘗試正常讀取 PDF
    如果判斷為亂碼或掃描檔才啟動 OCR
    """

    print(f"📖 Analyzing file: {pdf_path}")

    # Step 1️⃣ 嘗試正常讀取
    try:
        loader = PyPDFLoader(pdf_path)
        docs = loader.load()

        full_text = "".join(d.page_content for d in docs)

        if is_text_readable(full_text):
            print("✅ Normal PDF text detected — no OCR needed.")
            return docs
        else:
            print("⚠️ Extracted text looks corrupted. Switching to OCR...")

    except Exception as e:
        print(f"⚠️ Normal PDF extraction failed: {e}")

    # Step 2️⃣ OCR fallback
    try:
        pages = convert_from_path(pdf_path, dpi=200)

        ocr_docs = []

        for i, page in enumerate(pages):
            text = pytesseract.image_to_string(page, lang='eng')
            ocr_docs.append(
                Document(
                    page_content=text,
                    metadata={"source": pdf_path, "page": i}
                )
            )
            print(f"✨ OCR page {i+1} done")

        return ocr_docs

    except Exception as e:
        print(f"❌ OCR failed: {e}")
        return []