import pytest
from fastapi import Depends
from httpx import ASGITransport, AsyncClient

from app.dependencies.auth import get_current_user, require_role
from app.main import app
from app.models.user import User


def fake_user(role: str):
    user = User(
        id="00000000-0000-0000-0000-000000000001",
        google_id="fake-google-id",
        email="test@example.com",
        name="Test User",
        role=role,
    )
    return lambda: user


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def setup_test_route():
    @app.get("/test/admin-only")
    async def admin_only(user: User = Depends(require_role("admin"))):
        return {"role": user.role}

    @app.get("/test/multi-role")
    async def multi_role(
        user: User = Depends(require_role("trainee", "volunteer")),
    ):
        return {"role": user.role}

    yield

    app.routes[:] = [
        route for route in app.routes
        if getattr(route, "path", "") not in ("/test/admin-only", "/test/multi-role")
    ]


@pytest.mark.asyncio
async def test_admin_can_access_admin_endpoint(client):
    app.dependency_overrides[get_current_user] = fake_user("admin")
    response = await client.get("/test/admin-only")
    assert response.status_code == 200
    assert response.json()["role"] == "admin"


@pytest.mark.asyncio
async def test_trainee_cannot_access_admin_endpoint(client):
    app.dependency_overrides[get_current_user] = fake_user("trainee")
    response = await client.get("/test/admin-only")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_volunteer_can_access_multi_role_endpoint(client):
    app.dependency_overrides[get_current_user] = fake_user("volunteer")
    response = await client.get("/test/multi-role")
    assert response.status_code == 200
    assert response.json()["role"] == "volunteer"


@pytest.mark.asyncio
async def test_admin_cannot_access_multi_role_endpoint(client):
    app.dependency_overrides[get_current_user] = fake_user("admin")
    response = await client.get("/test/multi-role")
    assert response.status_code == 403
