# AI-Driven Smart E-Commerce Platform

## Implementation Tracker

Last updated: 2026-04-24

### Completed in the current codebase

- [x] `frontend` scaffolded with `Next.js 16`, `React 19`, `App Router`, `TypeScript`, `ESLint`, `Tailwind CSS`, no `src/`, and alias `@/*`
- [x] shadcn/ui-style setup foundation added with reusable `button`, `card`, and `badge` components plus `components.json`
- [x] polished storefront shell created with:
  - home page
  - products page
  - product detail page
  - live login/access page
- [x] admin dashboard shell created with:
  - overview KPI cards
  - revenue trend visualization
  - inventory alerts
  - recent orders panel
  - audit activity feed
  - top product insights
- [x] `backend` service created with `Express.js`, `TypeScript`, `MongoDB/Mongoose`, `JWT`, `RBAC-ready middleware`, and `zod` validation
- [x] backend modules created for:
  - health
  - auth
  - products
  - analytics overview
  - audit logs
- [x] MongoDB-ready environment configuration added in `backend/.env` and `frontend/.env.local`
- [x] database seed script added with:
  - roles
  - admin user
  - demo customer
  - categories
  - products
  - sample orders
  - audit logs
- [x] local MongoDB helper added via `docker-compose.yml`
- [x] MongoDB Atlas connection configured in `backend/.env` and seeded successfully into `smart_ecommerce`
- [x] interactive authentication flow added with:
  - live login form
  - Next-managed secure token cookie storage
  - current session and logout endpoints
  - session-aware storefront and admin UI chrome
  - admin login redirect to `/admin`
- [x] admin protection enabled with:
  - server-side role guard for `/admin`
  - protected backend analytics overview route
  - protected backend audit log route
- [x] storefront visual direction refreshed toward a marketplace pattern with:
  - commerce-style header and footer
  - category-first home page hero and promo sections
  - improved product cards and product detail presentation
  - searchable, category-filtered products page
- [x] catalog demo data refreshed with a broader marketplace mix:
  - grocery essentials
  - home care
  - personal care
  - kitchen and dining
  - electronics and gadgets
  - fashion and lifestyle
- [x] verification completed:
  - frontend lint passes
  - frontend production build passes
  - backend typecheck passes
  - backend production build passes
  - backend seed passes against MongoDB Atlas

### In progress / next implementation targets

- [ ] full product/category CRUD management screens
- [ ] cart, wishlist, checkout, and order placement flow
- [ ] advanced analytics pages beyond overview
- [ ] smart inventory workflows with action handling
- [ ] demand forecasting module and recommendation engine
- [ ] testing suite and deployment automation

## 1. Project Overview

This project is a smart, enterprise-style e-commerce platform built on a MERN-oriented architecture with an AI and analytics layer for predictive decision support. The platform should go beyond standard online shopping flows and provide:

- modern storefront commerce
- intelligent inventory and demand planning
- user behavior analytics
- governance-aware administration
- role-based access and full auditability

The goal is to deliver a production-ready system that is academically strong, business-relevant, and visually polished enough to feel like a premium SaaS commerce product.

## 2. Product Vision

Build a professional, user-friendly, and eye-catching e-commerce system that has two strong faces:

1. A customer-facing storefront that feels fast, elegant, trustworthy, and conversion-focused.
2. An admin and business dashboard that feels operationally powerful, data-rich, and governance-aware.

The platform should help SMEs make better business decisions through analytics, demand forecasting, and inventory intelligence instead of acting as a simple order-taking application.

## 3. Required Frontend Stack

The frontend must be created inside a folder named `frontend` with the following rules:

- `Next.js 16`
- `React 19`
- `App Router`
- `TypeScript enabled`
- `ESLint enabled`
- `Tailwind CSS`
- `shadcn/ui`
- `src/ directory: NO`
- import alias: `@/*`

Recommended scaffold command:

```bash
npx create-next-app@latest frontend --typescript --eslint --tailwind --app --use-npm --no-src-dir --import-alias "@/*" --yes
```

After scaffolding, verify `package.json` uses:

- `next` version `16.x`
- `react` version `19.x`
- `react-dom` version `19.x`

Recommended frontend UI stack:

- `shadcn/ui` for reusable UI primitives
- `lucide-react` for icons
- `react-hook-form` + `zod` for forms and validation
- `recharts` for charts on analytics dashboards
- `axios` or native `fetch` for API access
- `sonner` or shadcn toast for notifications

Recommended shadcn/ui components to add early:

