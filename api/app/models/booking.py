import uuid
from datetime import datetime, timezone

from app.models.user import User
from sqlalchemy import DateTime, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    slot_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("slots.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    trainee_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    agenda: Mapped[str | None] = mapped_column(Text, nullable=True)
    meet_link: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="confirmed"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    slot: Mapped["Slot"] = relationship("Slot", back_populates="booking", lazy="selectin")
    trainee: Mapped["User"] = relationship("User", lazy="selectin")

    @property
    def trainee_name(self) -> str:
        return self.trainee.name if self.trainee else ""

    @property
    def trainee_email(self) -> str:
        return self.trainee.email if self.trainee else ""