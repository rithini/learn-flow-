import uuid
from typing import Any, List, Optional
from fastapi import HTTPException, status


class LearnFlowException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[List[Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message
        self.details = details or []
        self.request_id = str(uuid.uuid4())


class NotFoundException(LearnFlowException):
    def __init__(self, resource: str, identifier: Any = None):
        msg = f"{resource} not found"
        if identifier:
            msg = f"{resource} with identifier '{identifier}' was not found."
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=msg,
        )


class UnauthorizedException(LearnFlowException):
    def __init__(self, message: str = "Invalid credentials or unauthorized access"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message,
        )


class ForbiddenException(LearnFlowException):
    def __init__(self, message: str = "You do not have permission to access this resource"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message=message,
        )


class BadRequestException(LearnFlowException):
    def __init__(self, message: str, details: Optional[List[Any]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="BAD_REQUEST",
            message=message,
            details=details,
        )


class ConflictException(LearnFlowException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CONFLICT",
            message=message,
        )
