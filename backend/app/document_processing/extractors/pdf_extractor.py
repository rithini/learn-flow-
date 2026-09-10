from typing import List, Dict, Any
from app.document_processing.extractors.base import BaseExtractor
from app.core.logging import logger


class PDFExtractor(BaseExtractor):
    def extract(self, file_path: str) -> List[Dict[str, Any]]:
        units: List[Dict[str, Any]] = []
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text")
                if text.strip():
                    units.append({
                        "content": text,
                        "locator": {"page_number": page_num + 1, "total_pages": len(doc)},
                    })
            doc.close()
        except ImportError:
            logger.warning("PyMuPDF (fitz) not installed. Reading as fallback text.")
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                units.append({"content": content, "locator": {"page_number": 1}})
        except Exception as e:
            logger.error(f"Error extracting PDF from {file_path}: {e}")
            raise e
        return units
