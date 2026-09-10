from typing import List, Dict, Any
from app.document_processing.cleaner import TextCleaner


class DocumentChunker:
    def __init__(self, target_chunk_size: int = 500, overlap_size: int = 50):
        self.target_chunk_size = target_chunk_size
        self.overlap_size = overlap_size

    def chunk_extracted_units(
        self,
        units: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Takes raw extracted units (with page/slide locators) and returns bounded chunks.
        Each unit is a dict: {"content": "...", "locator": {"page": 1}}
        """
        chunks: List[Dict[str, Any]] = []
        chunk_idx = 0

        for unit in units:
            raw_text = TextCleaner.clean(unit.get("content", ""))
            locator = unit.get("locator", {})

            if not raw_text:
                continue

            words = raw_text.split(" ")
            if len(words) <= self.target_chunk_size:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "content": raw_text,
                    "token_count": len(words),
                    "source_locator": locator,
                })
                chunk_idx += 1
            else:
                # Split large unit into overlapping windows
                start = 0
                while start < len(words):
                    end = min(start + self.target_chunk_size, len(words))
                    sub_text = " ".join(words[start:end])
                    chunks.append({
                        "chunk_index": chunk_idx,
                        "content": sub_text,
                        "token_count": len(words[start:end]),
                        "source_locator": locator,
                    })
                    chunk_idx += 1
                    if end >= len(words):
                        break
                    start += self.target_chunk_size - self.overlap_size

        return chunks
