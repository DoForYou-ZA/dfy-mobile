# Authentication and Marketplace End-to-End Test Plan

## Purpose

Define the expected account, creator, runner, and combined ("Both") flows across the website, mobile app, and backend. The backend is authoritative for authentication, task state, eligibility, payment, and payout decisions. Client-side checks improve usability but are never authorization controls.

## Implementation and test order

Complete these phases in order. Do not treat a later phase as release-ready while an earlier phase has unresolved policy or backend enforcement. Each phase needs both implementation evidence and passing tests.

### P0 — Decide product and compliance policy first

Record decisions before coding gates or writing final expected-result assertions:

- Which minimum fields are required to create an account, post a task, accept work, complete work, and withdraw funds.
- Whether signup collects a phone number. Phone collection is not phone verification; decide separately whether SMS verification is in scope.
- Which KYC/identity provider is used, which outcomes qualify, how retries and manual review work, what data is retained, and when reverification is required. Confirm applicable South African legal, POPIA, FICA, and payment-provider obligations with qualified advisers; this document is not legal advice.
- Whether runner KYC is required before accepting any task or only before accepting paid work, and whether payout-account setup is required before acceptance, completion, or withdrawal.
- Creator/runner cancellation, no-show, late completion, dispute, refund, fee, and payout rules, including deadlines and exceptions.
- What happens to active tasks, funds, and personal data when an account is suspended, preference changes, or deletion is requested.
- Identity and payout check behavior when a provider is unavailable, returns an ambiguous result, or changes a previously approved status.
- Consent versioning and the published legal text represented by each version.
- Whether Google sign-in, authenticator/TOTP, browser HttpOnly-cookie sessions, user-to-user reports/blocks, and self-service account deletion are required for this staging launch. If deferred, record the residual risk and ensure clients do not imply the feature exists.
- Which provider owns each payment/payout flow in staging (the inspected BE contains Paystack payment/payout paths and Ozow payout code); define supported currencies, rounding, fees, provider sandbox/live mode, and expected callback behavior.
- Whether support/admin staff may change identity, task, dispute, payment, or payout states; define permission boundaries, required reason/audit log, and approval separation for financial overrides.

**Exit criteria:** policy owners approve and record each decision; no implementation depends on an unstated interpretation.

### P1 — Secure account and deployment foundation

1. Normalize email consistently and enforce uniqueness in the database. Audit and resolve existing duplicates before adding a unique constraint; handle concurrent registration safely with a generic conflict response.
2. Implement signup, consent recording, email verification, resend throttling, login, password reset/change, token expiry and single-use, session revocation, and account archival behavior.
3. Configure SMTP, public verification/reset URLs, database migrations, forwarded headers, trusted proxy configuration, and rate limiting for the actual staging topology.
4. Keep sensitive data out of standard profile responses, logs, URLs after token extraction, and client storage. Define access, encryption, retention, and deletion controls for identity data before claiming it is protected at rest.
5. Test email delivery, neutral responses, throttling, invalid/expired tokens, account enumeration resistance, and session revocation.
6. Exercise email case/whitespace normalization, malformed and oversized inputs, password character/UTF-8 byte boundaries (including multibyte characters), expiry boundaries, and leap-day/age-boundary ID dates. Verify server and clients agree on validation but the server remains decisive.
7. Decide whether localStorage access-token exposure is accepted for staging or whether session transport must change; document XSS/CSRF implications and test the selected approach. Confirm secrets, verification tokens, reset tokens, IDs, bank account numbers, and provider credentials are not logged or retained in ordinary client storage.

**Exit criteria:** staging account creation through verified login and recovery works end to end; database uniqueness and proxy-aware throttling are proven.

### P2 — Independent role preference, capabilities, and KYC gates

1. Store Creator, Runner, or Both as a preference, but calculate effective capabilities independently on the backend.
2. Remove shared profile-completeness checks that accidentally make runner ID or payout setup a prerequisite for creators to post.
3. Allow a verified Creator or Both account to post after the approved minimum creator requirements are met.
4. Allow a verified Runner or Both account to browse, but enforce the approved identity gate before accepting paid work.
5. Model identity verification explicitly (for example: not started, pending, passed, failed, expired, manual review) and define safe handling for retries, appeals, provider outages, and reverification.
6. Enforce payout eligibility independently at the action where policy requires it. A passed identity check or an accepted task does not automatically authorize withdrawal.
7. Ensure preference changes never bypass checks, erase active obligations, or grant capabilities by themselves.
8. Verify capability changes take effect on existing sessions and cached profile state without requiring a stale JWT claim to be trusted. Exercise multiple BE instances if staging can scale out.

