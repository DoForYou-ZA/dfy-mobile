# DoForYou Mobile

Native-first Expo / React Native client for the DoForYou South African task marketplace. It is designed for task creators and runners. Administrative workflows are intentionally excluded from the mobile app; admin accounts are stopped at the navigation boundary and must use the approved desktop admin experience.

The backend remains the source of truth for task status, payment verification, escrow, disputes, bank verification, and payouts. The mobile app must not infer a successful payment or payout from a dismissed browser or a queued transfer.

## Mobile experience

- Native DoForYou design tokens and reusable components; the mobile UI does not need to copy the web layout.
- Customer navigation only: home, task discovery, task actions, inbox, and account.
- Admin accounts have no customer routes, admin screens, or admin API wrapper in the mobile client.
- Native access tokens use Expo SecureStore; web development uses AsyncStorage. The token helper migrates existing native tokens from legacy AsyncStorage.
- Notifications and SignalR are disabled for admin accounts.

## Requirements

- Node.js 22
- npm
- Expo Go for development, or an Android emulator/device for native testing

## Setup

```bash
npm ci
cp .env.example .env.local
```

Set `EXPO_PUBLIC_DFY_API_URL` to the backend origin including `/api/v1`. Set `EXPO_PUBLIC_DFY_SIGNALR_URL` to the backend origin, or omit it to derive it from the API URL.

Never put private API keys, Paystack secret keys, or other server credentials in `EXPO_PUBLIC` variables. Expo public variables are embedded in the client bundle.

## Run

```bash
npm run start
npm run android
npm run ios
```

For local backend development, use the Mac's LAN IP address rather than `localhost` when testing from a physical phone.

## Checks and Android artifact

```bash
npm ci
npm run typecheck
npx expo export --platform android
```

GitHub Actions runs TypeScript checks, Android bundle export, and builds a standalone arm64 Android APK using the **staging API URLs**. The uploaded APK is for review and device testing, not a signed production release. Install it and exercise sign-in, task discovery, task creation/payment handoff, runner acceptance/completion, creator confirmation/dispute, notifications, bank account setup, and sign-out before approving a release.

## Payment and task-state rules

- Creating a task may return a Paystack checkout URL; open that URL in the browser.
- Closing/dismissing checkout is not proof that payment succeeded. The backend webhook and independent verification path determine payment state.
- The mobile client must use the task payment URL workflow; the retired `POST /payment/initiate` endpoint must not be used as a fallback.
- After a runner marks a task complete, the creator has 24 hours to confirm completion or raise a dispute.
- A queued payout is not a completed payout. Display “paid” only when the backend reports the provider-confirmed result.
- Runner payouts go directly to a verified bank account; do not reintroduce the retired wallet flow.

## Security boundary

Hiding admin screens is a client-side product boundary, not authorization. The API must continue to enforce admin roles and permissions independently for every protected endpoint.
