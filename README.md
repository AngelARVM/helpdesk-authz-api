# 🔐 Auth + Authorization ABAC-lite – NestJS Challenge

This project implements an RBAC + ABAC-lite authentication and authorization system using **NestJS**, **JWT**, **PostgreSQL**, and **Docker**.

The main goals are to demonstrate:

- JWT authentication.
- Endpoint authorization (RBAC).
- Resource authorization (per-user ownership).
- Attribute-based authorization (ABAC-lite) that filters fields per role.
- Reproducible seeds to test every flow.
- Auto-generated documentation via **Swagger**.
- A setup that is ready for unit tests using mocked repositories.

---

# 📘 Table of Contents

- [🔐 Auth + Authorization ABAC-lite – NestJS Challenge](#-auth--authorization-abac-lite--nestjs-challenge)
- [📘 Table of Contents](#-table-of-contents)
- [✅ Key Highlights](#-key-highlights)
- [🧱 High-Level Architecture](#-high-level-architecture)
    - [1. RBAC (Role-Based Access Control)](#1-rbac-role-based-access-control)
    - [2. Ownership (Resource-Based Authorization)](#2-ownership-resource-based-authorization)
    - [3. ABAC-lite (Attribute-Based Access Control)](#3-abac-lite-attribute-based-access-control)
    - [Core Modules](#core-modules)
- [🛠️ Technology Stack](#️-technology-stack)
    - [Core](#core)
    - [Authentication \& Authorization](#authentication--authorization)
    - [Database](#database)
    - [Infrastructure](#infrastructure)
    - [Misc](#misc)
- [🎯 Features](#-features)
    - [🟢 Authentication](#-authentication)
    - [🟢 Endpoint Authorization (RBAC)](#-endpoint-authorization-rbac)
    - [🟢 Resource Authorization (Ownership)](#-resource-authorization-ownership)
    - [🟢 Attribute Authorization (ABAC-lite)](#-attribute-authorization-abac-lite)
    - [🟢 Infrastructure](#-infrastructure)
    - [🟢 Documentation](#-documentation)
- [🧪 Testing](#-testing)

---

# ✅ Key Highlights

- ✔ **OpenAPI documentation** via Swagger at [`http://localhost:5001/api`](http://localhost:5001/api)
- ✔ **JWT Authentication**
- ✔ **Role-based authorization (RBAC)** using the `@Authed()` decorator
- ✔ **Resource ownership authorization**
- ✔ **ABAC-lite**: returned fields depend on the role (e.g., `internalNotes` is ADMIN-only)
- ✔ **Reproducible seeds** (2 USERS, 2 MODS, 1 ADMIN, 5 tickets)
- ✔ **Automatic Swagger documentation**
- ✔ **Docker Compose** (API + PostgreSQL)
- ✔ **Clean, modular, easily extensible codebase**

---

# 🧱 High-Level Architecture

The system follows NestJS best practices with self-contained modules.  
Each module encapsulates its controllers, services, repositories, DTOs, and entities.

Conceptually, the backend enforces three authorization layers:

### 1. RBAC (Role-Based Access Control)
Determines which roles can access each **endpoint** using the custom `@Authed()` decorator  
and the `RolesGuard`.

- ADMIN → full access to admin routes and user management.
- MODERATOR → can read users and see assigned tickets.
- USER → can create tickets and read only their own.

### 2. Ownership (Resource-Based Authorization)
Determines whether the user can access an **individual resource**. Examples:

- A USER only sees tickets where `ownerId = userId`.
- A MODERATOR only sees tickets where `assignedToId = userId`.

This applies to `/tickets/:id` and `/tickets` listings with role-specific filters.

### 3. ABAC-lite (Attribute-Based Access Control)
Depending on the user **role** (JWT attribute), ticket responses include different fields:

| Role | Visible fields |
|------|----------------|
| USER | `title`, `description`, `status` |
| MODERATOR | + `ownerId`, `assignedToId` |
| ADMIN | + `internalNotes` (sensitive field) |

This showcases dynamic authorization and contextual filtering without excessive complexity.

### Core Modules

Auth Module  
├── JWT Authentication  
└── Sign-in / Sign-up / Me

User Module  
├── List users (ADMIN/MOD)  
└── Get user by ID

Ticket Module  
├── Create ticket (USER)  
├── List tickets (RBAC + ABAC + Ownership)  
└── Get ticket by ID (Ownership + ABAC)

Admin Module  
└── /admin/health (ADMIN only)

The architecture is built for extensibility with clear separation of concerns and production-friendly practices (DTOs, entities, guards, pipelines, Swagger docs).

# 🛠️ Technology Stack

Standard tooling for production-grade NestJS projects:

### Core
- **NestJS** (modularity, decorators, guards, pipes)
- **TypeScript**

### Authentication & Authorization
- **JWT** (Passport JWT Strategy)
- **Custom RBAC** via decorators
- **Custom guards** (`AuthGuard`, `RolesGuard`)
- **ABAC-lite** logic inside `TicketService`

### Database
- **PostgreSQL**
- **TypeORM**
- **QueryRunner** for transactional seeds
- Per-module custom repositories

### Infrastructure
- **Docker + Docker Compose**
- `.env` environment variables

### Misc
- **Swagger / OpenAPI** for auto-documentation
- **class-validator** and **class-transformer** for DTO validation

# 🎯 Features

This project focuses on an MVP-style implementation of the following capabilities:

### 🟢 Authentication
- Fully functional JWT with `sign-in`, `sign-up`, `me`.
- User attributes embedded in the token: `userId`, `email`, `role`, `sub`.

### 🟢 Endpoint Authorization (RBAC)
- `/admin/*` → ADMIN only.
- `/users` and `/users/:id` → ADMIN + MODERATOR.
- `/tickets` → USER + MODERATOR + ADMIN.
- `POST /tickets` → USER only.

### 🟢 Resource Authorization (Ownership)
- A USER cannot access someone else’s tickets.
- A MODERATOR can only view tickets assigned to them.
- ADMIN can view everything.

### 🟢 Attribute Authorization (ABAC-lite)
The `Ticket` resource changes depending on the role:
- USER → minimal information
- MODERATOR → intermediate information
- ADMIN → full information (including sensitive fields)

### 🟢 Infrastructure
- Fully dockerized.
- `make first-run` grants permissions, copies `.env`, builds, and starts the stack.
- `make up` runs the project at `http://localhost:5001`.
- Reproducible seeds (`make seed`) create a consistent test environment.

### 🟢 Documentation
- Swagger available at `http://localhost:5001/api`.
- Real-world examples in [`docs/examples.md`](./docs/examples.md).

# 🧪 Testing

All specs run with Jest. Unit tests mock TypeORM repositories, while e2e tests spin up the real Nest application (requires the Postgres service running—`docker compose up postgres` is enough).

```bash
# run unit tests
npm test

# watch mode for unit tests
npm run test:watch

# e2e suite 
npm run test:e2e

# coverage
npm run test:cov
```
