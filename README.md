# Rent-A-Furniture Frontend

A React + Vite + Tailwind CSS single-page app for a furniture rental marketplace. It talks to a Spring Boot REST backend over JWT-secured HTTP.

## Roles

- **RENTER** — browse, cart, checkout, pay, view orders.
- **LENDER** — everything a RENTER does, plus manage own furniture listings.
- **ADMIN** — dashboard, category CRUD, furniture verification, all orders.

## Setup

1. Copy the env template and fill in your values:
   ```
   cp .env.example .env
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Make sure the backend is running at the URL in `VITE_API_BASE_URL` (default `http://localhost:8080/api`).

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL of the backend REST API (including `/api`). |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key id used by the checkout SDK. |

## Tech

- React 18 (JavaScript + JSX, no TypeScript)
- Vite
- Tailwind CSS
- React Router v6
- Axios (single instance with JWT interceptor + 401 redirect)
- Plain hand-written form validation (no Formik/Yup/Zod)
- react-hot-toast + lucide-react

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run preview` — preview the build
- `npm run lint` — run ESLint
