# Better Date — iOS (Expo)

Uses **Expo SDK 54** so it works with the App Store version of Expo Go.

## Setup

```bash
# from repo root
npm install
cp apps/mobile/.env.example apps/mobile/.env
```

Set `EXPO_PUBLIC_API_URL` to your Vercel URL (or `http://localhost:3000` for simulator).

## Run

```bash
# terminal 1 — API (if local)
npm run dev

# terminal 2 — from apps/mobile
npm start
# or from repo root:
npm run dev:mobile
```

Scan the QR code with **Expo Go** on your iPhone, or press `i` for the iOS Simulator.

**Physical device:** use your Vercel URL in `.env` (not `localhost`). For LAN testing: `http://YOUR_LAN_IP:3000`.

If Expo Go still complains about SDK version, force-quit Expo Go and clear Metro cache:

```bash
cd apps/mobile && npx expo start -c
```
