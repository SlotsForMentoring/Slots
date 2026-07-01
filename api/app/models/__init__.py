from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.models import slots  # noqa: E402, F401
from app.models import booking  # noqa: E402, F401
 