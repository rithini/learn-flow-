from sqlalchemy.orm import DeclarativeBase, declared_attr
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime


class Base(DeclarativeBase):
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
