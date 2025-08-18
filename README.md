# LPMS - Land Management System

A full‑stack web application built with React (Vite + TypeScript) and Node.js/Express for land registration and ownership workflows with JWT authentication and RBAC (roles: admin, owner, public).

## Features

- **Authentication**: Signup, login, logout (HTTP-only cookies)
- **RBAC**: Admin and Owner dashboards with protected routes
- **Owner flows**: My Land, Register Land, My Disputes, Add Dispute, My Transfers, Add To Transfer, Cancel Transfer, Remove Dispute
- **Admin flows**: Approve Land, Approve Transfer, Manage Disputes, View Transfers
- **Modern stack**: React 19, Tailwind CSS, Zustand, Axios; Express + Mongoose

## Tech Stack

### Frontend
- React 19 + TypeScript (Vite)
- React Router, Zustand, Axios
- Tailwind CSS

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT, bcrypt, cookie-parser

## Prerequisites

- Node.js v18+
- npm
- MongoDB (local or Atlas)

## Installation

1) Clone and open the project

```bash
git clone <your-repository-url>
cd Lpms
```

2) Backend setup

```bash
cd backend
npm install
```

Create `.env` in `backend/`:

```env
Port=3000
Mongo_Url=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start backend (dev):

```bash
npm run dev
```

3) Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` (proxy to backend `/api` → `http://localhost:3000`).

## Authentication Endpoints (`/api/auth`)

- POST `/api/auth/signup`
  - body: `{ citizenId, email, phoneNumber, name, password }`
  - note: default role is now `owner` for new users
- POST `/api/auth/login`
  - body: `{ citizenId, password }`
- POST `/api/auth/logout`

## Owner Endpoints (`/api/owner`) [requires role: owner]

- GET `/api/owner/me` → current user profile
- GET `/api/owner/myland` → list lands owned by the user
- POST `/api/owner/addland`
  - body: `{ parcelId, sizeSqm, usageType<'business'|'farming'|'residential'>, address?, latitude?, longitude? }`
- POST `/api/owner/addDispute`
  - body: `{ fileUrl, parcelId, landOwnerCitizenId, raisedByUserCitizenId }`
- GET `/api/owner/MyDispute?page=1&limit=10` → paginated disputes for the user
- PUT `/api/owner/removeDispute/:id` → soft‑drop a dispute
- PUT `/api/owner/cancelTransfer/:transferId` → cancel active transfer initiated by user
- POST `/api/owner/addToTransfer`
  - body: `{ parcelId, sellerCitizenId, buyerCitizenId }`
- GET `/api/owner/MyTransfers?page=1&limit=10` → paginated transfers involving the user

## Admin Endpoints (`/api/admin`) [requires role: admin]

- GET `/api/admin/me` → admin profile
- POST `/api/admin/approveLand`
  - body: `{ parcelId }` → sets land status to `active`, records approval and ownership history
- POST `/api/admin/approvetransfer`
  - body: `{ transferId }` → marks transfer sold, moves land ownership to buyer
- POST `/api/admin/fixDisputes`
  - body: `{ disputeId }` → marks dispute as solved
- GET `/api/admin/seeTransfers?page=1&limit=10` → paginated transfers
- GET `/api/admin/seeDisputes?page=1&limit=10` → paginated disputes (non‑deleted)

## Frontend Routes & Behavior

- Public: `/` (Landing), `/signin`, `/signup`
- Auth‑only: `/welcome`
- Owner Dashboard: `/owner` (tabs: My Land, Register Land, My Disputes, Add Dispute, My Transfers, Add To Transfer)
- Admin Dashboard: `/admin` (tabs: Approve Land, Disputes, Transfers, Approve Transfer)
- Redirects after auth:
  - role `owner` → `/owner`
  - role `admin` → `/admin`
  - otherwise → previous page or `/welcome`

## Database Models (summary)

- User: `{ citizenId, email, phoneNumber, name, role<'admin'|'owner'|'public'>(default 'owner'), password, deleted_at, timestamps }`
- Land: `{ parcelId, ownerId, sizeSqm, usageType, location{address,gps}, ownershipHistory[], status, approvedBy, timestamps }`
- Dispute: `{ fileUrl, parcelId, landOwnerCitizenId, raisedByUserCitizenId, status, adminApproved, deleted_at, timestamps }`
- Transfer: `{ parcelId, sellerCitizenId, buyerCitizenId, status, adminApproved, timestamps }`

## Notes

- This README covers currently implemented endpoints and dashboards. More endpoints and features will continue to be added.


