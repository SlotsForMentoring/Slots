from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

from app.models import slots  # noqa: F401