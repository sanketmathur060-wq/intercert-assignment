# Microservices Application

A production-style **microservices-based full stack application** built using **NestJS, AngularJS, PostgreSQL, Redis, Kafka, Docker, JWT Authentication, and Persistent Storage**.

This project demonstrates:

* Authentication & Authorization
* Microservices Architecture
* JWT Security
* Kafka-based communication
* Redis Token Blacklisting
* Dockerized Deployment
* Persistent File Storage
* Environment-based configuration
* Profile Management
* Rate Limiting / Throttling

The UI is intentionally kept simple using **AngularJS + Bootstrap** as required in the assignment.

---

# 1. Features

## Authentication Service

* User Registration
* User Login (JWT Authentication)
* Logout (Token Invalidation)
* Change Password (Old Password Verification)
* JWT Token Generation
* Login Rate Limiting
* Secure Password Hashing

## User Service

* View Profile
* Edit Profile
* Upload Profile Photo
* Persistent Profile Images
* Protected APIs

## Frontend

* Login Page
* Register Page
* Dashboard
* View Profile
* Edit Profile
* Change Password
* Form Validations
* Protected Routes

---

# 2. Tech Stack

## Backend

```text
NestJS
Node.js
PostgreSQL
Redis
Kafka
JWT
Passport
TypeORM
Docker
bcrypt
```

## Frontend

```text
AngularJS
Bootstrap
HTML
CSS
JavaScript
```

---

# 3. Microservices Architecture

The application follows a **microservices architecture** pattern.

## Auth Service

Responsible for:

* Registration
* Login
* Logout
* JWT token generation
* Password change
* Authentication
* Login throttling
* Token invalidation

Port:

```text
3000
```

---

## User Service

Responsible for:

* View profile
* Edit profile
* Upload profile photo
* Serve uploaded images

Port:

```text
3001
```

---

## PostgreSQL

Responsible for:

* Authentication data
* User profile data
* Persistent relational storage

Container:

```text
postgres-ms
```

Port:

```text
5433
```

---

## Redis

Responsible for:

```text
JWT token blacklisting
```

Container:

```text
redis-ms
```

Port:

```text
6380
```

---

## Kafka

Responsible for:

```text
Asynchronous communication
between microservices
```

Containers:

```text
zookeeper-ms
kafka-ms
```

Kafka broker:

```text
kafka-ms:9092
```

---

## AngularJS Client

Responsible for:

* Authentication UI
* Dashboard
* Profile Management
* API integration

Frontend URL:

```text
http://localhost:8080
```

---

# 4. High Level Application Flow

## Registration Flow

```text
User Register Form
        ↓
Frontend Validation
        ↓
POST /auth/register
        ↓
NestJS Validation
        ↓
Password Hashing (bcrypt)
        ↓
Save User in PostgreSQL
        ↓
Kafka Event Published
        ↓
Success Response
```

---

## Login Flow

```text
User Login
        ↓
POST /auth/login
        ↓
Credential Validation
        ↓
JWT Token Generated
        ↓
Token returned to frontend
        ↓
Stored in localStorage
        ↓
Dashboard Access
```

---

## View Profile Flow

```text
Frontend sends JWT
        ↓
Authorization Header
        ↓
JWT Verification
        ↓
Profile fetched
        ↓
Response returned
```

---

## Edit Profile Flow

```text
User updates profile
        ↓
PUT /user/profile
        ↓
JWT verification
        ↓
Database update
        ↓
Updated profile shown
```

---

## Change Password Flow

```text
Old Password Entered
        ↓
POST /auth/change-password
        ↓
JWT validation
        ↓
Old password verification
        ↓
bcrypt hash new password
        ↓
DB updated
        ↓
Success response
```

---

## Logout Flow

```text
Logout button clicked
        ↓
POST /auth/logout
        ↓
Token added to Redis blacklist
        ↓
Frontend removes token
        ↓
Redirect to login
```

---

# 5. Security Features

## JWT Authentication

Protected APIs require:

```text
Authorization: Bearer <token>
```

Without valid token:

```text
401 Unauthorized
```

Protected routes:

* Dashboard
* Profile
* Edit Profile
* Change Password

---

## Password Hashing

Passwords are never stored in plain text.

Implementation:

```text
bcrypt
```

Flow:

```text
Raw Password
        ↓
bcrypt hash
        ↓
Saved in DB
```

---

## Redis Token Blacklisting

Redis is used for:

```text
JWT token invalidation
```

Problem:

```text
JWT is stateless.
Logout alone does not invalidate token.
```

Solution:

```text
Redis blacklist implementation
```

Flow:

```text
Logout API called
        ↓
JWT extracted
        ↓
Saved in Redis blacklist
        ↓
Protected APIs verify token
        ↓
If blacklisted
→ Unauthorized
```

Benefits:

* Secure logout
* Prevents old token reuse
* Immediate revocation

---

## Login Rate Limiting

Rate limiting is implemented only for:

```text
POST /auth/login
```

Purpose:

```text
Prevent brute-force attacks
```

Current configuration:

```text
5 login requests per minute
```

Example response:

```json
{
  "statusCode": 429,
  "message": "ThrottlerException"
}
```

---

# 6. Environment Support

The application supports:

```text
.env.dev
.env.test
.env.live
```

Environment selection:

```bash
ENV=<environment>
```

