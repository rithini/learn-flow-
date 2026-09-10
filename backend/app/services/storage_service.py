import os
import uuid
import shutil
from typing import Tuple
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import BadRequestException


class StorageService:
    def __init__(self, base_dir: str = settings.STORAGE_DIR):
        self.base_dir = base_dir
        self.uploads_dir = os.path.join(base_dir, "uploads")
        self.videos_dir = os.path.join(base_dir, "videos")
        os.makedirs(self.uploads_dir, exist_ok=True)
        os.makedirs(self.videos_dir, exist_ok=True)

    async def save_upload_file(self, upload_file: UploadFile) -> Tuple[str, str, int, str]:
        """
        Validates file, writes to private local storage, and returns:
        (storage_key, filename, size_bytes, mime_type)
        """
        filename = upload_file.filename or "unknown_file"
        ext = os.path.splitext(filename)[1].lower().replace(".", "")
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise BadRequestException(
                f"Unsupported file type '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        unique_filename = f"{uuid.uuid4()}_{filename}"
        dest_path = os.path.join(self.uploads_dir, unique_filename)

        size_bytes = 0
        with open(dest_path, "wb") as buffer:
            while chunk := await upload_file.read(1024 * 1024):  # 1MB chunks
                size_bytes += len(chunk)
                if size_bytes > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                    os.remove(dest_path)
                    raise BadRequestException(f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.")
                buffer.write(chunk)

        storage_key = f"uploads/{unique_filename}"
        mime_type = upload_file.content_type or "application/octet-stream"
        return storage_key, filename, size_bytes, mime_type

    def get_absolute_path(self, storage_key: str) -> str:
        # Strip potential traversal
        safe_key = os.path.normpath(storage_key).lstrip(os.sep)
        full_path = os.path.join(self.base_dir, safe_key)
        if not full_path.startswith(self.base_dir):
            raise BadRequestException("Invalid storage key path traversal attempted.")
        return full_path


storage_service = StorageService()
