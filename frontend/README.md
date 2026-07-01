# Frontend Architecture — Atomic Design

Directory structure:

slots/src/
├── components/
│ ├── atoms/ ← reusable base elements (Button, Input, Badge)
│ ├── molecules/ ← combine atoms, single responsibility (SlotCard, UserRow)
│ └── organisms/ ← full UI sections (Navbar, SlotList, SlotForm)
├── pages/ ← one per route, assembles organisms
├── layouts/ ← page wrappers (navbar + content area)
├── context/ ← React context (auth)
├── services/ ← API client
└── mocks/ ← mock data for development

## Core Principle

UI is built from smallest to largest units:

Atom → Molecule → Organism → Page

Atom: could be used in any project (Button, Input, Avatar)
Molecule: combines atoms, one function (SlotCard, BookingCard)
Organism: entire section of a page (Navbar, SlotList with filters)
Page: what the user sees at a route

Each level has strict responsibilities.

---

## Atoms

**Definition:**
Smallest reusable UI elements. No business logic.

**Rules:**

- Must be reusable across ANY project
- No API calls
- No page awareness

**Examples:**

- Button
- Input
- Badge
- Avatar
- Icon

---

## Molecules

**Definition:**
Combination of atoms that serve a single UI function.

**Rules:**

- Combines multiple atoms
- Contains minimal logic (presentation only)
- Represents a reusable UI pattern

**Examples:**

- SlotCard (Button + text + badge)
- UserRow (Avatar + name + role)
- BookingCard

---

## Organisms

**Definition:**
Full sections of a page composed of molecules and atoms.

**Rules:**

- Can contain API calls OR receive data via props
- Represents functional UI blocks
- Not reusable across unrelated pages

**Examples:**

- Navbar
- SlotList (with filters + list)
- SlotForm
- AdminUserTable

---

## Pages

**Definition:**
Route-level components that assemble organisms into a full screen.

**Rules:**

- One page per route
- Handles data orchestration
- Connects to services/context
- No low-level UI logic

**Examples:**

- AvailableSlotsPage
- MySlotsPage
- MyBookingsPage
- AdminUsersPage

---

## Data Flow Rule

Pages → fetch data → pass to Organisms → Organisms compose Molecules → Molecules compose Atoms

NO API calls inside atoms or molecules.

---

## Anti-patterns

- NOT Atom calling API
- NOT Molecule managing routing
- NOT Page containing raw HTML UI blocks
- NOT Business logic inside atoms

---

## Folder Ownership Rule

Each component folder contains:

- index.jsx (entry)
- component.jsx (logic)
- styles.css (optional)

---

## Contract Alignment

All components must strictly respect:
`contracts/*.md`

No deviation in field names or structure is allowed.

---

End of architecture document.
