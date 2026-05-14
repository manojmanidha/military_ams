# Military AMS — Backend

## Tech Stack

- **Node.js + Express** — lightweight, async-friendly REST API framework
- **PostgreSQL** — relational DB chosen for ACID transactions, FK integrity, and complex balance queries
- **JWT + bcryptjs** — stateless auth with role-embedded tokens
- **Morgan** — HTTP request logging

## Why PostgreSQL?

- ACID transactions ensure transfers atomically debit/credit two bases
- Foreign keys prevent orphaned records (transfers must reference valid bases)
- JSONB column in audit_logs stores flexible per-action details
- Complex CTE queries compute opening/closing balances efficiently

## Setup

1. Create DB: `createdb military_ams`
2. Run schema: `psql -d military_ams -f schema.sql`
3. Copy `.env.example` to `.env` and fill values
4. `npm install && npm run dev`

## API Endpoints

| Method   | Route                       | Role           | Description          |
| -------- | --------------------------- | -------------- | -------------------- |
| POST     | /api/auth/login             | All            | Get JWT token        |
| GET      | /api/dashboard              | All            | Metrics with filters |
| GET/POST | /api/purchases              | All/Logistics+ | List or create       |
| GET/POST | /api/transfers              | All/Logistics+ | List or create       |
| GET/POST | /api/assignments            | All/Commander+ | List or create       |
| PATCH    | /api/assignments/:id/expend | Commander+     | Mark expended        |
| GET      | /api/audit-logs             | Admin only     | Full audit trail     |

## RBAC Matrix

| Feature         | Admin | Commander     | Logistics |
| --------------- | ----- | ------------- | --------- |
| All bases data  | ✅    | Own base only | ✅ read   |
| Create Purchase | ✅    | ❌            | ✅        |
| Create Transfer | ✅    | ❌            | ✅        |
| Assign/Expend   | ✅    | ✅ own base   | ❌        |
| Audit Logs      | ✅    | ❌            | ❌        |
