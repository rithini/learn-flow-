from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseExtractor(ABC):
    @abstractmethod
    def extract(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Returns list of units: [{"content": "...", "locator": {"page": 1, ...}}]
        """
        pass
