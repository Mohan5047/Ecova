# ECOVA REST API Documentation

The ECOVA backend is an Express.js + TypeScript application connecting to a PostgreSQL database, providing JWT authentication, role-based authorization, file uploads via Multer, and real-time events via Socket.IO.

- **Base URL (Local)**: `http://localhost:5000/api`
- **Real-Time URL**: `http://localhost:5000`

---

## 1. Authentication Headers

Authenticated endpoints require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 2. API Response Standard Format

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Reports retrieved",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 54,
    "totalPages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Detailed error message"
}
```

---

## 3. Endpoints Overview

| Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | No | Any | System health check |
| `GET` | `/api/categories` | No | Any | List all active issue categories |
| `POST` | `/api/auth/register` | No | Any | Register a new Citizen account |
| `POST` | `/api/auth/login` | No | Any | Sign in with email and password |
| `GET` | `/api/auth/me` | Yes | Any | Get authenticated user profile & report counts |
| `PATCH`| `/api/auth/profile` | Yes | Any | Update user name, phone, or avatar |
| `POST` | `/api/reports` | Yes | Citizen | Submit a civic report (with image upload) |
| `GET` | `/api/reports/code/:code` | No | Any | Public report tracking & status timeline |
| `GET` | `/api/reports/my` | Yes | Citizen | Get current user's submitted reports |
| `GET` | `/api/reports/:id` | Yes | Any | Get detailed report by numeric ID |
| `GET` | `/api/reports` | Yes | Authority, Admin | List all reports with search & filters |
| `PATCH`| `/api/reports/:id/status` | Yes | Authority, Admin | Update report status & add audit history |
| `POST` | `/api/reports/:id/actions`| Yes | Authority, Admin | Log action taken (CLEANUP, REPAIR, etc.) |
| `GET` | `/api/dashboard` | Yes | Citizen | Metrics and recent submissions for citizen |
| `GET` | `/api/authority/reports` | Yes | Authority, Admin | Department dashboard & assigned reports |
| `GET` | `/api/admin/stats` | Yes | Admin | Platform analytics & category breakdowns |
| `GET` | `/api/admin/users` | Yes | Admin | User registry & role management |
| `POST` | `/api/admin/authority` | Yes | Admin | Create/provision an Authority account |
| `PATCH`| `/api/admin/users/:id/toggle-status` | Yes | Admin | Activate or deactivate user account |
| `GET` | `/api/notifications` | Yes | Any | Fetch user notifications |
| `PATCH`| `/api/notifications/:id/read` | Yes | Any | Mark single notification as read |
| `PATCH`| `/api/notifications/read-all` | Yes | Any | Mark all user notifications as read |

---

## 4. Detailed Endpoint Specifications

### `POST /api/auth/register`
Creates a new `CITIZEN` account with bcrypt-hashed password.

**Request Body (`application/json`)**:
```json
{
  "fullName": "Priya Sharma",
  "email": "priya@example.com",
  "password": "Password@123",
  "phone": "+91 98765 43210"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "full_name": "Priya Sharma",
      "email": "priya@example.com",
      "phone": "+91 98765 43210",
      "role": "CITIZEN",
      "created_at": "2026-09-27T15:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `POST /api/auth/login`
Authenticates a user and issues a signed JWT token.

**Request Body (`application/json`)**:
```json
{
  "email": "citizen@ecova.org",
  "password": "Citizen@123"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "full_name": "Priya Sharma",
      "email": "citizen@ecova.org",
      "role": "CITIZEN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `POST /api/reports`
Submits an issue report. Supports multipart/form-data for photo evidence.

**Request Format (`multipart/form-data`)**:
- `photo`: File (optional, JPEG/PNG/WEBP, max 10MB)
- `category`: String (Name or ID, e.g. "Waste & Garbage")
- `description`: String (max 500 characters)
- `severity`: String (`LOW`, `MEDIUM`, `HIGH`)
- `latitude`: Number
- `longitude`: Number
- `address`: String (optional)

**Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "data": {
    "id": 6,
    "report_code": "ECOVA-100008",
    "status": "SUBMITTED",
    "category_id": 1,
    "description": "Overflowing bin on 100ft road near signal.",
    "severity": "MEDIUM",
    "latitude": "12.9716000",
    "longitude": "77.5946000",
    "address": "100ft Road, Indiranagar, Bengaluru",
    "photo_url": "/uploads/reports/report-1727453356000-847291048.jpg",
    "created_at": "2026-09-27T15:09:16.516Z"
  }
}
```

---

### `GET /api/reports/code/:reportCode`
Public endpoint to track an issue and view its status history timeline.

**Example Request**: `GET /api/reports/code/ECOVA-100001`

**Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Report details retrieved",
  "data": {
    "id": 1,
    "report_code": "ECOVA-100001",
    "description": "Heavy overflow from community garbage bins...",
    "severity": "MEDIUM",
    "status": "UNDER_REVIEW",
    "category_name": "Waste & Garbage",
    "category_icon": "Recycle",
    "authority_name": "Officer Rajesh Kumar",
    "statusHistory": [
      {
        "id": 1,
        "status": "SUBMITTED",
        "note": "Report submitted by citizen with photo evidence and location pin.",
        "created_at": "2026-09-24T15:00:00.000Z",
        "changed_by_name": "Priya Sharma"
      },
      {
        "id": 2,
        "status": "UNDER_REVIEW",
        "note": "Assigned to Ward 82 Sanitation Supervisor for on-site inspection.",
        "created_at": "2026-09-25T15:00:00.000Z",
        "changed_by_name": "Officer Rajesh Kumar"
      }
    ],
    "actions": []
  }
}
```

---

### `PATCH /api/reports/:id/status`
Allows an Authority or Admin to transition the status of a report.

**Request Body (`application/json`)**:
```json
{
  "status": "UNDER_REVIEW",
  "note": "Inspection team dispatched to evaluate pipeline pressure."
}
```

**Valid Statuses**: `SUBMITTED`, `UNDER_REVIEW`, `ACTION_TAKEN`, `RESOLVED`, `REJECTED`

---

### `POST /api/reports/:id/actions`
Logs an official remediation action on a report.

**Request Body (`application/json`)**:
```json
{
  "actionType": "CLEANUP",
  "note": "Waste removal crew completed collection and sanitization."
}
```

**Common Action Types**: `INSPECTION`, `CLEANUP`, `REPAIR`, `WARNING`, `OTHER`

---

## 5. Real-Time Socket.IO Events

The Socket.IO server runs on the same port as the HTTP server (`http://localhost:5000`).

### Client → Server Events
- `join_user_room(userId)`: Joins the private channel `user:${userId}`.
- `leave_user_room(userId)`: Leaves the channel.

### Server → Client Events
- `notification:new`: Triggered when an event generates a notification for the citizen.
- `report:status_changed`: Broadcasts status update for a report code.
- `report:new`: Broadcasts to authorities that a new report has been submitted.
