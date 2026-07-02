import pytest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch
from httpx import ASGITransport, AsyncClient

from app.dependencies.auth import get_current_user
from app.main import app
from app.models.user import User

NOW = datetime.now(timezone.utc)


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


MOCK_USERS = [
    User(
        id="00000000-0000-0000-0000-000000000010",
        google_id="g1",
        email="alice@example.com",
        name="Alice",
        role="trainee",
        created_at=NOW,
        updated_at=NOW,
    ),
    User(
        id="00000000-0000-0000-0000-000000000011",
        google_id="g2",
        email="bob@example.com",
        name="Bob",
        role="volunteer",
        created_at=NOW,
        updated_at=NOW,
    ),
]


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.mark.asyncio
@patch("app.crud.users.get_all_users", new_callable=AsyncMock)
async def test_admin_can_list_users(mock_get_all, client):
    mock_get_all.return_value = MOCK_USERS
    app.dependency_overrides[get_current_user] = fake_admin
    response = await client.get("/admin/users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["email"] == "alice@example.com"
    assert data[1]["role"] == "volunteer"


@pytest.mark.asyncio
async def test_trainee_cannot_list_users(client):
    app.dependency_overrides[get_current_user] = fake_trainee
    response = await client.get("/admin/users")
    assert response.status_code == 403


@pytest.mark.asyncio
@patch("app.crud.users.get_all_users", new_callable=AsyncMock)
async def test_filter_by_role(mock_get_all, client):
    mock_get_all.return_value = [MOCK_USERS[1]]
    app.dependency_overrides[get_current_user] = fake_admin
    response = await client.get("/admin/users?role=volunteer")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["role"] == "volunteer"
    mock_get_all.assert_called_once()
    call_kwargs = mock_get_all.call_args
    assert call_kwargs.kwargs["role"] == "volunteer"
