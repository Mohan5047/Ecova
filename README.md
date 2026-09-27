# ECOVA — Civic & Environmental Issue Reporting Platform

ECOVA is a modern, full-stack civic technology platform designed to bridge citizens and municipal authorities. It empowers people to report unhealthy, unsafe, polluted, or neglected surroundings and track real-time remediation by responsible public authorities.

---

## Architecture Overview

```
ECOVA/
├── frontend/                     # React + Vite + TypeScript Client
│   ├── src/
│   │   ├── components/           # Navbar, Footer, StatusBadge, Timeline, Modals, EmptyState
│   │   ├── pages/                # Home, ReportIssue, Tracking, MyReports, Dashboards, Auth
│   │   ├── services/             # api.ts (REST client facade), socket.ts (Socket.IO client)
│   │   ├── context/              # AuthContext.tsx (JWT session management)
│   │   ├── types/                # Frontend TypeScript models
│   │   └── App.css               # Clean Green civic theme & responsive styles
│   ├── .env                      # VITE_API_URL, VITE_SOCKET_URL
│   └── package.json
│
├── backend/                      # Node.js + Express.js + TypeScript REST & WebSocket Server
│   ├── src/
│   │   ├── config/               # db.ts (pg connection pool), env.ts (environment loader)
│   │   ├── controllers/          # auth, report, notification, authority, admin, dashboard
│   │   ├── middleware/           # auth.middleware, role.middleware, upload.middleware, error
│   │   ├── routes/               # Modular Express routers
│   │   ├── services/             # reportCode.service (atomic sequence), socket.service (rooms)
│   │   ├── types/                # Backend TypeScript types
│   │   ├── app.ts                # Express app setup with CORS, Helmet, and static files
│   │   └── server.ts             # HTTP & Socket.IO server entry point
│   ├── database/
│   │   ├── schema.sql            # PostgreSQL DDL (tables, sequences, indexes)
│   │   └── seed.sql              # Pre-seeded categories, accounts, sample reports
│   ├── uploads/reports/          # Physical directory for uploaded evidence photos
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                      # Database credentials, JWT secret, ports
│   └── .env.example
│
├── docs/
│   └── API.md                    # Detailed REST API and Socket.IO specifications
└── README.md
```

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, React Router DOM 7, Framer Motion, Lucide React, Socket.IO Client.
- **Backend**: Node.js, Express.js, TypeScript, PostgreSQL (`pg`), JWT (`jsonwebtoken`), `bcryptjs`, Multer, Helmet, Morgan, `express-rate-limit`.
- **Real-Time**: Socket.IO (WebSocket & polling fallbacks).
- **Database**: PostgreSQL 18 with connection pooling, transactions, and sequence-backed report codes.

---

## User Roles & Permissions

1. **CITIZEN**
   - Public registration (defaults to `CITIZEN`).
   - Submit issue reports with photo evidence, GPS location pin, category, and severity.
   - Receive auto-generated sequence codes (`ECOVA-XXXXXX`).
   - Track live report progress via interactive 4-stage timeline.
   - Manage submitted reports in "My Reports".
   - Receive real-time notifications via WebSocket as status progresses.

2. **AUTHORITY**
   - Sign in to municipal department console.
   - View assigned reports based on category routing (Waste, Water, Pollution, Infrastructure).
   - Review photo evidence, coordinates, and description.
   - Transition report statuses (`SUBMITTED` → `UNDER_REVIEW` → `ACTION_TAKEN` → `RESOLVED`).
   - Record official remediation action notes (`CLEANUP`, `REPAIR`, `INSPECTION`, `WARNING`).

3. **ADMIN**
   - Access comprehensive governance dashboard with PostgreSQL database aggregates.
   - View system-wide metrics (users, reports, severity breakdown, category distribution).
   - Manage user accounts (toggle active/inactive status).
   - Provision verified authority personnel.

---

## Default Development Accounts

For instant testing, the database includes pre-seeded accounts:

| Role | Email | Password | Access Route |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@ecova.org` | `Citizen@123` | `/dashboard`, `/report`, `/reports` |
| **Authority** | `authority@ecova.org` | `Authority@123` | `/authority` |
| **Admin** | `admin@ecova.org` | `Admin@123` | `/admin` |

*Note: The login page includes 1-click demo buttons to test each role instantly.*

---

## Getting Started Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested with v25.3.0)
- [PostgreSQL](https://www.postgresql.org/) v14+ (tested with v18.4)

### 2. Database Setup

Ensure PostgreSQL is running on `localhost:5432`. Create the database and execute the schema and seed scripts:

```powershell
# Using psql on Windows / PowerShell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -c "CREATE DATABASE ecova_db;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -d ecova_db -f "backend/database/schema.sql"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -d ecova_db -f "backend/database/seed.sql"
```

### 3. Backend Setup

```powershell
cd backend
npm install
npm run build
npm start
# Or for development with live reload:
npm run dev
```

The backend server will start on `http://localhost:5000/api`.

### 4. Frontend Setup

In a new terminal window:

```powershell
cd frontend
npm install
npm run dev
```

The frontend application will start on `http://localhost:5173`.

---

## End-to-End Workflow Verification

1. **Submit a Report**:
   - Open `http://localhost:5173/report`.
   - Upload an image (JPG, PNG, or WEBP up to 10MB).
   - Select category (e.g. *Waste & Garbage*).
   - Click "Use my current location" to capture GPS coordinates.
   - Enter description and choose severity.
   - Click **Submit Report**.
   - The backend records the report, saves the image to `backend/uploads/reports/`, generates a unique `ECOVA-XXXXXX` code, creates an audit record, and triggers a real-time notification.

2. **Track the Issue**:
   - Navigate to `/tracking?id=ECOVA-XXXXXX`.
   - View live data directly from PostgreSQL: report details, location pin, photo evidence, and 4-step progress timeline.

3. **Authority Action**:
   - Sign in as `authority@ecova.org` (`Authority@123`).
   - Navigate to `/authority`.
   - Click "Update" on the assigned report.
   - Transition status to `UNDER_REVIEW` and log action note `CLEANUP`.
   - The citizen receives a real-time notification via Socket.IO without refreshing the page.

4. **Resolution**:
   - Mark status as `RESOLVED`.
   - Revisit `/tracking?id=ECOVA-XXXXXX` to verify that the timeline reflects the completed resolution.

---

## API Documentation

For the complete API schema, request parameters, response structures, and Socket.IO events, see [`docs/API.md`](docs/API.md).
