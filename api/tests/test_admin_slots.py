import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from httpx import ASGITransport, AsyncClient

from app.dependencies.auth import get_current_user
from app.main import app
from app.models.user import User

NOW = datetime.now(timezone.utc)
FUTURE = NOW + timedelta(days=1)


def fake_admin():
    return User(
        id="00000000-0000-0000-0000-000000000001",
        google_id="admin-google-id",
        email="admin@example.com",
        name="Admin User",
        role="admin",
    )


def fake_trainee():
    return User(
        id="00000000-0000-0000-0000-000000000002",
        google_id="trainee-google-id",
        email="trainee@example.com",
        name="Trainee User",
        role="trainee",
    )


def make_mock_booking():
    booking = MagicMock()
    booking.id = uuid4()
    booking.trainee_id = uuid4()
    booking.trainee_name = "Tommy Trainee"
    booking.trainee_email = "trainee@example.com"
    booking.trainee_profile_picture = None
    booking.agenda = "Intro session"
    booking.status = "confirmed"
    return booking


def make_mock_slot(booking=None):
    slot = MagicMock()
    slot.id = uuid4()
    slot.volunteer_id = uuid4()
    slot.volunteer_name = "Vera Volunteer"
    slot.volunteer_profile_picture = None
    slot.start_time = FUTURE
    slot.end_time = FUTURE + timedelta(hours=1)
    slot.min_booking_notice_hours = 24
    slot.booking = booking
    slot.is_booked = booking is not None
    slot.created_at = NOW
    return slot


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.mark.asyncio
@patch("app.crud.slots.get_all_slots", new_callable=AsyncMock)
async def test_admin_can_list_all_slots(mock_get_all, client):
    booked = make_mock_slot(booking=make_mock_booking())
    available = make_mock_slot()
    mock_get_all.return_value = [booked, available]
    app.dependency_overrides[get_current_user] = fake_admin

    response = await client.get("/admin/slots")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["is_booked"] is True
    assert data[0]["booking"]["trainee_name"] == "Tommy Trainee"
    assert data[1]["is_booked"] is False
    assert data[1]["booking"] is None


@pytest.mark.asyncio
async def test_trainee_cannot_list_all_slots(client):
    app.dependency_overrides[get_current_user] = fake_trainee
    response = await client.get("/admin/slots")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_volunteer_cannot_list_all_slots(client):
    def fake_volunteer():
        return User(
            id="00000000-0000-0000-0000-000000000003",
            google_id="volunteer-google-id",
            email="volunteer@example.com",
            name="Volunteer User",
            role="volunteer",
        )

    app.dependency_overrides[get_current_user] = fake_volunteer
    response = await client.get("/admin/slots")
    assert response.status_code == 403
