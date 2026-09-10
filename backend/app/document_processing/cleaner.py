import re


class TextCleaner:
    @staticmethod
    def clean(text: str) -> str:
        if not text:
            return ""
        
        # Remove null bytes
        cleaned = text.replace("\x00", "")
        
        # Normalize CRLF and consecutive blank lines
        cleaned = re.sub(r"\r\n|\r", "\n", cleaned)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        
        # Normalize excessive spaces/tabs
        cleaned = re.sub(r"[ \t]+", " ", cleaned)
        
        # Trim leading and trailing whitespace
        return cleaned.strip()