**Exit criteria:** capability matrix and direct-API negative tests pass for Creator, Runner, and Both, including Both with creator access available while runner KYC is incomplete.

### P3 — Task lifecycle and concurrency

Implement and test all supported transitions, such as draft, publish, edit, matching, accept, in progress, completion, confirmation, dispute, cancellation, expiry, and reopening. The exact states and transitions must follow approved product policy.

1. Define who can initiate each transition, preconditions, deadlines, and terminal states.
2. Reject self-acceptance, unavailable or ineligible tasks, and invalid state transitions on the backend.
3. Resolve concurrent acceptance atomically so at most one runner wins.
4. Make retries and double-submits safe; use idempotency or an equivalent design for operations that create tasks, assignments, charges, or refunds.
5. Ensure a denied or timed-out request cannot leave partial assignments, task state, or payment side effects.
6. Preserve required completion, dispute, and support flows for active work after preference changes or account restrictions.
7. Validate task input boundaries: minimum budget (currently R50 in BE), decimal rounding/currency, date in past/time-zone boundaries, required category/location/description, maximum field lengths, and repeated submissions. Do not let UI formatting change the authoritative amount.

**Exit criteria:** state-transition tests cover normal paths, invalid paths, retries, and concurrent requests; persisted state agrees with both clients.

### P4 — Payment, escrow, refund, and payout lifecycle

Cover the full payment path, not only successful checkout:

1. Checkout created, opened, abandoned, pending, failed, succeeded, duplicated, or timed out.
2. Provider callback/webhook validation, replay, delayed delivery, duplicate events, and reconciliation.
3. Escrow/hold creation and release conditions, including completion confirmation, deadline expiry, and disputes.
4. Full/partial refunds, cancellation fees if approved, chargebacks, failed reversals, and payment-provider outages.
5. Runner payout queued, processing, paid, failed, returned, or manually reviewed.
6. Withdrawal eligibility, payout-account ownership/verification, and changes to payout details.
7. User-visible balances and statuses must reflect authoritative provider/backend state. “Queued” or “processing” must never be shown as “paid.”

**Exit criteria:** each financial transition is auditable and reconciled; duplicate or replayed callbacks cannot double-charge, double-refund, or double-pay.

### P5 — Exceptions, trust and safety, and account lifecycle

1. Define cancellation and no-show paths separately for creator and runner, including deadlines, fees/refunds if applicable, rebooking, and effects on active work.
2. Cover reports, blocking, fraud/harassment reports, evidence collection, moderation, suspension, reinstatement, and appeals.
3. Specify access to active tasks, messages, disputes, and funds during suspension or investigation.
4. Handle email/phone changes, lost email access, multiple devices, session expiry, lockout, account recovery, and support-assisted recovery.
5. Define account closure/deletion, retention exceptions, active-task resolution, unpaid balances, and deletion of identity data.
6. Handle identity/payout provider outages, notification delivery failure, delayed/duplicate email or push, offline clients, and support escalation for stuck states.
7. Add operational monitoring and audit trails for verification, payment, dispute, and payout states without logging secrets or unnecessary personal data.

**Exit criteria:** every exception has a safe user outcome, an operator/support path, and tests for resulting task, account, and financial state.

### P6 — Cross-client staging qualification and release

1. Run the agreed E2E scenarios through both website and mobile against the same staging backend and migrated database.
2. Repeat key authorization tests directly against the API; a hidden/disabled client button is not sufficient.
3. Test deep links, app installation/absence, expired links, app backgrounding, navigation, network loss, retry, and token removal from the URL.
4. Confirm cross-client refresh/re-login reflects role preference, verification, KYC, payout, and task-state changes.
5. Capture request result, user-visible state, persisted database/task/payment state, and cross-client result for each case.
6. Resolve all P0 policy decisions and release blockers; document any accepted residual risk explicitly.

**Exit criteria:** all release acceptance criteria below pass on the deployed staging configuration. CI alone is not evidence that SMTP, migrations, payment providers, KYC, or full E2E behavior is configured.

## Repository audit and current staging baseline

