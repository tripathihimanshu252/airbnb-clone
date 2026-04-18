# Airbnb Clone

Minimal full-stack Airbnb-like clone (Express + MongoDB backend, React + Vite frontend).

## Quick start (development)

Prerequisites:
- Node.js (v18+ recommended)
- npm
- MongoDB (local or Atlas)
- (Optional) Cloudinary account for image uploads

1) Backend

```powershell
cd "airbnb-clone"
npm install
# Run with nodemon (watches files)
npm run dev
# or run once:
# npm start
```

The backend defaults to `http://localhost:3000` (use `PORT` env to change).

2) Seed the database (optional)

Option A — HTTP route (quick):
- Open: `http://localhost:3000/listings/seed` (this will clear & insert sample listings)

Option B — script:

```powershell
cd "airbnb-clone"
node utils/seedDB.js
```

3) Client (frontend)

```powershell
cd "airbnb-clone\client"
npm install
npm run dev
```

Open the Vite dev server (usually `http://localhost:5173`). The client calls the API at `http://localhost:3000/api` by default (see `client/src/api.js`).

## Environment variables
Create a `.env` file in the `airbnb-clone` folder with the following values as needed:

```
DB_URL=mongodb://127.0.0.1:27017/airbnbClone
PORT=3000
JWT_SECRET=your_jwt_secret_here

# Cloudinary (optional, required for image upload)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Build / Production

Build the client and serve the static files from a static server or wire them into your Express app.

```powershell
cd client
npm run build
```

Then deploy backend and serve built assets from `client/dist` (or `public`), or use a separate static hosting for the client.

## Notes
- API endpoints are under `/api` (see `client/src/api.js`).
- I added a `.gitignore` and removed `node_modules` from the repo.

---

If you'd like, I can also add a GitHub Actions workflow to run build checks on push or add deployment instructions.
