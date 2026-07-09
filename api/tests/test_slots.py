from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.main import app
from app.dependencies.auth import get_current_user
from app.database import get_db
from app.models.user import User


# Mock Constants
VOLUNTEER_ID = uuid4()
OTHER_USER_ID = uuid4()
SLOT_ID = uuid4()
NOW = datetime.now(timezone.utc)
FUTURE = NOW + timedelta(days=1)


# Dummy user fixtures/helpers
def fake_volunteer():
    return User(
        id=VOLUNTEER_ID,
        google_id="volunteer-google-id",
        email="volunteer@example.com",
        name="Vera Volunteer",
        role="volunteer",
    )


def fake_trainee():
    return User(
        id=OTHER_USER_ID,
        google_id="trainee-google-id",
        email="trainee@example.com",
        name="Tommy Trainee",
        role="trainee",
    )


def make_mock_slot(
    slot_id=SLOT_ID,
    volunteer_id=VOLUNTEER_ID,
    start_time=FUTURE,
    booking=None,
):
    
    slot = MagicMock()
    slot.id = slot_id
    slot.volunteer_id = volunteer_id
    slot.volunteer_name = "Vera Volunteer"
    slot.start_time = start_time
    slot.end_time = start_time + timedelta(hours=1)
    slot.min_booking_notice_hours = 2
    slot.booking = booking
    slot.is_booked = booking is not None
    slot.created_at = NOW
    return slot


def make_mock_booking():
    booking = MagicMock()
    booking.id = uuid4()
    booking.trainee_id = OTHER_USER_ID
    booking.trainee_name = "Tommy Trainee"
    booking.trainee_email = "trainee@example.com"
    booking.agenda = "Intro session"
    booking.status = "confirmed"
    return booking


def make_mock_session():
    return AsyncMock()


# CREATE SLOT TESTS

@pytest.mark.asyncio
@patch("app.crud.slots.check_overlap", new_callable=AsyncMock)
@patch("app.crud.slots.create_slot", new_callable=AsyncMock)
async def test_create_slot_success(mock_create, mock_overlap, client):
    mock_overlap.return_value = False
    mock_slot = make_mock_slot()
    mock_create.return_value = mock_slot

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_volunteer
    app.dependency_overrides[get_db] = override_db

    payload = {
        "start_time": FUTURE.isoformat(),
        "end_time": (FUTURE + timedelta(hours=1)).isoformat(),
        "min_booking_notice_hours": 2,
    }
    response = await client.post("/slots", json=payload)

    assert response.status_code == 201


@pytest.mark.asyncio
@patch("app.crud.slots.check_overlap", new_callable=AsyncMock)
async def test_create_slot_overlap_rejected(mock_overlap, client):
    mock_overlap.return_value = True

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_volunteer
    app.dependency_overrides[get_db] = override_db

    payload = {
        "start_time": FUTURE.isoformat(),
        "end_time": (FUTURE + timedelta(hours=1)).isoformat(),
        "min_booking_notice_hours": 2,
    }
    response = await client.post("/slots", json=payload)

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_create_slot_non_volunteer_403(client):
    app.dependency_overrides[get_current_user] = fake_trainee

    payload = {
        "start_time": FUTURE.isoformat(),
        "end_time": (FUTURE + timedelta(hours=1)).isoformat(),
        "min_booking_notice_hours": 2,
    }
    response = await client.post("/slots", json=payload)

    assert response.status_code == 403


# DELETE SLOT TESTS

@pytest.mark.asyncio
@patch("app.crud.slots.delete_slot", new_callable=AsyncMock)
async def test_delete_slot_success(mock_delete, client):
    mock_delete.return_value = "deleted"

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_volunteer
    app.dependency_overrides[get_db] = override_db

    response = await client.delete(f"/slots/{SLOT_ID}")

    assert response.status_code == 204


@pytest.mark.asyncio
@patch("app.crud.slots.delete_slot", new_callable=AsyncMock)
async def test_delete_booked_slot_rejected(mock_delete, client):
    mock_delete.return_value = "booked"

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_volunteer
    app.dependency_overrides[get_db] = override_db

    response = await client.delete(f"/slots/{SLOT_ID}")
    assert response.status_code == 409


@pytest.mark.asyncio
@patch("app.crud.slots.delete_slot", new_callable=AsyncMock)
async def test_delete_slot_not_owner_403(mock_delete, client):
    mock_delete.return_value = "not_yours"

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_volunteer
    app.dependency_overrides[get_db] = override_db

    response = await client.delete(f"/slots/{SLOT_ID}")

    assert response.status_code == 403


@pytest.mark.asyncio
@patch("app.crud.slots.delete_slot", new_callable=AsyncMock)
async def test_delete_slot_not_found_404(mock_delete, client):
    mock_delete.return_value = "not_found"

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_volunteer
    app.dependency_overrides[get_db] = override_db

    response = await client.delete(f"/slots/{SLOT_ID}")

    assert response.status_code == 404


# GET SLOT TESTS

@pytest.mark.asyncio
@patch("app.crud.slots.get_available_slots", new_callable=AsyncMock)
async def test_get_available_slots_excludes_booked(mock_get_slots, client):
    available_slot = make_mock_slot(booking=None)
    mock_get_slots.return_value = [available_slot]

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_trainee
    app.dependency_overrides[get_db] = override_db

    response = await client.get("/slots/available")

    assert response.status_code == 200
    assert len(response.json()) == 1


@pytest.mark.asyncio
@patch("app.crud.slots.get_available_slots", new_callable=AsyncMock)
async def test_get_available_slots_excludes_past(mock_get_slots, client):
    future_slot = make_mock_slot(start_time=FUTURE)
    mock_get_slots.return_value = [future_slot]

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_trainee
    app.dependency_overrides[get_db] = override_db

    response = await client.get("/slots/available")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == str(future_slot.id)


@pytest.mark.asyncio
@patch("app.crud.slots.get_slots_by_volunteer", new_callable=AsyncMock)
async def test_get_volunteer_slots_includes_booking_info(mock_get_slots, client):
    booked_slot = make_mock_slot(booking=make_mock_booking())
    mock_get_slots.return_value = [booked_slot]

    async def override_db():
        yield make_mock_session()

    app.dependency_overrides[get_current_user] = fake_volunteer
    app.dependency_overrides[get_db] = override_db

    response = await client.get("/slots/mine")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["booking"]["trainee_name"] == "Tommy Trainee"
