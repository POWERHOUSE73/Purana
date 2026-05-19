# Purana - Nepal Online Thrift Store

Purana is a full-stack thrift clothing marketplace for buyers and sellers in Nepal.

## What It Does
- Buyers can browse clothes, filter by Men, Women, Kids, type, size, color, brand and price.
- Buyers can add items to a cart, choose delivery details and pay with eSewa, Khalti, cash on delivery or bank transfer.
- Sellers can publish clothes, upload a photo or image URL, view past listings and update order status.
- Login includes signup and a simple demo forgot-password reset flow.
- The backend works with MongoDB when configured, or demo in-memory data when no database is available.

## Demo Accounts
| Role | Email | Password |
| --- | --- | --- |
| Buyer | buyer@purana.com | password123 |
| Seller | seller@purana.com | password123 |

## Run The App
Copy `server/.env.example` to `server/.env` and set MongoDB:

```bash
MONGO_URI=mongodb://localhost:27017/purana
JWT_SECRET=change-this-secret
CLIENT_ORIGIN=http://localhost:5173
SEED_DEMO_DATA=true
REFRESH_DEMO_DATA=true
```

Keep the local MongoDB service running before starting the backend. When MongoDB is available, the server seeds 27 demo clothes, demo users and one demo order automatically. `REFRESH_DEMO_DATA=true` resets demo products to available and resets demo account passwords when the server starts.

Install dependencies if `node_modules` is missing:

```bash
npm run install:all
```

Start the backend:

```bash
npm run dev:server
```

Start the frontend:

```bash
npm run dev:client
```

Then open `http://localhost:5173`.

## Production Build
Build the React app:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The Express server serves `client/dist` when it exists, so a deployment can run the whole app from one web service.

## Render Deployment
This repo includes `render.yaml`.

Use these settings if deploying manually:

- Build command: `npm run install:all && npm run build`
- Start command: `npm start`
- Required environment variables:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `CLIENT_ORIGIN` with your deployed site URL, or `*` for a simple demo
  - `SEED_DEMO_DATA=true`
  - `REFRESH_DEMO_DATA=false` for production demo deployments

## Main Files
- `client/src/App.jsx` - React screens, cart, auth, dashboards and filters.
- `client/src/api.js` - frontend calls to the backend API.
- `client/vite.config.js` - local `/api` and `/uploads` proxy to the backend.
- `client/src/styles.css` - app styling.
- `server/src/server.js` - Express app setup.
- `server/src/routes/auth.js` - login, signup and forgot password.
- `server/src/routes/products.js` - product listing, filtering and uploads.
- `server/src/routes/orders.js` - checkout, payment validation and order status.
- `server/src/store/memoryStore.js` - demo users, products and orders.