Default if no ENV is passed:

```text
.env.dev
```

The compose file dynamically loads environment-specific files using:

```yaml
env_file:
  - ./auth-service/.env.${ENV:-dev}
```

and

```yaml
env_file:
  - ./user-service/.env.${ENV:-dev}
```

This means:

```bash
ENV=dev docker compose up --build
```

loads:

```text
.env.dev
```

```bash
ENV=test docker compose up --build
```

loads:

```text
.env.test
```

```bash
ENV=live docker compose up --build
```

loads:

```text
.env.live
```

---

## Development Environment

Command:

```bash
npm run setup:dev
ENV=dev docker compose up --build
```

Purpose:

```text
Local development
```

Uses:

* .env.dev
* Development database
* Development JWT secret
* Local Kafka/Redis

---

## Test Environment (Recommended for Reviewer)

Command:

```bash
npm run setup:test
ENV=test docker compose up --build
```

Purpose:

```text
Assignment testing
Reviewer testing
```

Behavior:

* Loads `.env.test`
* Creates test setup
* Seeds dummy users automatically
* Ready for immediate testing

### Seeded Dummy Users

| Name        | Email                                   | Password  | Phone      |
| ----------- | --------------------------------------- | --------- | ---------- |
| Test User 1 | [test1@test.com](mailto:test1@test.com) | Password1 | 9999999991 |
| Test User 2 | [test2@test.com](mailto:test2@test.com) | Password1 | 9999999992 |
| Test User 3 | [test3@test.com](mailto:test3@test.com) | Password1 | 9999999993 |

Password for all users:

```text
Password1
```

Reviewer can directly login without registration.

---

## Live Environment

Command:

```bash
npm run setup:live
ENV=live docker compose up --build
```

Purpose:

```text
Production-style environment
```

Uses:

* .env.live
* Live configuration
* Separate DB config
* Production-style setup

---

## Why env files are committed?

For reviewer convenience, `.env.dev`, `.env.test`, and `.env.live` are intentionally committed.

This allows reviewers to:

* Run immediately
* Avoid manual setup
* Understand configuration quickly
* Test multiple environments

In production:

```text
.env files should never be committed.
Secrets should be managed securely.
```

---

# 7. Database, Migration & Seeding

Database:

```text
PostgreSQL
```

ORM:

```text
TypeORM
```

Current implementation:

```text
synchronize: true
```

Purpose:

```text
Automatic schema generation
for assignment simplicity.
```

Database initialization:

```text
postgres-init/
```

Mounted into:

```text
/docker-entrypoint-initdb.d
```

### Seed User Script

Dummy users are seeded using:

```text
scripts/seed-users.js
```

Implementation:

```text
bcrypt password hashing
```

Flow:

```text
Connect PostgreSQL
        ↓
Hash Password1
        ↓
Check existing users
        ↓
Insert missing users
        ↓
Prevent duplicates
```

---

# 8. Persistent Image Storage

## Problem

If images are stored inside container:

```text
Container restart
→ images lost
```

## Solution

Implemented:

```text
Docker named volume
```

Example:

```yaml
volumes:
  - user_uploads:/app/uploads
```

Benefits:

* Survives restart
* Survives container recreation
* Works on reviewer system
* No local machine dependency
* Persistent storage

Images accessible via:

```text
http://localhost:3001/uploads/<filename>
```

Example:

```text
http://localhost:3001/uploads/1778403589207.jpg
```

---

# 9. Docker Services

Docker Compose starts:

```text
postgres-ms
redis-ms
zookeeper-ms
kafka-ms
auth-service
user-service
```

Internal communication uses Docker networking.

Example:

```text
DB_HOST=postgres-ms
REDIS_HOST=redis-ms
KAFKA_BROKER=kafka-ms:9092
```

instead of localhost.

---

# 10. API Endpoints

## Auth Service

Base URL:

```text
http://localhost:3000
```

### Register

```http
POST /auth/register
```

### Login

```http
POST /auth/login
```

### Logout

```http
POST /auth/logout
```

### Change Password

```http
POST /auth/change-password
```

Payload:

```json
{
  "oldPassword": "Password1",
  "newPassword": "NewPassword1"
}
```

---

## User Service

Base URL:

```text
http://localhost:3001
```

### View Profile

```http
GET /user/profile
```

### Update Profile

```http
PUT /user/profile
```

### Upload Photo

```http
POST /user/upload-photo
```

Multipart form data:

```text
photo=<file>
```

---

# 11. Health Endpoints

Auth Service:

```text
http://localhost:3000/health
```

User Service:

```text
http://localhost:3001/health
```

---

# 12. Setup Instructions

### Development

```bash
npm run setup:dev
ENV=dev docker compose up --build
```

### Test

```bash
npm run setup:test
ENV=test docker compose up --build
```

### Live

```bash
npm run setup:live
ENV=live docker compose up --build
```

### Stop Application

```bash
docker compose down
```

### Full Reset

```bash
ENV=<environment> docker compose down -v
```

---

# 13. Assignment Verification Flow

1. Register User
2. Login
3. Dashboard opens
4. View Profile
5. Edit Profile
6. Upload Profile Photo
7. Change Password
8. Logout
9. Access protected route → redirected to login
10. Restart docker → images persist
11. Logout token becomes invalid
12. Login rate limiting works

---


