# DealKart Backend

Robust enterprise backend built with **Node.js**, **Express**, and **MySQL**, adhering to a layered Clean Architecture pattern with Controllers, Services, Models, and Middlewares.

## Architecture & Modules
- **Process Audit Module**: Request tracking, Audit Observations, CAPA (Corrective and Preventive Actions), Auditor notifications.
- **IHLR (In-House Line Rejection) Module**: Line rejection logs, scrap tracking, root-cause 5-Why analysis, scrap notifications.
- **Try-Out Status Module**: Tool/mold trial runs, pilot batches, customer sample approvals.
- **RBAC & Authentication**: JWT authentication with Role-Based Access Control and password hashing via bcryptjs.

## Directory Structure
```
backend/
|-----> src/
|       |-----> config/          # Database connection pool & environment variables
|       |-----> middleware/      # Auth, RBAC, File Uploads, Validations, Error Handler
|       |-----> controllers/     # Request/Response orchestration per domain
|       |-----> services/        # Business logic & domain workflows
|       |-----> models/          # MySQL database queries & data access layer
|       |-----> routes/          # Express route definitions
|       |-----> validations/     # Request schema validations
|       |-----> utils/           # JWT, Bcrypt, formatting & response helpers
|       |-----> uploads/         # Uploaded files and attachments
|       |-----> server.js        # Express app entrypoint
|-----> database/
|       |-----> schema.sql       # MySQL DDL table schemas
|       |-----> seed.sql         # Seed data & initial roles
|       |-----> migrations/      # Migration scripts
|-----> .env
|-----> package.json
|-----> README.md
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Database**:
   - Create a MySQL database named `dealkart_db` (or name configured in `.env`).
   - Run `database/schema.sql` to set up all tables.
   - Run `database/seed.sql` to populate initial roles, admin user, and sample data.

3. **Run the server**:
   ```bash
   # Development (with nodemon)
   npm run dev

   # Production
   npm start
   ```
