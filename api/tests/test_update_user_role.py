import uuid as uuid_mod

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
        created_at=NOW,
        updated_at=NOW,
    )


def fake_trainee():
    return User(
        id="00000000-0000-0000-0000-000000000002",
        google_id="trainee-google-id",
        email="trainee@example.com",
        name="Trainee User",
        role="trainee",
        created_at=NOW,
        updated_at=NOW,
    )


TARGET_USER = User(
    id="00000000-0000-0000-0000-000000000010",
    google_id="g1",
    email="jane@example.com",
    name="Jane",
    role="volunteer",
    created_at=NOW,
    updated_at=NOW,
)


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.mark.asyncio
@patch("app.crud.users.reset_user_data", new_callable=AsyncMock, return_value=[])
@patch("app.crud.users.update_user_role", new_callable=AsyncMock)
@patch("app.crud.users.get_user_by_id", new_callable=AsyncMock)
async def test_admin_can_update_role(mock_get, mock_update, mock_reset, client):
    mock_get.return_value = TARGET_USER
    mock_update.return_value = TARGET_USER
    app.dependency_overrides[get_current_user] = fake_admin
    response = await client.patch(
        f"/admin/users/{TARGET_USER.id}/role",
        json={"role": "volunteer"},
    )
    assert response.status_code == 200
    assert response.json()["role"] == "volunteer"


@pytest.mark.asyncio
async def test_trainee_cannot_update_role(client):
    app.dependency_overrides[get_current_user] = fake_trainee
    response = await client.patch(
        "/admin/users/00000000-0000-0000-0000-000000000010/role",
        json={"role": "volunteer"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
@patch("app.crud.users.get_user_by_id", new_callable=AsyncMock, return_value=None)
async def test_returns_404_when_user_not_found(mock_get, client):
    app.dependency_overrides[get_current_user] = fake_admin
    response = await client.patch(
        "/admin/users/00000000-0000-0000-0000-999999999999/role",
        json={"role": "volunteer"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
async def test_rejects_invalid_role(client):
    app.dependency_overrides[get_current_user] = fake_admin
    response = await client.patch(
        "/admin/users/00000000-0000-0000-0000-000000000010/role",
        json={"role": "superadmin"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
@patch("app.crud.users.reset_user_data", new_callable=AsyncMock, return_value=[])
@patch("app.crud.users.update_user_role", new_callable=AsyncMock)
@patch("app.crud.users.get_user_by_id", new_callable=AsyncMock)
async def test_role_change_triggers_data_reset(mock_get, mock_update, mock_reset, client):
    trainee = User(
        id="00000000-0000-0000-0000-000000000020",
        google_id="g2",
        email="trainee@example.com",
        name="Trainee",
        role="trainee",
        created_at=NOW,
        updated_at=NOW,
    )
    mock_get.return_value = trainee
    updated = User(
        id=trainee.id,
        google_id=trainee.google_id,
        email=trainee.email,
        name=trainee.name,
        role="volunteer",
        created_at=NOW,
        updated_at=NOW,
    )
    mock_update.return_value = updated
    app.dependency_overrides[get_current_user] = fake_admin
    response = await client.patch(
        f"/admin/users/{trainee.id}/role",
        json={"role": "volunteer"},
    )
    assert response.status_code == 200
    mock_reset.assert_called_once()


@pytest.mark.asyncio
async def test_admin_cannot_change_own_role(client):
    admin_id = uuid_mod.UUID("00000000-0000-0000-0000-000000000001")

    def fake_admin_with_uuid():
        return User(
            id=admin_id,
            google_id="admin-google-id",
            email="admin@example.com",
            name="Admin User",
            role="admin",
            created_at=NOW,
            updated_at=NOW,
        )

    app.dependency_overrides[get_current_user] = fake_admin_with_uuid
    response = await client.patch(
        f"/admin/users/{admin_id}/role",
        json={"role": "trainee"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot change your own role"


@pytest.mark.asyncio
@patch("app.crud.users.reset_user_data", new_callable=AsyncMock, return_value=[])
@patch("app.crud.users.update_user_role", new_callable=AsyncMock)
@patch("app.crud.users.get_user_by_id", new_callable=AsyncMock)
async def test_same_role_skips_data_reset(mock_get, mock_update, mock_reset, client):
    mock_get.return_value = TARGET_USER
    mock_update.return_value = TARGET_USER
    app.dependency_overrides[get_current_user] = fake_admin
    response = await client.patch(
        f"/admin/users/{TARGET_USER.id}/role",
        json={"role": "volunteer"},
    )
    assert response.status_code == 200
    mock_reset.assert_not_called()
