# DoForYou Mobile

Expo / React Native client for the DoForYou South African task marketplace. The backend remains authoritative for task status, payment verification, escrow, disputes, bank verification, and payouts.

## Mobile app scope and design

DFY Mobile is the customer app for task creators and runners. It provides a role-aware home screen, task discovery and posting, task progress, notifications, chat, profile and bank-account setup. The interface uses a lighter warm-neutral canvas with DoForYou orange accents and mobile-first actions rather than copying the web dashboard layout.

**Admin access is web-only.** Accounts identified as administrators are blocked from signing in to DFY Mobile, stale admin sessions are cleared, and the app contains no admin dashboard or moderation routes. Use the DFY web admin console for administration, moderation and platform operations.

The mobile UI does not own task, payment, escrow, dispute, bank-verification or payout rules. Those remain authoritative in DFY-BE, including the creator's 24-hour completion-confirmation window and provider-confirmed payout state.

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

## Payment and task-state rules

- Creating a task may return a Paystack checkout URL; open that URL in the browser.
- Closing/dismissing the checkout browser is not proof that payment succeeded. The backend webhook and verification path determine payment state.
- After a runner marks a task complete, the creator has 24 hours to confirm completion or raise a dispute.
- A queued payout is not a completed payout. Display “paid” only when the backend reports the provider-confirmed result.
- Runner payouts go directly to a verified bank account; the retired wallet flow must not be reintroduced.
