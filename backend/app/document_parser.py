import fitz  # PyMuPDF
import os

def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        full_text += page.get_text()
    
    doc.close()
    
    if not full_text.strip():
        return "Could not extract text from this document."
    
    # Limit to 4000 words to stay within API limits
    words = full_text.split()
    if len(words) > 4000:
        full_text = " ".join(words[:4000])
        full_text += "\n[Document truncated for analysis]"
    
    return full_text.strip()

def extract_text_from_txt(file_bytes: bytes) -> str:
    try:
        return file_bytes.decode("utf-8")
    except:
        return file_bytes.decode("latin-1")