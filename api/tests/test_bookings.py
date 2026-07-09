import uuid
import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy.exc import IntegrityError
from httpx import ASGITransport, AsyncClient

from app.dependencies.auth import get_current_user
from app.database import get_db
from app.main import app
from app.models.user import User

NOW = datetime.now(timezone.utc)
FUTURE = NOW + timedelta(hours=48)
SLOT_ID = uuid.UUID("b2c3d4e5-f6a7-8901-bcde-f12345678901")
BOOKING_ID = uuid.UUID("c3d4e5f6-a7b8-9012-cdef-123456789012")


def fake_trainee():
    return User(
        id=uuid.UUID("00000000-0000-0000-0000-000000000002"),
        google_id="trainee-google-id",
        email="trainee@example.com",
        name="Trainee User",
        role="trainee",
    )


def fake_volunteer():
    return User(
        id=uuid.UUID("00000000-0000-0000-0000-000000000003"),
        google_id="volunteer-google-id",
        email="volunteer@example.com",
        name="Volunteer User",
        role="volunteer",
    )


def make_mock_slot(start_time=None, min_booking_notice_hours=24):
    slot = MagicMock()
    slot.id = SLOT_ID
    slot.volunteer_name = "Volunteer User"
    slot.start_time = start_time or FUTURE
    slot.end_time = (start_time or FUTURE) + timedelta(hours=1)
    slot.min_booking_notice_hours = min_booking_notice_hours
    return slot


def make_mock_booking():
    booking = MagicMock()
    booking.id = BOOKING_ID
    booking.slot = MagicMock()
    booking.slot.id = SLOT_ID
    booking.slot.volunteer_name = "Volunteer User"
    booking.slot.start_time = FUTURE
    booking.slot.end_time = FUTURE + timedelta(hours=1)
    booking.trainee_name = "Trainee User"
    booking.agenda = "Help with React hooks"
    booking.status = "confirmed"
    booking.created_at = NOW
    return booking


def make_mock_session():
    return AsyncMock()


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


# --- POST /bookings ---

@pytest.mark.asyncio
@patch("app.services.booking.get_slot", new_callable=AsyncMock)
@patch("app.services.booking.create_booking", new_callable=AsyncMock)
async def test_create_booking_success(mock_create, mock_get_slot, client):
    mock_get_slot.return_value = make_mock_slot()
    mock_create.return_value = make_mock_booking()

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_trainee
    app.dependency_overrides[get_db] = override_db

    response = await client.post("/bookings", json={"slot_id": str(SLOT_ID)})

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "confirmed"
    assert data["trainee_name"] == "Trainee User"


@pytest.mark.asyncio
@patch("app.services.booking.get_slot", new_callable=AsyncMock)
@patch("app.services.booking.create_booking", new_callable=AsyncMock)
async def test_create_booking_already_booked_409(mock_create, mock_get_slot, client):
    mock_get_slot.return_value = make_mock_slot()
    mock_create.side_effect = IntegrityError("stmt", {}, Exception("unique violation"))

    mock_session = make_mock_session()

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_current_user] = fake_trainee
    app.dependency_overrides[get_db] = override_db

    response = await client.post("/bookings", json={"slot_id": str(SLOT_ID)})

    assert response.status_code == 409
    assert response.json()["detail"] == "Slot is already booked"


@pytest.mark.asyncio
@patch("app.services.booking.get_slot", new_callable=AsyncMock)
async def test_create_booking_within_notice_window_400(mock_get_slot, client):
    # slot starts in 1 hour but min notice is 24h → window has passed (service raises 422)
    mock_get_slot.return_value = make_mock_slot(
        start_time=NOW + timedelta(hours=1),
        min_booking_notice_hours=24,
    )

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_trainee
    app.dependency_overrides[get_db] = override_db

    response = await client.post("/bookings", json={"slot_id": str(SLOT_ID)})

    assert response.status_code == 422
    assert response.json()["detail"] == "Booking window has passed"


@pytest.mark.asyncio
async def test_create_booking_non_trainee_403(client):
    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_volunteer
    app.dependency_overrides[get_db] = override_db

    response = await client.post("/bookings", json={"slot_id": str(SLOT_ID)})

    assert response.status_code == 403


# --- GET /bookings/mine ---

@pytest.mark.asyncio
async def test_get_my_bookings_trainee(client):
    mock_session = make_mock_session()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [make_mock_booking()]
    mock_session.execute.return_value = mock_result

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_current_user] = fake_trainee
    app.dependency_overrides[get_db] = override_db

    response = await client.get("/bookings/mine")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["trainee_name"] == "Trainee User"
    assert data[0]["status"] == "confirmed"


@pytest.mark.asyncio
async def test_get_my_bookings_volunteer(client):
    mock_session = make_mock_session()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [make_mock_booking()]
    mock_session.execute.return_value = mock_result

    async def override_db():
        yield mock_session

    app.dependency_overrides[get_current_user] = fake_volunteer
    app.dependency_overrides[get_db] = override_db

    response = await client.get("/bookings/mine")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "confirmed"
