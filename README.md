# Smart Commerce

A full-stack e-commerce platform with role-based dashboards for admins, vendors, and customers.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui |
| Backend | Express.js 5 · Node.js 22 |
| Database | MongoDB Atlas |
| Auth | JWT (httpOnly cookie) |
| Containerisation | Docker · Docker Compose |

---

## Running with Docker (recommended)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Build and start all services

```bash
docker compose up --build
```

This spins up two app containers. The database is MongoDB Atlas through `backend/.env`.

| Container | Description | Port |
|---|---|---|
| `smart-commerce-backend` | Express REST API | 5000 |
| `smart-commerce-frontend` | Next.js web app | 3000 |

The first build takes a few minutes. Subsequent starts are fast:

```bash
docker compose up
```

### 2. Seed the database (first time only)

While the containers are running, open a second terminal and run:

```bash
docker compose exec backend node dist/seed.js
```

This creates categories, sample products, and the three demo accounts below.

### 3. Open the app

Visit **http://localhost:3000**

---

## Demo Accounts

| Role | Email | Password | Dashboard |
|---|---|---|---|
| Admin | admin@smartcommerce.local | Admin12345 | /admin |
| Vendor | vendor@smartcommerce.local | Vendor1234 | /vendor |
| Customer | customer@smartcommerce.local | Customer123 | /dashboard |

> Use the quick-fill buttons on the login page — no need to type credentials.

---

## Workflows

### Customer flow

```
Home page → Browse products → Product detail
    → Add to cart → Cart (/cart)
    → Checkout — enter shipping address & payment method
    → Order confirmation (/orders/[id])
    → Customer dashboard (/dashboard) — view all orders & status
```

1. Browse featured and all products on the home page.
2. Click **Add to cart** on any product card or detail page.
3. Open the cart icon in the header to review items.
4. Click **Proceed to checkout**, fill in the shipping form, choose payment (COD / card / bank).
5. Submit — an order is created and you land on the confirmation page.
6. Visit `/dashboard` any time to see all your orders and their current status.

---

### Vendor flow

```
/vendor → overview stats
    → /vendor/products — list, publish/draft, archive
    → /vendor/products/new — create product (name, price, stock, images …)
    → /vendor/orders — view incoming orders, update delivery status
```

1. Log in as vendor and land on `/vendor`.
2. Go to **Products** → **New product** to add items to the catalogue.
3. Toggle a product between **published** and **draft** with the action buttons.
4. Go to **Orders** to see customer orders and advance each through:
   `pending → processing → shipped → delivered`

---

### Admin flow

```
/admin → overview
    → /admin/orders — view all orders, update status
    → /admin/users  — list customers, activate / disable accounts
    → /admin/vendors — list vendors, add new vendor accounts
```

1. Log in as admin and land on `/admin`.
2. **Orders** — monitor every order across all customers and vendors; use **Advance status** to move an order forward.
3. **Users** — see all customers; toggle **Active / Disabled** to control account access.
4. **Vendors** — see existing vendor accounts; use the **Add vendor** form to create new ones (name, email, password).

---

## Running locally (development)

Use this if you want hot-reload and faster iteration.

### Prerequisites

- Node.js 22+
- MongoDB Atlas connection string

### Setup

```bash
# 1. Backend
cd backend
cp .env.example .env          # fill in MONGODB_URI, JWT secrets
npm install
npm run seed                  # seed roles, categories, demo users
npm run dev                   # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
# create frontend/.env.local:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                   # http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env` from this template:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_ACCESS_SECRET=<your-access-token-secret>
JWT_REFRESH_SECRET=<your-refresh-token-secret>
CLIENT_URL=http://localhost:3000
LOG_LEVEL=info
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Runtime environment | `development` |
| `MONGODB_URI` | MongoDB Atlas connection string | — |
| `JWT_ACCESS_SECRET` | Secret for access tokens | — |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | — |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Express API base URL | `http://localhost:5000/api` |

> `backend/.env` contains secrets and is intentionally ignored by Git. Docker Compose reads it through `env_file`, so create it locally before starting the backend container.

---

## Project Structure

```
ecommerce/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose models (User, Product, Order …)
│   │   ├── modules/         # Feature modules (auth, products, orders, users)
│   │   │   └── <module>/
│   │   │       ├── *.service.ts    # business logic
│   │   │       ├── *.controller.ts # request/response handling
│   │   │       └── *.routes.ts     # Express router
│   │   ├── routes/          # Root API router
│   │   ├── middleware/      # Auth, error handling
│   │   └── server.ts        # Entry point
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── (storefront)/    # Public pages: home, products, cart, checkout
│   │   ├── (dashboard)/     # Customer: /dashboard
│   │   ├── (admin)/         # Admin: /admin/*
│   │   ├── (vendor)/        # Vendor: /vendor/*
│   │   └── api/             # Next.js server-side auth proxies
│   ├── components/          # Shared UI components
│   ├── lib/                 # Auth helpers, session, cart context
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## Useful Commands

```bash
# Start everything
docker compose up --build

# Stop everything
docker compose down

# Re-seed Atlas data after a reset
docker compose exec backend node dist/seed.js

# View backend logs
docker compose logs backend -f

# View frontend logs
docker compose logs frontend -f

# Open a shell in any container
docker compose exec backend sh
docker compose exec frontend sh
```
