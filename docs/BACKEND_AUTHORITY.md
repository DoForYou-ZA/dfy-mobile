# Backend-authoritative business logic

dfy-mobile is a client of DFY-BE, not a second implementation of marketplace rules.

## Required boundary

- The backend decides permissions, allowed task transitions, validation, payment state, escrow, disputes, the 24-hour confirmation deadline, and payout eligibility.
- Display monetary amounts returned by the API. Do not derive a runner's authoritative earnings by subtracting a hard-coded commission in the app.
- Display canonical task/payment/payout states returned by the API. Local UI state may support optimistic interaction, but must reconcile with the server response.
- Client-side validation is for immediate feedback only; the API must validate every mutation.
- A queued payout is not a completed payout. Show paid only when the backend reports provider-confirmed success.
- Never embed Paystack secrets or other server credentials in the mobile bundle or EXPO_PUBLIC variables.

## Change workflow

For a business-rule change, update DFY-BE and its tests first. If the API contract changes, update the canonical contract/client types and test both dfy-mobile and DFY-FE against the compatible backend. Deploy backend changes before clients that require new fields/endpoints. Preserve backward compatibility for existing APK versions; installed APKs do not receive frontend code changes automatically.

See [the backend contract boundary](https://github.com/DoForYou-ZA/DFY-BE/blob/main/docs/CLIENT_BUSINESS_LOGIC_BOUNDARY.md) for the cross-repository policy.
