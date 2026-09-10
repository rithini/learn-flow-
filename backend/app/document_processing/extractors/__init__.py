import os
from app.document_processing.extractors.base import BaseExtractor
from app.document_processing.extractors.pdf_extractor import PDFExtractor
from app.document_processing.extractors.other_extractors import PPTXExtractor, DOCXExtractor, TXTExtractor
from app.core.exceptions import BadRequestException


def get_extractor_for_file(filename: str) -> BaseExtractor:
    ext = os.path.splitext(filename)[1].lower().replace(".", "")
    if ext == "pdf":
        return PDFExtractor()
    elif ext in ("pptx", "ppt"):
        return PPTXExtractor()
    elif ext in ("docx", "doc"):
        return DOCXExtractor()
    elif ext in ("txt", "md"):
        return TXTExtractor()
    else:
        raise BadRequestException(f"Unsupported file format '.{ext}'. Supported formats: PDF, PPTX, DOCX, TXT.")


__all__ = ["BaseExtractor", "PDFExtractor", "PPTXExtractor", "DOCXExtractor", "TXTExtractor", "get_extractor_for_file"]