- `button`
- `input`
- `form`
- `card`
- `table`
- `dialog`
- `sheet`
- `dropdown-menu`
- `badge`
- `tabs`
- `select`
- `textarea`
- `skeleton`
- `toast`
- `alert-dialog`
- `avatar`
- `separator`
- `breadcrumb`

## 4. Recommended Backend Stack

Create a `backend` service for API, business rules, database access, AI orchestration, and governance logic.

Recommended backend setup:

- `Node.js`
- `Express.js`
- `TypeScript`
- `MongoDB` with `Mongoose`
- `JWT` authentication
- `bcryptjs`
- `helmet`
- `cors`
- `dotenv`
- `morgan` or structured logger
- `express-rate-limit`
- `zod` for request validation

Recommended backend responsibilities:

- authentication and authorization
- product, category, inventory, order, and user management
- analytics aggregation
- audit log creation
- AI forecast and recommendation orchestration

## 5. Database and Connectivity Plan

Use MongoDB as the primary operational database. The frontend must never connect directly to the database. All database operations should go through the backend API.

### Core environment variables

`backend/.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/smart_ecommerce
JWT_ACCESS_SECRET=replace_with_secure_secret
JWT_REFRESH_SECRET=replace_with_secure_secret
CLIENT_URL=http://localhost:3000
LOG_LEVEL=info
```

`frontend/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Smart Commerce
```

### Recommended database collections

- `users`
- `roles`
- `products`
- `categories`
- `inventory`
- `orders`
- `orderItems`
- `payments`
- `carts`
- `wishlists`
- `auditLogs`
- `activityLogs`
- `behaviorEvents`
- `forecasts`
- `inventoryAlerts`
- `recommendations`
- `notifications`

### Initial database connection workflow

1. Install MongoDB locally or create a MongoDB Atlas cluster.
2. Create the `smart_ecommerce` database.
3. Set `MONGODB_URI` in `backend/.env`.
4. Start the backend service and confirm successful connection logs.
5. Run seed scripts for roles, admin account, demo products, and sales history.
6. Start the frontend and verify API connectivity through login and product listing screens.

## 6. Suggested Monorepo Structure

```text
ecommerce/
|-- frontend/
|   |-- app/
|   |-- components/
|   |-- lib/
|   |-- hooks/
|   |-- services/
|   |-- types/
|   |-- public/
|   |-- middleware.ts
|   |-- package.json
|   `-- .env.local
|
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- users/
|   |   |   |-- products/
|   |   |   |-- categories/
|   |   |   |-- cart/
|   |   |   |-- orders/
|   |   |   |-- inventory/
|   |   |   |-- analytics/
|   |   |   |-- forecasts/
|   |   |   |-- audit/
|   |   |   `-- recommendations/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- server.ts
|   |-- package.json
|   `-- .env
|
|-- ai-service/                optional
|-- docs/
|-- project.md
`-- README.md
```

## 7. High-Level Architecture

### Frontend

- Customer storefront built with Next.js App Router
- Admin dashboard built in the same frontend app under protected admin routes
- Server components for data-heavy pages where possible
- Client components for filters, cart, charts, interactive forms, and live dashboard widgets

### Backend

- REST API with modular route and service layers
- JWT-based auth with RBAC middleware
- Audit log middleware for sensitive operations
- Analytics aggregation endpoints
- Inventory and forecasting services

### AI and Analytics Layer

Use a staged approach:

1. Start with rule-based analytics and deterministic inventory alerts.
2. Add forecasting based on historical sales trends.
3. Add recommendation logic using browsing and purchase behavior.
4. Optionally separate ML logic into a lightweight Python microservice if model complexity grows.

## 8. Major Functional Modules

### Customer Modules

- registration and login
- product browsing
- search, filtering, and sorting
- cart and wishlist
- checkout and order tracking
- profile and order history
- personalized recommendations

### Admin Modules

- product and category management
- inventory control
- order and customer management
- analytics dashboard
- demand forecasting workspace
- audit trail viewer
- role and permission management

### Governance Modules

- RBAC with roles such as `super_admin`, `admin`, `inventory_manager`, `analyst`, and `customer`
- action logging for create, update, delete, approve, export, and permission changes
- admin activity history
- critical event monitoring

## 9. API Domains

Recommended API grouping:

- `/api/auth`
- `/api/users`
- `/api/products`
- `/api/categories`
- `/api/cart`
- `/api/orders`
- `/api/inventory`
- `/api/analytics`
- `/api/forecasts`
- `/api/recommendations`
- `/api/audit`
- `/api/admin`