**Audit snapshot: 2026-10-16.** The BE, FE, and mobile auth PRs (#69, #81, and #24) target `staging`, are still open drafts, and their displayed checks passed at the time of inspection. They are not proof of a completed staging rollout. The local BE and FE checkouts were clean on `staging`; the mobile checkout was on `feat/mobile-feature-parity-audit-fixes` with this plan untracked. Recheck PR heads, checks, deployment SHAs, and migration state before execution.

| Area | Present in inspected code | Staging gap or required verification |
|---|---|---|
| Signup and email auth | Auth PRs add consent recording, email verification, resend, password reset/change, session-stamp revocation, and auth throttling. Both client signup forms currently require phone and SA ID; BE registration also requires ID-derived adult DOB. | Change signup contract and both clients if approved policy is no ID at signup. SMTP/public URL must be configured and live email delivery tested. Database email uniqueness remains application-only; no normalized unique index. |
| Preference and capability | `UserType` stores Creator/Runner/Both; profile/preferences APIs can change it. Profile response returns `canCreateTasks` and `canAcceptTasks`. | BE `CanCreateTasks` still depends on shared profile completeness, which requires a valid SA ID and matching DOB. Runner acceptance also uses shared completeness and explicitly requires an active verified payout bank account. Implement separate, action-specific requirements. |
| Identity and KYC | SA ID format/checksum/adult-age validation exists. Bank account verification creates/checks a Paystack payout recipient. There is a legacy `IsVerified` user flag/admin control. | No dedicated identity/KYC provider integration or explicit KYC state machine was found. SA ID validation, legacy user verification, and bank-recipient verification are not interchangeable with identity verification. |
| Task posting and payment | Task creation produces `PendingPayment`; the Paystack checkout URL initiates payment. Signed provider webhook processing activates a successfully paid/escrowed task as `Posted`/`EscrowHeld`; browse returns those secured tasks. Payment return/cancel URLs are navigation, not payment proof. | Test abandoned/retried/late/duplicate payment events, provider outages, amount/reference mismatches, refunds, and state reconciliation. Confirm which payment and payout providers are active in staging; the backend also contains Ozow payout code alongside Paystack flows. |
| Acceptance and completion | Claim checks capability, profile, runner terms, self-claim, task state, secured payment, and verified payout bank. Relational DB claim uses conditional update. Runner completion enters `AwaitingConfirmation`; creator has 24 hours to confirm or dispute; background service releases escrow after timeout. | Add independent KYC gate; test concurrent claims and retries; validate the background worker is running in the deployed topology and safely handles restart/multiple instances. |
| Cancellation, disputes, refunds | Cancel endpoint only permits `PendingPayment`; paid tasks are directed to dispute/admin review. Dispute creation freezes eligible held escrow; admin can resolve to runner release or creator refund. Refund outcomes depend on provider events. | No general post-payment/accepted-task cancellation path, user appeal, dispute evidence upload, or participant dispute conversation was found. Decide and implement these outcomes before claiming the full lifecycle is covered. |
| Payout and bank details | Bank account creation/verification/default/removal flows exist. Verified default bank is used for direct runner payout. Wallet endpoints are retired; Paystack payout processing tracks asynchronous results and status. | Bank verification proves payout-recipient configuration, not runner identity. Verify staging provider credentials, callback/webhook signature and replay safety, retries, returned payouts, reconciliation, and bank changes during in-flight payouts. |
| Messages, notifications, support, reputation | Task chat/messages, progress, notifications, support tickets, admin ticket handling, and task ratings exist across backend/client surfaces. Ratings are restricted to participants after completion/payment in backend logic. | Include access control, duplicate/racing ratings, notification failure, support escalation, chat closure/retention, and rating/report moderation cases in cross-client tests. Confirm support can resolve a stuck payment/KYC/dispute operationally. |
| Safety and account lifecycle | Admin dispute resolution and user archive/restore controls exist. | No general user-to-user report/block flow or self-service account deletion/email-change flow was found in the inspected user APIs. Decide whether these are staging scope; if included, define their active-task/funds and data-retention behavior. |
| Sensitive data and throttling | Profile API minimizes ID exposure in auth PR; authentication is rate-limited per process using the connection remote IP. | Existing ID values remain plaintext; application-only duplicate checks are race-prone. Forwarded-proxy and multi-instance/distributed rate-limit behavior need verification or implementation. |
| CI and API contract | BE build/tests, FE build/E2E/responsive checks, and mobile typecheck/bundle/Android build report green on their inspected PR heads. | FE E2E exercises configured staging services, not necessarily the PR backend head. Mobile CI builds/types but is not device-level marketplace E2E. Its API freshness job compares with BE `main`, so add/verify a staging-compatible contract check for this rollout. |

### One coordinated staging release means

Treat the scope as one compatible backend + website + mobile release, even though deployment order must be BE/migrations first, then clients. Do not expose a client flow whose backend gate, provider configuration, or migration is missing. Include small parity and operational items—not only the headline auth features:

- Canonical API/OpenAPI contract and generated client types match the staging backend head.
- Creator/Runner/Both signup, preference updates, permissions, onboarding copy, blocked-action reasons, and profile capability display agree on all clients.
- Email consent, optional marketing consent, consent-version history, and a way to withdraw/change optional marketing consent have defined server behavior.
- Signup, verify, resend, login, reset, change password, sign-out/session revocation, deep links, expired links, and email delivery work end to end.
- Phone collection/verification, Google sign-in, and authenticator/TOTP are explicit launch decisions. Do not leave UI affordances or undocumented assumptions for features not implemented.
- KYC provider workflow, payout bank workflow, identity-data protection, appeals/retries, and action-specific capability recalculation are covered if runner verification is part of launch.
- Task posting/payment/acceptance/chat/progress/completion/confirmation/dispute/cancel/refund/rating/notification/support/payout flows are covered, including retries, out-of-order events, concurrent actions, and offline/re-entry cases.
- All migrations, staging environment variables/secrets, payment/KYC provider configuration, callback URLs, CORS/deep-link origins, background workers, health checks, logs, alerts, runbooks, and rollback/recovery plans are validated.
- Seeded staging accounts/tasks, cleanup/reset strategy, test inboxes, provider sandbox credentials, and financial test-data controls are prepared; no real charge or payout is triggered unintentionally.

**Do not merge/announce staging complete based only on green PR checks.** Verify deployed commit SHAs, migration history/schema, provider configuration, background workers, and the full acceptance suite below on the actual staging URLs.

## Product rules under test

- Signup preference is `Creator`, `Runner`, or `Both`. Users may change their preference later in profile settings.
- Signup preference describes intended use; it does not by itself grant permission to perform marketplace actions.
- Email verification is required before using protected marketplace actions.
- Creator eligibility and runner eligibility are independent.
- A verified Creator or Both account can post once it has the minimum task-posting information. Runner identity verification and payout setup are not prerequisites for posting.
- A verified Runner or Both account may browse tasks, but can accept paid work only after all runner identity checks required by product policy pass.
- Payout eligibility is checked independently from task acceptance. A user must not be told a payout is complete until the backend confirms it.
- Changing preference does not bypass eligibility checks. Preference changes must not erase existing task obligations or records.
- A valid-format or checksum-valid ID number is not proof of identity.
- Phone number collection does not imply phone verification. Do not send SMS OTP or treat phone possession as verified unless that feature is separately specified and implemented.

### Capability matrix

| Preference | Email unverified | Email verified; runner checks incomplete | Email verified; runner checks complete |
|---|---|---|---|
| Creator | Cannot post or accept | Can post; cannot accept | Can post; cannot accept unless preference changes |
| Runner | Cannot post or accept | Can browse; cannot accept paid tasks | Can browse and accept eligible tasks; cannot post unless preference changes |
| Both | Cannot post or accept | Can post and browse; cannot accept paid tasks | Can post, browse, and accept eligible tasks |

The table describes baseline capability only. Task-specific validation, task state, account status, and payment rules still apply.

## Preconditions and environment

- Deploy the backend, website, and mobile build from the same intended staging changes.
- Apply all required database migrations and confirm the deployed schema matches the application model.
- Configure staging SMTP and the public website URL used to build verification and reset links. Keep credentials in the hosting provider's secret configuration, never in source or client bundles.
- Confirm the published Terms and Privacy Policy correspond to the consent versions sent by both clients.
- Confirm staging data is suitable for testing and does not contain production personal data.
- Configure forwarded-header handling for the actual staging proxy and verify that rate limiting sees the intended client IP.
- Prepare test accounts for each preference and for each relevant identity, payout, email-verification, and account-status state.

## Signup, verification, login, and recovery

| Scenario | Expected result |
|---|---|
| Register as Creator, Runner, or Both with valid required signup data | Account is created with the selected preference and required consent records. A session is not issued before email verification. |
| Register without an SA ID, where ID is not required for signup policy | Account creation succeeds. No runner capability is implied. |
| Submit missing or invalid required signup fields, invalid consent versions, or missing required consent | Backend rejects the request; no account is partially created. Website and mobile show actionable validation. |
| Register with an email already in use, including case/whitespace variants | Backend returns a generic conflict. Concurrent duplicate registration cannot create two accounts; the database uniqueness constraint is the final guard. |
| Attempt protected API actions before email verification | Backend denies the action even if the client hides or disables its controls. No task, acceptance, or payment state is changed. |
| Verify with a valid link | Verification succeeds once; user can sign in and receives only the intended session/capabilities. |
| Reuse, expire, truncate, or tamper with a verification token | Verification fails safely. No account state changes. User can request a new link when allowed. |
| Resend verification for an existing unverified, unknown, or already-verified email | Public response does not disclose account existence. Throttling is enforced and the UI gives a neutral message. |
| Request password reset for an existing or unknown email | Public response is neutral and does not disclose account existence. A reset email is sent only when appropriate and permitted by throttling. |
| Use a valid password-reset token | Password changes, the token becomes unusable, and prior sessions are revoked. User must sign in again. |
| Reuse, expire, or tamper with a reset token | Reset fails safely; the password and session state remain unchanged. |
| Change password while signed in | New password is stored, prior sessions are revoked, and website/mobile return the user to sign-in with a clear message. |
| Sign in with wrong password, unknown email, archived account, or unverified account | Access is denied without exposing sensitive account details. No session is issued. |
| Use a token after account archival, verification-state change, or session revocation | Backend rejects the token/action; cached client state cannot preserve access. |
| Submit a malformed/oversized request, unusual Unicode password, whitespace/case variant, or request at token/throttle expiry boundary | Validation is bounded and consistent; secrets are not echoed; no unexpected account or session state changes. |
| Update optional marketing consent, decline it, later withdraw it, or re-consent | Required legal consent remains distinct from optional marketing consent; each optional-consent change has an auditable timestamp/version and takes effect as policy specifies. |
| Try unsupported sign-in methods or MFA controls | The client clearly offers only implemented methods; Google/TOTP are not represented as available unless their backend/provider flows are deployed and tested. |

## Creator scenarios

1. A verified Creator posts a valid task without runner ID verification or payout setup. The task is created once and the response reflects its actual backend state.
2. Repeat the same flow as a verified Both account whose runner checks are incomplete. Posting succeeds; runner capability remains unavailable.
3. Submit invalid or missing task-specific information. The backend rejects it without creating a partial task, charge, or payment state.
4. Call the create-task API directly as a Runner-only account. The backend denies it even if client state is manipulated.
5. Edit or cancel a task in each supported lifecycle state. The backend applies only transitions allowed for that state and owner.
6. Attempt edits/cancellation after assignment, completion, cancellation, expiry, or another terminal state. Invalid transitions are rejected and the task remains consistent.
7. Double-submit, retry after timeout, or submit concurrently. The system does not create unintended duplicate tasks or duplicate charges; retries have a defined safe outcome.
8. Confirm creator completion, let the confirmation window expire, and raise a dispute where supported. Verify the backend's allowed transitions and the configured confirmation window; the client must not independently mark work paid or completed.
9. Create at the minimum allowed budget, immediately below it, at decimal/rounding boundaries, with invalid/past dates, invalid category, empty/oversized text, and optional fields omitted. Confirm server validation and no partial task/payment records on failure.
10. Create a task and leave checkout, retry checkout, open multiple checkout sessions, or return from checkout before the provider callback. The task remains not browseable until backend/provider verification secures payment; repeat attempts do not accidentally publish or double-charge.
11. Confirm creator-facing task cards show canonical payment/task status and only reveal participant contact/details at the permitted lifecycle stage.

## Runner scenarios

1. A verified Runner or Both account can browse tasks while runner checks are incomplete but cannot accept paid work.
2. Attempt acceptance with identity status missing, pending, rejected, expired, or otherwise invalid. The backend denies acceptance, reports the appropriate next step, and leaves the task unassigned.
3. Attempt acceptance with payout setup missing, pending, rejected, or unverified wherever policy requires it. The backend applies the defined gate and does not mutate the task on denial.
4. After required runner checks pass, accept an eligible task. Exactly one runner is assigned, and creator and runner views agree with backend state.
5. Attempt to accept the user's own task, an already assigned task, a cancelled/expired/completed task, or a task otherwise unavailable to that runner. The backend rejects the attempt without side effects.
6. Have two runners accept the same task concurrently. Exactly one valid acceptance wins; the other receives a conflict/availability response.
7. Double-submit acceptance from one device or retry after a network timeout. There is at most one assignment and no duplicate downstream payment action.
8. Complete assigned work and exercise the supported completion, creator-confirmation, dispute, and release transitions. Both clients show backend-reported state.
9. Attempt withdrawal separately from accepting/completing work. Withdrawal requires its own payout and applicable payment/compliance checks; queued is not displayed as paid.
10. Try invalid runner terms, missing/oversized helper details, stale profile/KYC/bank status, and repeated accept requests. Denial leaves the task unchanged and explains the required action without exposing sensitive verification data.
11. Confirm runners cannot edit creator-owned task details, force task/payment transitions, view another user's private messages, or use admin/support operations beyond their authorization.

## KYC and payout verification lifecycle

Test each applicable state for both Runner and Both preferences:

- Identity verification not started, submitted, pending, passed, failed, rejected, expired, manual review, and provider unavailable.
- Payout details not provided, submitted, pending, verified, rejected, changed, or provider unavailable.
- Accepting work at each combination of identity and payout state, according to the P0 policy decisions.
- Correcting data and retrying; retry limits and duplicate submissions; clear user feedback without exposing provider secrets or sensitive reasons.
- Appeal or manual review after rejection and the resulting capability while review is pending.
- Reverification after expiry, material identity change, risk event, or provider policy change.
- A previously approved check becoming invalid while the user has active work or funds in flight.
- Ensure a valid/checksum SA ID is never treated as provider-verified identity.
- Verify least-privilege access to identity evidence, retention/deletion behavior, and that full identity documents/numbers do not appear in ordinary logs or client storage.
- Exercise the provider webhook/callback path (if applicable): invalid signature, wrong user/reference, replay, duplicate, out-of-order, delayed result, timeout, and provider outage. A callback must update only the matching verification request and must not directly create permissions outside the defined backend policy.

## Money, cancellation, and dispute lifecycle

Use the approved fee, timing, and refund policy as the expected result for each case:

- Creator begins checkout and abandons/closes it. Task/payment state remains pending or unpaid as specified; client closure is not proof of payment.
- Payment is pending, fails, succeeds, times out, or is confirmed by delayed callback. UI and task publication follow backend/provider confirmation only.
- Provider sends duplicate, replayed, out-of-order, or forged callback events. Invalid events are rejected; valid duplicates are idempotent.
- Creator cancels before acceptance, after acceptance, after work starts, or after completion. Verify allowed transitions, refund/fee outcome, notifications, and task availability.
- Runner cancels or becomes unavailable before starting or after starting. Verify task reassignment, deadlines, refund/fee outcome, and obligation handling.
- Creator or runner no-shows, misses a deadline, or becomes unreachable. Verify timers, notifications, escalation, and any approved financial consequences.
- Runner marks work complete; creator confirms, disputes, or takes no action before the deadline. Verify the configured completion window, dispute path, escrow state, and release/refund result.
- Dispute is opened, evidence is added, a decision is made, or an appeal is filed. Check who can act, deadlines, immutable audit history, and fund handling.
- Refund is full, partial, delayed, failed, or reversed; chargeback occurs; reconciliation detects a mismatch. Verify ledger consistency and operational escalation.
- Payout is queued, processing, provider-confirmed paid, failed, returned, or held for review. Never infer completion from queueing or client navigation.
- User changes or removes payout details while a task or payout is active. Verify revalidation and safe handling of in-flight funds.
- Simulate provider outage and delayed webhooks. User sees a truthful pending state, retries do not duplicate money movement, and operations can reconcile.
- Test callback/reference integrity at amount and currency boundaries, wrong task/user, missing/duplicate reference, late success after cancellation/refund, replayed charge/refund/transfer events, and out-of-order failure then success. Every provider event must be authenticated, correlated to the correct attempt, and idempotent.
- Confirm ledger/dashboard/payment-history totals reconcile with task budgets, commission, payout amount, actual provider settlement, refunds, and fees; test rounding and ZAR formatting at the smallest supported unit.
- Verify old/retired wallet and withdrawal APIs return the documented retired response and cannot initiate a second payout path.

## Trust, safety, and moderation lifecycle

- User reports another user or a task; verify report privacy, evidence access, acknowledgement, and support/moderation queue creation.
- User blocks another user. Prevent future contact or matching as policy defines without corrupting active-task, dispute, or payment records.
- Moderation reviews a report and takes no action, warns, limits, suspends, or reinstates an account. Verify audit trail, user messaging, appeal path, and effective backend permissions.
- Account is suspended while it has active tasks, a dispute, escrow, or queued payout. Prevent prohibited new actions while preserving safe resolution of existing obligations and funds.
- User appeals an enforcement decision. Verify submission, status visibility, reviewer permissions, and no self-approval.
- Urgent safety incident or suspected fraud triggers escalation. Confirm response ownership, evidence retention, and privacy controls.
- If reports/blocking are not implemented for staging, ensure there is an explicit support route and documented handling; users must not see inert controls. If they are implemented, test abuse reports between non-participants and task participants, blocked-user discovery/chat behavior, evidence visibility, malicious/false reports, and appeal.

## Account, contact, and session lifecycle

- Change email address: require proof of control of the new address; define whether the old address is notified and when sessions/capabilities are revoked.
- Change phone number: validate format; do not mark verified absent a separate verification process.
- Lose access to email: test the approved recovery/support process without allowing support to disclose or reset credentials unsafely.
- Sign in on multiple devices, sign out on one/all devices, expire/revoke sessions, and change password. Verify the intended session invalidation policy on every client.
- Leave a session idle, background the app, change account status elsewhere, then resume. Refresh or API authorization must not retain stale access.
- Submit simultaneous profile/preference changes from web and mobile. Resolve conflicts predictably and preserve server-authoritative state.
- Request account deletion with no active work, with active work, with open disputes, and with unpaid/held funds. Define the required resolution and applicable retention before deleting data.
- Request data access/export or correction where required by the approved privacy process. Verify identity before disclosing/exporting sensitive data, minimize the export, and audit administrative access.
- Close/reopen or suspend/reactivate an account. Verify which credentials, consent, KYC, role, and capability states persist or require renewed confirmation.

## Notifications, reliability, and operational support

- Email or push delivery is delayed, duplicated, rejected, or unavailable. Core state must remain correct; notification failure must be observable and recoverable.
- App is offline, killed, backgrounded, or loses connection during registration, verification, task creation, acceptance, payment, completion, dispute, or payout.
- A client times out after the server commits. Retry safely and show the committed server state rather than creating a duplicate operation.
- Deep link opens when the app is installed, absent, logged out, already logged in, or running an older build. Route users safely to the intended confirmation flow.
- An operation remains pending beyond its expected time. Monitoring/alerts and an operator recovery path exist; no false success is shown.
- Audit trails identify actor, action, time, relevant state transition, and correlation identifier, while excluding passwords, raw tokens, full ID data, and payment secrets.
- Support tooling uses least privilege, records access to sensitive records, and cannot silently override eligibility, financial state, or identity outcomes.
- Verify notification recipient isolation, unread count consistency, mark-read/mark-all/delete/clear-read behavior, pagination, duplicate delivery, and deep links to deleted or no-longer-authorized tasks.
- Verify support-ticket validation, ownership isolation, status progression, admin-only changes, duplicate submissions, attachment policy (if added), and escalation/response ownership. A ticket marked resolved must have a user-visible outcome.
- Verify task chat and progress access for creator and assigned runner only, including after cancellation/completion/dispute/suspension. Confirm system messages cannot be forged as another user and conversation closure/reopening follows policy.
- Verify rating eligibility for both task participants only after the approved terminal state, one rating per rater/task, valid score and review-length limits, concurrent duplicate submissions, and moderation/privacy of public review text.

## Both preference scenarios

1. A verified Both account with incomplete runner checks can post a task and browse tasks.
2. The same account attempts to accept paid work before runner checks pass. Acceptance is denied; creator capability and existing posted tasks remain unaffected.
3. Complete runner checks without changing preference. The same account can then accept eligible tasks.
4. Attempt to accept the account's own task. The backend rejects it.
5. Change preference from Both to Creator or Runner while the user has active or assigned tasks. New actions inconsistent with the preference are blocked, but existing obligations, task records, and required completion/dispute flows remain accessible.
6. Change preference back to Both. Only capabilities whose independent backend requirements are currently satisfied become available.
7. Attempt to change preference by directly modifying a client payload or stale local data. The backend validates and persists only allowed values and recalculates effective capabilities.

## Profile, privacy, state consistency, and abuse cases

- Leave an existing ID field blank where the UI says blank means "keep the ID on file." The backend preserves the current value.
- Submit an invalid or duplicate replacement ID. The update is rejected and does not overwrite the current value.
- Verify full ID numbers do not appear in standard profile responses, logs, browser storage, or mobile storage. Do not claim encryption at rest unless it has been implemented and verified.
- Confirm phone data is validated consistently but is not represented as verified without an actual phone-verification process.
- Change profile data or preference on one client and confirm the other client reflects the backend state after refresh/re-login.
- Revoke or change eligibility on the backend while a session is active. Subsequent actions are denied even if the client has cached a previous capability flag.
- Test archived/suspended accounts and changes to email, identity, or payout status while tasks are active. New actions are blocked as policy specifies, and existing obligations remain safely manageable.
- Exercise auth and recovery rate limits through the deployed proxy. Confirm limits are applied to the intended client IPs and cannot be bypassed by client-supplied forwarding headers.
- Confirm unknown-account, duplicate-account, and blocked-action responses do not leak unnecessary personal or account information.

## Cross-client assertions

Run relevant scenarios against the backend API and through both the website and mobile app.

- Website and mobile submit the same backend contract for registration, consent, verification, recovery, and profile updates.
- Both clients present the same effective capability state and explain blocked actions with an actionable next step.
- Hiding/disabling an action in the UI is not the only enforcement; direct API requests receive the same policy decision.
- A denied action never partially creates a task, assigns a runner, charges a user, or changes payout state.
- Tokens are removed from the visible URL after the client reads them. Verification/reset tokens are single-use and never persisted in ordinary client storage.
- Error, loading, retry, offline, and expired-link states are usable and do not imply success when the backend operation failed.

## Evidence to record for each E2E case

For each test, record:

1. Preference and account state before the action (email, identity, payout, account status, and relevant task state).
2. Client and endpoint used, request result/status, and user-visible message.
3. Database/task/payment state after the action, including confirmation that rejected requests caused no side effects.
4. Result on the other client after refresh or re-login.
5. Whether the case passed, failed, or is blocked by an unresolved policy/configuration decision.

## Release acceptance criteria

- All three preferences pass their allowed and disallowed creator/runner paths.
- Both preference has independently gated creator and runner capabilities.
- Backend authorization passes direct API negative tests, including concurrent task acceptance and duplicate registration.
- Verification, resend, reset, password change, expiry, single-use, and session revocation work end to end with staging email delivery.
- Identity and payout gates behave according to the approved policy; ID presence/checksum alone is not treated as identity verification.
- No rejected request has unintended persistent side effects.
- Privacy checks confirm standard profile/client storage does not retain full ID values.
- Forwarded headers and rate limiting are verified in the deployed staging topology.
- Website and mobile flows pass on the same staging backend and migrations.

## Policy decisions to confirm before finalizing gates

- Which identity-verification provider and statuses qualify a runner to accept paid tasks.
- Whether payout-account setup is required before accepting a task, before task completion, or only before withdrawal.
- Which minimum profile fields are genuinely required to post a task.
- Which task lifecycle transitions remain available after a user changes preference or is suspended.
- Whether signup collects a phone number at all, and whether future phone verification is in scope.

## Navigation, sidebar, and freshness audit

This section records the local cross-repository fixes and the remaining staging gaps from the route/action freshness review. Local changes are not proof of a completed end-to-end audit or of a deployed staging fix.

### Fixed locally

- Website and mobile notification badges now use the backend unread-count endpoint instead of counting only the currently loaded notification page.
- Mark-read, mark-all-read, task-message read, remove, and clear-read actions update visible state optimistically and reconcile with the server; failed mutations reload authoritative notification state.
- Website sidebar task and conversation counters refresh when the user changes routes, rather than only when the account preference changes.
- The mobile notifications screen refreshes when it regains focus so notifications changed elsewhere are not left stale indefinitely.
- Mobile payment notifications no longer navigate to the unregistered `Wallet` route; they open completed tasks. Task notifications with only a numeric task ID fall back to the posted-task list.
- Mobile rating submission checks the API's success flag before displaying a success confirmation.
- Backend payment webhook activation now only advances tasks still in `PendingPayment`, preventing success-event replays from reactivating cancelled/refunded tasks.
- Backend dispute creation now requires a completed task with held escrow and moves eligible escrow into the disputed state.
- Available-task `CanAccept` now includes the verified payout-bank requirement used by acceptance policy. Budget edits enforce R50–R100,000 and are rejected once a payment attempt exists.

### Still open before staging sign-off

- The website admin shell redirects administrators away from `/notifications`; confirm the intended admin notification route and make it reachable or remove the misleading entry point.
- Website sidebar task/conversation counters refresh on route changes, but a mutation performed without a route change may still leave the corresponding count stale until navigation. Add mutation-driven invalidation or a shared refresh event.
- Mobile task, dashboard, and other retained screens generally fetch on mount; unlike notifications, they may show stale state when revisited without remounting. Add focus refresh or targeted cache invalidation to every stateful screen/action pair.
- Numeric-only mobile task notification IDs cannot deep-link to the individual task/chat because the navigation contract expects a string task ID. Resolve the backend/client identifier contract and test deleted, inaccessible, and completed task destinations.
- No focused regression tests were added for the backend webhook replay, dispute eligibility, checkout-vs-budget edit, budget bounds, browse-vs-accept eligibility, or client notification/read-action failure and cross-device cases.
- Add web/mobile automated coverage for unread-count pagination, notification actions, sidebar counts after chat/task mutations, every notification destination, focus/reconnect refresh, and rating API failure responses.
- The signup/profile ID and payout-bank checks are not a verified KYC state machine. Select and integrate the approved identity provider and ensure that client claims cannot substitute for a verified backend status.
- Confirm whether local mobile fixes belong on the current `feat/mobile-feature-parity-audit-fixes` branch or should be ported to the staging-targeted auth branch before opening/updating a PR.

### Validation and release evidence

- Backend: `dotnet test DoForYou.Tests/DoForYou.Tests.csproj --no-restore --verbosity minimal` passed (42 passed, 0 failed). The existing suite does not include focused regression cases for the new controller guards.
- Website: `npm run build` passed (`tsc` and Vite production build); Vite reported the existing large-chunk advisory.
- Mobile: `npm run typecheck` passed after the notification focus and mutation-reconciliation changes.
- Cross-client staging verification is still required; local builds do not prove the API response contracts, permissions, deployment configuration, or real-time state behavior in staging.
