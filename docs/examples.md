# Examples of API Requests
## 🔐 1. Authentication (Sign-in)

Each user has an email/password defined in the seed.

USER1 – Sign in
```bash
curl -X POST http://localhost:5001/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com", "password":"User1234!"}'
```

USER2 – Sign in
```bash
curl -X POST http://localhost:5001/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@example.com", "password":"User1234!"}'
```

MODERATOR1 – Sign in
```bash
curl -X POST http://localhost:5001/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"moderator1@example.com", "password":"Mod1234!"}'
```

MODERATOR2 – Sign in
```bash
curl -X POST http://localhost:5001/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"moderator2@example.com", "password":"Mod1234!"}'
```

ADMIN – Sign in
```bash
curl -X POST http://localhost:5001/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com", "password":"Admin1234!"}'
```

Each request returns:

```json
{ "accessToken": "JWT_HERE" }
```

## 👤 2. /auth/me (View authenticated user)
```bash
curl -X GET http://localhost:5001/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

Returns the user associated with the token.

## 🧩 3. Tickets – How ABAC + RBAC + Ownership work
### 3.1 Ticket listing per role
USER1 should only see tickets T1 and T2 (own tickets)
```bash
curl -X GET http://localhost:5001/tickets \
  -H "Authorization: Bearer <USER1_TOKEN>"
```

USER1 → returns only tickets where ownerId = user1.id and omits internalNotes, ownerId, assignedToId.

MODERATOR1 should only see tickets assigned to them (T2)
```bash
curl -X GET http://localhost:5001/tickets \
  -H "Authorization: Bearer <MODERATOR1_TOKEN>"
```

MODERATOR → returns tickets where assignedToId = <mod1_id>. The selection includes ownerId and assignedToId but excludes internalNotes.

ADMIN should see all tickets (T1, T2, T3, T4, T5)
```bash
curl -X GET http://localhost:5001/tickets \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

ADMIN → sees every field, including:

```json
"internalNotes": "FLAG: monitor this account closely. Possible fraud."
```

(Added to ticket T4 in the seed.)

### 3.2 Create ticket (USER only)
```bash
curl -X POST http://localhost:5001/tickets \
  -H "Authorization: Bearer <USER1_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My printer is on fire",
    "description": "Just kidding, but it makes weird noises."
  }'
```

MODERATOR or ADMIN → receive 403 Forbidden (RBAC).

### 3.3 Assign ticket (ADMIN only)
```bash
curl -X PATCH http://localhost:5001/tickets/<TICKET_ID>/assign \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedToId": "<MODERATOR_ID>"
  }'
```

### 3.4 Update ticket status (ADMIN or MODERATOR)
```bash
curl -X PATCH http://localhost:5001/tickets/<TICKET_ID>/status \
  -H "Authorization: Bearer <ADMIN_OR_MOD_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### 3.3 Get ticket by ID – resource-based access (ownership)
USER1 tries to access a USER2 ticket (should fail)
```bash
curl -X GET http://localhost:5001/tickets/<USER2_TICKET_ID> \
  -H "Authorization: Bearer <USER1_TOKEN>"
```

Expected response:

```json
{
  "statusCode": 401,
  "message": "You can only access your own tickets"
}
```

This behavior demonstrates resource-based authorization, not just endpoint access.

MODERATOR1 only accesses tickets assigned to them

Example: Ticket T2

```bash
curl -X GET http://localhost:5001/tickets/<T2_ID> \
  -H "Authorization: Bearer <MODERATOR1_TOKEN>"
```

ADMIN can access any ticket
```bash
curl -X GET http://localhost:5001/tickets/<ANY_TICKET_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

They see:

- internalNotes (admin only)
- ownerId
- assignedToId

## 🛡 4. Routes protected by role (RBAC)
4.1 /admin/health – ADMIN only
```bash
curl -X GET http://localhost:5001/admin/health \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

With another role (USER/MOD):

```json
{ "statusCode": 403, "message": "Forbidden resource" }
```

## 📚 5. Manage users (ADMIN + MODERATOR only)
List users
```bash
curl -X GET http://localhost:5001/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

Get user by ID
```bash
curl -X GET http://localhost:5001/users/<USER_ID> \
  -H "Authorization: Bearer <MODERATOR1_TOKEN>"
```

With USER role → 403 Forbidden.

## 🧪 6. Useful examples for manual testing
Compare ABAC results (per role) in /tickets

Role | Tickets visible | Visible fields
---- | --------------- | --------------
USER | Only own tickets | title, description, status
MODERATOR | Tickets assigned to them | ownerId, assignedToId, no internalNotes
ADMIN | All tickets | All fields, including internalNotes
