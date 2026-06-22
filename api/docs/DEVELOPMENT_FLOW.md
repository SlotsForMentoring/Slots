# Development Flow — How to add a feature

Every feature follows the same bottom-up flow. Each layer has one responsibility. You always build in this order:

```
Model → Migration → Schema → CRUD → Service? → Router → main.py
```

---

## The layers

### 1. Model (`app/models/`)

A model maps a database table to a Python class. One file per table.

```python
# app/models/slot.py
class Slot(Base):
    __tablename__ = "slots"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    volunteer_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ...
```

The model is the source of truth for the database schema. It never leaves the backend — the API never returns a model directly.

### 2. Migration (`alembic/versions/`)

After creating or changing a model, generate a migration:

```bash
uv run alembic revision --autogenerate -m "create slots table"
```

Alembic compares your models against the real database and generates the SQL to sync them. Then apply it:

```bash
uv run alembic upgrade head
```

Always review the generated migration file before applying. Alembic sometimes detects changes you did not intend.

### 3. Schema (`app/schemas/`)

Schemas define the shape of data going in and out of the API. They validate input and format output. They do NOT touch the database.

```python
# app/schemas/slot.py
class SlotCreate(BaseModel):
    start_time: datetime
    end_time: datetime

class SlotResponse(BaseModel):
    id: uuid.UUID
    volunteer_name: str
    start_time: datetime
    end_time: datetime

    model_config = {"from_attributes": True}
```

`SlotCreate` = what the client sends. `SlotResponse` = what the server returns. Keep them separate even if they look similar — they change for different reasons.

### 4. CRUD (`app/crud/`)

Pure database functions. They receive a session and return models. They know nothing about HTTP (no request, no response, no status codes).

```python
# app/crud/slots.py
async def create_slot(session: AsyncSession, volunteer_id: uuid.UUID, ...) -> Slot:
    slot = Slot(volunteer_id=volunteer_id, ...)
    session.add(slot)
    await session.commit()
    await session.refresh(slot)
    return slot

async def get_available_slots(session: AsyncSession) -> list[Slot]:
    result = await session.execute(select(Slot).where(...))
    return list(result.scalars().all())
```

If something only touches the database, it lives here.

### 5. Service (`app/services/`) — only when needed

Logic that is not HTTP and not database. Examples:
- Calling Google APIs to exchange OAuth tokens
- Generating a JWT
- Creating a Google Calendar event

Not every feature needs a service. If your endpoint just reads/writes the database, skip this layer — go straight from CRUD to Router.

```python
# app/services/auth.py
async def exchange_code_for_userinfo(code: str) -> dict:
    async with httpx.AsyncClient() as client:
        # call Google token endpoint
        # call Google userinfo endpoint
        return userinfo
```

### 6. Router (`app/routers/`)

The HTTP endpoint. This is the thinnest layer — it only coordinates. It receives the request, calls CRUD or Service, and returns a Schema.

```python
# app/routers/slots.py
router = APIRouter(prefix="/slots", tags=["slots"])

@router.post("", response_model=SlotResponse, status_code=201)
async def create_slot(
    body: SlotCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    slot = await crud_create_slot(session, volunteer_id=user.id, ...)
    return SlotResponse.model_validate(slot)
```

No SQL here. No business logic. No external API calls. Just: receive → delegate → respond.

### 7. Register in `main.py`

One line to activate your new router:

```python
from app.routers import slots
app.include_router(slots.router)
```

Without this line, your endpoint does not exist.

---

## Visual summary

```
Client request
     │
     ▼
  Router         ← receives HTTP request, returns HTTP response
     │
     ├──→ CRUD       ← reads/writes the database
     │
     └──→ Service    ← calls external APIs, generates tokens, etc.
              │
              ▼
         External API (Google, etc.)
```

---

## File structure

When you finish a feature, you should have touched these files:

```
app/
├── models/slot.py          ← 1. define the table
├── schemas/slot.py         ← 3. define input/output shapes
├── crud/slots.py           ← 4. database operations
├── services/calendar.py    ← 5. external logic (if needed)
├── routers/slots.py        ← 6. HTTP endpoint
├── main.py                 ← 7. register the router
alembic/
└── versions/xxxx_create_slots_table.py  ← 2. migration
```

---

## Common mistakes to avoid

- **Do not put SQL in routers.** That belongs in CRUD.
- **Do not return a model from a router.** Convert to a Schema first.
- **Do not call external APIs from CRUD.** That belongs in a Service.
- **Do not skip the migration.** If you changed a model, generate a migration.
- **Do not forget to register the router in main.py.** The endpoint will not exist.
