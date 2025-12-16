import fitz  # PyMuPDF

def extract_text(pdf_path: str) -> str:
    text = ""
    with fitz.open(pdf_path) as pdf:
        for page in pdf:
            text += page.get_text()
    return text
