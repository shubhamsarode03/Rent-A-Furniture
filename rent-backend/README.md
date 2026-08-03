# Rent-A-Furniture

A monolithic Java Spring Boot REST API for a furniture rental platform, with role-based access control, JWT authentication, and Razorpay payment integration.

## Features

- **RBAC with JWT** — ADMIN, LENDER, and RENTER roles
- **7 Modules** — Auth, Users, Categories, Furniture, Cart, Orders, Payments
- **Razorpay Integration** — Create and verify payment orders
- **MySQL + Spring Data JPA** — Relational data with Hibernate migrations
- **Bean Validation** — All request DTOs validated
- **Global Exception Handling** — Consistent JSON error responses
- **Docker** — Multi-stage Dockerfile + docker-compose

## Quick Start (Local)

### Prerequisites
- Java 17
- Maven 3.9+
- MySQL 8.0

### Steps

1. **Clone and configure**
   ```bash
   cp .env .env
   # Edit .env and fill in your DB credentials, JWT secret, and Razorpay keys
   ```

2. **Create the database**
   ```sql
   CREATE DATABASE rent_a_furniture;
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

4. The API is available at `http://localhost:8080`

## Quick Start (Docker Compose)

```bash
cp .env .env
# Edit .env with your secrets (especially Razorpay keys)
docker-compose up --build
```

This spins up the MySQL container and the Spring Boot app together. The app waits for MySQL to be healthy before starting.

## Default Seed Data

On first startup, `DataInitializer` creates:
- **Admin user** — email: `admin@rentafurniture.com`, password: `Admin@123`
- **Categories** — Living Room, Bedroom, Dining, Office, Outdoor

## API Overview

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/categories` | Public | List all categories |
| POST | `/api/categories` | ADMIN | Create a category |
| GET | `/api/furniture` | Public | Browse furniture (with filters) |
| POST | `/api/furniture` | LENDER | List a furniture item |
| GET | `/api/cart` | RENTER | View cart |
| POST | `/api/cart` | RENTER | Add item to cart |
| POST | `/api/orders` | RENTER | Place order from cart |
| GET | `/api/orders` | RENTER/ADMIN | List orders |
| POST | `/api/payments/create` | RENTER | Create Razorpay payment order |
| POST | `/api/payments/verify` | RENTER | Verify payment signature |

All protected endpoints require `Authorization: Bearer <token>` header.

## Environment Variables

See `.env.example` for all required variables and descriptions.
