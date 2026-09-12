# tokensys — Hospital IT Helpdesk & Asset Ticketing System

A full-stack ticketing system for tracking IT support requests and equipment inventory inside a hospital, built after direct experience working hospital IT support myself.

**Live demo:** https://tokensys-frontend.vercel.app/
**Backend API:** https://token-system-snfv.onrender.com

## Why this exists

Most portfolio ticketing apps are generic CRUD clones. This one is grounded in a real environment: hospital IT support has constraints most software doesn't — staff who aren't especially tech-comfortable, strict policies around what can be used for authentication, and a need for accountability on who touched what and when. Every design decision below traces back to one of those constraints.

## Tech stack

- **Backend:** Django, Django REST Framework, Django Channels (WebSockets), SimpleJWT
- **Database:** PostgreSQL (production), SQLite (local dev)
- **Frontend:** React (Vite), Tailwind CSS v4, Axios
- **Deployment:** Render (backend + Postgres), Vercel (frontend)

## Key features

- **Role-based access** — staff, IT admin, and manager roles, enforced at the API level, not just hidden in the UI
- **Ticket lifecycle** — creation, SLA-based due dates by category, status tracking, assignment, and a comment thread per ticket
- **Completed ticket archive** — closed tickets automatically drop out of the active list 24 hours after closing and move to a dedicated Completed page, keeping the working list focused without losing history
- **Live updates** — ticket status changes broadcast over WebSockets, so every open browser tab reflects changes within seconds, with no polling or manual refresh
- **Device & parts inventory** — visible hospital-wide, not just to IT staff, so anyone can check equipment status before filing a ticket
- **Custom CAPTCHA and staff-ID login** — no email-based authentication, matching real hospital policy around staff account credentials

## Design decisions worth knowing about

**No email in authentication.** Many hospital IT policies restrict staff to internal, non-email-based login for clinical and administrative systems. Signup and login use a staff ID instead, which is a more accurate reflection of the real constraint than the email/password default most tutorials teach.

**The login page is deliberately non-generic.** The left panel shows static, non-clickable information tiles (What's new, Dashboard, Tickets, Issue categories) before a user even logs in — aimed at less tech-comfortable staff who benefit from orientation before navigation. This came directly from my own experience as hospital staff, not from a UI template.

**An audit-log table was dropped in favor of two fields.** An earlier version logged every status change in a separate `TicketStatusLog` table. It caused ticket-creation errors that weren't worth the complexity for what this system needs, so I replaced it with `resolved_by` and `closed_at` directly on the `Ticket` model, enforced through a `save()` override — guaranteeing those fields are set correctly regardless of whether a ticket is closed through the API, the admin panel, or anywhere else in the codebase. Simpler, and harder to get into an inconsistent state.

**Real-time updates use Django Channels with an in-memory channel layer.** This works well for a single-process deployment like this one, but a production system running multiple server processes would need Redis as the channel layer backend to keep them in sync — a known, intentional scope boundary for a project this size, not an oversight.

## Architecture

```
React (Vite + Tailwind)
        |
        |  HTTPS + JWT
        v
Django REST Framework  <---->  PostgreSQL
        |
        |  WebSocket
        v
Django Channels (live ticket updates)
```

## Running it locally

**Backend:**
```bash
cd tokensys
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**
```bash
cd tokensys-frontend
npm install
npm run dev
```

Create a `.env` file in `tokensys-frontend` for local development:
```
VITE_API_URL=http://127.0.0.1:8000/api
VITE_WS_URL=ws://127.0.0.1:8000/ws/tickets/
```

## What I'd add next

- Redis-backed channel layer for multi-process production deployments
- Email or SMS notifications when a ticket is assigned or resolved
- A proper password-reset flow (currently a placeholder pointing staff to contact IT directly, matching how most hospital systems actually handle this)
- Pagination on the ticket list for larger datasets