## 10. Professional Website and Dashboard Direction

### Storefront design direction

The storefront should feel premium, fast, and conversion-focused:

- clean visual hierarchy
- high-quality product imagery
- simple but polished typography
- strong mobile responsiveness
- quick product discovery with filters and search
- trust signals such as stock status, rating, delivery estimate, and secure checkout cues
- personalized recommendation blocks without making the UI feel cluttered

### Dashboard design direction

The admin panel should feel like a serious business tool:

- compact KPI cards at the top
- trend charts for revenue, orders, and demand
- low-stock and reorder alerts surfaced immediately
- recent orders and audit activity visible without scrolling too far
- clean tables with filters, bulk actions, and status badges
- predictable navigation with role-based menu visibility

### Visual tone

- professional and modern
- neutral base palette with one strong accent color
- restrained use of gradients
- clear status colors for success, warning, error, and pending states
- 8px or lower radius for most cards and controls
- strong spacing consistency

## 11. Detailed Phase-by-Phase Workflow

## Phase 0 - Planning and Project Foundation

### Goal

Turn the proposal into a clear implementation roadmap and establish the repository structure.

### Tasks

- finalize scope for MVP and post-MVP features
- define modules and route map
- prepare wireframe list for storefront and dashboard
- define collection schema list
- define role matrix and access rules
- document environment variables and setup instructions

### Output

- approved feature list
- system architecture plan
- repo structure
- initial project documentation

## Phase 1 - Frontend Foundation and Design System

### Goal

Create the frontend shell in `frontend` using Next.js 16, React 19, Tailwind CSS, and shadcn/ui.

### Tasks

- scaffold `frontend` with App Router and TypeScript
- install and initialize `shadcn/ui`
- create a base theme, typography scale, spacing rules, and layout system
- create reusable UI primitives for navbar, footer, product card, dashboard cards, and tables
- create app shells for:
  - customer storefront
  - authenticated customer area
  - admin dashboard

### Website experience focus

- attractive home page with strong product discovery
- category browsing that feels clean and fast
- responsive navigation with search and cart access

### Dashboard focus

- top navigation and sidebar
- KPI row
- chart region
- activity feed
- reusable data table pattern

### Output

- frontend base ready for feature development
- unified visual language for storefront and dashboard

## Phase 2 - Authentication, Authorization, and Governance Base

### Goal

Implement secure identity, session flow, and governance-aware role handling.

### Tasks

- build register, login, logout, refresh token, and protected route flow
- define role entities and permission checks
- implement backend RBAC middleware
- implement frontend role guards for admin routes
- create audit logging strategy for sensitive actions
- create admin user seed flow

### UX focus

- simple login and signup flow
- clear permission-denied states
- secure and trustworthy admin access flow

### Output

- working auth system
- role-aware admin area
- baseline governance and audit capture

## Phase 3 - Product Catalog and Customer Commerce Flow

### Goal

Build the customer-facing commerce engine.

### Tasks

- product CRUD and category CRUD
- product listing page with filters, sort, pagination, and search
- product details page with images, stock, attributes, and related items
- cart management
- wishlist management
- checkout flow with address capture and COD option
- order placement and order history

### Website experience focus

- beautiful product cards
- fast filters and category chips
- sticky cart actions on mobile
- frictionless checkout steps

### Output

- complete customer purchase flow from browse to order confirmation

## Phase 4 - Admin Operations Dashboard

### Goal

Create the operational command center for business users.

### Tasks

- product management tables and forms
- order management with status updates
- customer management views
- inventory monitoring table
- low-stock alert panel
- admin activity feed
- quick stats for sales, orders, revenue, and inventory health

### Dashboard experience focus

- at-a-glance business summary
- fast access to urgent actions
- readable tables and filters
- role-aware navigation and widgets

### Output

- usable admin workspace for daily operations

## Phase 5 - Real-Time Analytics and Behavior Tracking

### Goal

Add actionable business intelligence to the platform.

### Tasks

- capture user events such as page views, searches, cart additions, and purchases
- create backend aggregation endpoints
- build analytics views for:
  - daily sales
  - monthly revenue
  - top-performing products
  - abandoned cart patterns
  - customer segmentation
- create dashboard widgets and charts

### Dashboard experience focus

- summary cards with period comparison
- trend lines and category breakdowns
- customer behavior insights that can guide campaigns and stocking decisions

### Output

- analytics dashboard with meaningful business insights

