# BLACK & WHITE Backend

Separate backend scaffold for the BLACK & WHITE storefront.

## What is included
- Express API with modular routes/controllers/services
- Sequelize + MySQL configuration and starter models
- JWT auth scaffolding
- Google sign-in token verification with Google Identity Services backend flow
- Local temp upload via Multer, then Cloudinary upload, then local file cleanup
- Payment provider abstraction with COD enabled and Stripe adapter stubbed
- Starter SQL schema file

## Important note about payments
Stripe can present PKR, but Stripe accounts are not currently listed as supported in Pakistan on Stripe's global availability page. Because of that, this scaffold enables `COD` by default and keeps payment logic behind a provider interface so you can swap in a Pakistan-supported gateway later without changing order flows.

## Suggested next steps
1. Create the MySQL database using `src/db/sql/schema.sql`.
2. Copy `.env.example` to `.env` and fill in your real keys.
3. Run `npm install`.
4. Start the server with `npm run dev`.
5. Connect the frontend auth/checkout/upload calls to these routes.

## Google OAuth setup
Paste the Google OAuth web client values into:

- Backend `.env`: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Frontend `.env`: `VITE_GOOGLE_CLIENT_ID`

Use the same client ID in both files. Keep the client secret backend-only; do not add it to any `VITE_` frontend variable.

## Main API routes
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/products`
- `POST /api/products`
- `POST /api/uploads/images`
- `POST /api/orders`
- `POST /api/payments/intent`
