# Microservices Application

A comprehensive microservices application built with NestJS backend services and AngularJS frontend, implementing complete authentication and user management system with advanced features.

## Assignment Implementation

This application was built as a second-round assignment demonstrating microservices architecture with the following core requirements:

### Core Functionality Implemented
- **User Registration**: Name, Email, Password, Phone with validation
- **User Login**: JWT-based authentication with rate limiting
- **View Profile**: Display all user details from User Service
- **Edit Profile**: Update name, email, and phone
- **Upload Photo**: Profile picture upload with persistent storage
- **Logout**: Token invalidation via Redis blacklisting
- **Change Password**: Old password verification required
- **Dashboard**: Simple page displaying "Welcome [Name]"

### Tech Stack Used
- **Frontend**: AngularJS 1.x with basic HTML forms and simple styling
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Hosting**: Cloud platforms (Railway)
- **Authentication**: JWT with Redis token blacklisting

## Architecture

### Frontend
- **Framework**: AngularJS 1.x
- **UI**: Basic HTML forms with simple styling
- **Icons**: Font Awesome
- **Location**: `client-angularjs/`

### Backend Services (Microservices Architecture)
- **Authentication Service**: NestJS, Port 3000
  - Register, Login, Logout, Token validation
- **User Service**: NestJS, Port 3001  
  - Profile view, Edit profile, Photo upload, Password change



## Environments & Migrations

### Three Distinct Environments

#### Development Environment (.env.dev)
- **Database**: Local PostgreSQL
- **Setup Command**: `npm run setup:dev`
- **Features**: Local development with screenshots acceptable

#### Test Environment (.env.test)
- **Database**: Neon Cloud PostgreSQL
- **Setup Command**: `npm run setup:test`
- **Features**: 
  - Live cloud database with automatic migrations
  - Preloaded with 3+ dummy users
  - Database seeding included

#### Live Environment (.env.live)
- **Database**: Neon Cloud PostgreSQL
- **Setup Command**: `npm run setup:live`
- **Features**: Production-ready cloud deployment

### Setup Commands Implementation
```bash
npm run setup:test    # Cloud database with dummy users and migrations
npm run setup:live    # Production cloud setup with migrations
```

## Security Requirements Implemented

### Token Validation
- JWT tokens validated on all protected routes
- Redis-based token blacklisting for logout
- Secure token generation and verification

### Rate Limiting
- Maximum 5 login attempts per minute
- IP-based rate limiting
- Exponential backoff for repeated failures

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

## Extra Skills Implemented (3+ Required)

### 1. Redis: Cache Profile Data
- Profile data cached for 2 minutes
- Redis integration for performance
- Cache invalidation on profile updates

### 2. Docker: Containerization
- Dockerfile for each microservice
- docker-compose.yml for full stack
- Multi-service container orchestration

### 3. Kafka: Message Queue
- Login events logged to file via Kafka


### 4. Monitoring: Health Endpoints
- `/health` endpoint for all services
- Service status monitoring


## API Documentation

### Authentication Service (Port 3000)

#### POST /auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "Password123",
  "phone": "1234567890"
}
```

#### POST /auth/login
Authenticate user with rate limiting
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### POST /auth/logout
Invalidate JWT token
```json
{
  "token": "jwt_token_here"
}
```

### User Service (Port 3001)

#### GET /users/profile
Get user profile (protected route)
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "profilePhoto": "photo_url"
}
```

#### PUT /users/profile
Update user profile (protected route)
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "phone": "9876543210"
}
```

#### POST /users/upload-photo
Upload profile photo (protected route)
```json
{
  "photo": "base64_encoded_image"
}
```

#### POST /users/change-password
Change password with old verification (protected route)
```json
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

### Health Endpoints
- GET `/health` - Service health check

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (local for dev, cloud for test/live)
- Redis (for caching and token blacklisting)
- Apache Kafka (for message queuing)
- Docker & Docker Compose (for containerization)

### Quick Start with Docker
```bash
# Clone repository
git clone <repository-url>
cd microservices-app

# Start all services with Docker
docker-compose up -d

# Setup environments
npm run setup:test  # For testing with dummy users
```

### Manual Setup

1. Clone repository
   ```bash
   git clone <repository-url>
   cd microservices-app
   ```

2. Install Backend Service Dependencies
   ```bash
   cd ../auth-service
   npm install
   
   cd ../user-service
   npm install

   cd ../api-gateway
   npm install
   ```

3. Setup Environments
   ```bash
   npm run setup:dev    # For local development
   npm run setup:test    # For cloud testing with dummy users
   npm run setup:live    # For production deployment
   ```

### Running the Application

#### Option 1: Docker Compose (Recommended)
```bash
docker-compose up -d
```

#### Option 2: Manual Setup
1. Start Authentication Service
   ```bash
   cd auth-service
   npm run start:dev
   # Service runs on http://localhost:3000
   ```

2. Start User Service
   ```bash
   cd user-service
   npm run start:dev
   # Service runs on http://localhost:3001
   ```

3. Start API Gateway (Optional)
   ```bash
   cd api-gateway
   npm run start:dev
   # Gateway runs on http://localhost:8080
   ```

4. Start Frontend
   ```bash
   cd client-angularjs
   npx http-server -p 4200
   # Frontend runs on http://localhost:4200
   ```

## Deployment

### Railway Hosting
- **Backend Services**: Auth Service and User Service hosted on Railway
- **Frontend**: AngularJS application hosted on Railway
- **Database**: Neon Cloud PostgreSQL for all environments

### Environment-Specific Deployment
- **Development**: Local setup with local PostgreSQL
- **Test**: Neon database with 3+ preloaded dummy users
- **Live**: Production-ready deployment on Railway with Neon database

### Docker Deployment Commands
```bash
# Development environment
envfile=.env.dev docker-compose up --build

# Test environment
envfile=.env.test docker-compose up --build

# Live environment
envfile=.env.live docker-compose up --build
```

### Database Migrations
- Migrations run automatically with `npm run setup:test` and `npm run setup:live`
- Neon database schema updates handled via TypeORM migrations
- Test data seeding included in test environment setup

## Testing

### Environment Setup
```bash
npm run setup:test  # Includes dummy users for testing
```

### Test Users (Preloaded in Test Environment)
- **User 1**: test1@example.com / Password1!
- **User 2**: test2@example.com / Password1!
- **User 3**: test3@example.com / Password1!



## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
);
```



## Monitoring & Health Checks

### Health Endpoints Available
- `GET /health` - Overall service health



## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check connection strings in .env files
   - Ensure database exists and is accessible

2. **Redis Connection Issues**
   - Verify Redis service is running
   - Check Redis URL configuration
   - Test Redis connectivity

3. **Kafka Connection Issues**
   - Verify Kafka and Zookeeper are running
   - Check broker configuration
   - Test topic creation and message publishing

4. **Rate Limiting Issues**
   - Login attempts limited to 5 per minute
   - Check Redis for rate limit storage
   - Verify IP-based limiting configuration

5. **Token Validation Issues**
   - Check JWT secret configuration
   - Verify token expiration handling
   - Test Redis blacklisting functionality

6. **Docker Issues**
   - Check Docker daemon status
   - Verify docker-compose.yml syntax
   - Check for port conflicts
   - Review container logs


**Assignment Completion**: This microservices application successfully implements all core requirements and demonstrates advanced features including Redis caching, Docker containerization, Kafka messaging, and comprehensive monitoring, meeting the second-round assignment criteria.