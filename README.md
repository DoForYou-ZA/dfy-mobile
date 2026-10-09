# DoForYou Mobile

Expo / React Native client for the DoForYou South African task marketplace. The backend remains authoritative for task status, payment verification, escrow, disputes, bank verification, and payouts.

## Requirements

- Node.js 22
- npm
- Expo Go for quick development, or an Android emulator/device for native testing

## Setup

```bash
npm ci
cp .env.example .env.local
```

Edit .env.local and replace the example API host with the exact backend service URL for the environment being tested. EXPO_PUBLIC_DFY_API_URL must include /api/v1. EXPO_PUBLIC_DFY_SIGNALR_URL is optional; if omitted, the app derives the SignalR origin from the API URL.

Never put private API keys, Paystack secret keys, or other server credentials in EXPO_PUBLIC variables. Expo public variables are embedded in the client bundle.

## Run

```bash
npm run start
npm run android
npm run ios
```

For local backend development, use the Mac's LAN IP address in EXPO_PUBLIC_DFY_API_URL; a physical phone cannot reach the Mac through localhost.

## Checks

```bash
npm ci
npm run typecheck
npx expo export --platform android
```

GitHub Actions runs the TypeScript check and Android JavaScript bundle export. The bundle export is not a signed APK or a substitute for installing the app on a device.

## Mobile design and roles

The mobile client has its own native-first visual system: warm, light surfaces; DFY orange for primary actions; and mint/blue accents for secondary actions. It is not intended to reproduce the web dashboard layout on a phone.

The mobile workspace is for task creators and runners. Administrator accounts are shown an access notice and cannot enter the mobile task workspace. Admin workflows stay on the web application; the API remains responsible for enforcing authorization independently of the client UI.

## Payment and task-state rules

- Creating a task may return a Paystack checkout URL; open that URL in the browser.
- Closing/dismissing the checkout browser is not proof that payment succeeded. The backend webhook and verification path determine payment state.
- After a runner marks a task complete, the creator has 24 hours to confirm completion or raise a dispute.
- A queued payout is not a completed payout. Display “paid” only when the backend reports the provider-confirmed result.
- Runner payouts go directly to a verified bank account; the retired wallet flow must not be reintroduced.