## Phase 6 - Smart Inventory Optimization

### Goal

Turn inventory from a static count into an intelligent operational module.

### Tasks

- define reorder threshold rules
- compute stock velocity
- create low-stock, overstock, and slow-moving alerts
- build automated reorder suggestion logic
- show alert priority levels and recommended quantities
- create admin dashboard cards for urgent inventory attention

### Output

- intelligent inventory view with action-oriented recommendations

## Phase 7 - AI-Based Demand Forecasting

### Goal

Use sales history and product trends to forecast future demand.

### Tasks

- collect historical order and product movement data
- prepare forecasting dataset
- begin with baseline forecasting models such as moving average or regression
- expose forecast results through backend endpoints
- create forecast visualization for each product and category
- compare predicted demand against current inventory
- surface decision-support widgets such as:
  - expected stockout risk
  - likely overstock risk
  - recommended reorder window

### Research value

- directly supports the academic contribution of predictive planning in SME commerce systems
- provides measurable output for evaluation and reporting

### Output

- forecast-enabled product and inventory insights

## Phase 8 - Recommendation and Personalization Layer

### Goal

Improve conversion and engagement using user behavior data.

### Tasks

- build recommendation rules using browsing, cart, and purchase history
- add product suggestions to home, product, cart, and account pages
- create admin analytics around recommendation performance
- track clicks and conversions from recommendation blocks

### Website experience focus

- personalized but non-intrusive sections
- relevant suggestions near decision points

### Output

- basic recommendation engine integrated into user journey

## Phase 9 - Security, Testing, and Production Readiness

### Goal

Prepare the platform for stable deployment and academic demonstration.

### Tasks

- add request validation and error handling everywhere
- secure APIs with rate limiting, sanitized input, and JWT verification
- write unit and integration tests for core flows
- test admin permissions and audit log accuracy
- test database recovery and seed flow
- optimize page performance and API latency
- prepare deployment environments

### Output

- production-ready release candidate
- stable demo build
- documented setup and deployment workflow

## 12. Recommended Screen List

### Storefront

- home page
- category page
- product listing page
- product details page
- cart page
- checkout page
- order success page
- login page
- signup page
- profile page
- order history page
- wishlist page

### Admin

- dashboard overview
- products management
- categories management
- inventory management
- orders management
- customers management
- analytics dashboard
- forecasting dashboard
- audit log viewer
- roles and permissions page

## 13. Governance and Audit Expectations

Every critical business action should be traceable. Track at minimum:

- who performed the action
- when it happened
- what entity was changed
- previous value and new value where applicable
- IP or request metadata when useful
- whether the action succeeded or failed

Critical actions to log:

- product creation and edits
- stock adjustments
- role changes
- order status changes
- login attempts
- user deactivation
- forecast parameter changes

## 14. Recommended Delivery Milestones

### Milestone 1

Project scaffolding, auth, base UI, and MongoDB connection

### Milestone 2

Customer storefront, product catalog, cart, checkout, and order flow

### Milestone 3

Admin operations dashboard, inventory alerts, and audit framework

### Milestone 4

Analytics dashboard, forecasting, recommendations, testing, and deployment

## 15. Local Development Workflow

### Step 1 - Start MongoDB

Use either:

- local MongoDB service
- Docker container
- MongoDB Atlas

For Docker-based local MongoDB:

```bash
docker compose up -d mongo
```

### Step 2 - Start backend

Example workflow:

```bash
cd backend
npm install
npm run seed
npm run dev
```

### Step 3 - Start frontend

Example workflow:

```bash
cd frontend
npm install
npm run dev
```

### Step 4 - Verify

Confirm:

- frontend loads on `http://localhost:3000`
- backend API responds on `http://localhost:5000`
- MongoDB connection is successful
- admin can log in
- product list loads from the database

## 16. Success Criteria

The project is successful when:

- the frontend is running in `frontend` with Next.js 16 and React 19
- MongoDB is connected through the backend
- a customer can browse, cart, and order products
- an admin can manage products, orders, and inventory
- analytics dashboards show real data
- forecasting and intelligent inventory recommendations are visible
- governance controls and audit logs are operational

## 17. Final Build Strategy

Build the platform in this order:

1. foundation and setup
2. auth and RBAC
3. core commerce flows
4. admin operations
5. analytics
6. forecasting
7. recommendations
8. testing and deployment

This order reduces risk, keeps the system demoable at every stage, and ensures that AI features are layered on top of a stable commerce core instead of being developed in isolation.
