# Mobile UI and Splash Handoff

**Purpose:** Give the next developer a detailed handoff of the mobile UI, launcher icon, and splash work discussed in this session, including what is changed, what is verified, and what still needs device testing.

**Last updated:** 2026-10-14  
**Repository:** `DoForYou-ZA/dfy-mobile`  
**Working branch:** `feat/mobile-feature-parity-audit-fixes`

## Executive summary

The work began with feedback on Android screenshots of the sign-in screen, account-creation screen, and launcher icon. The main concerns were an oversized launcher wordmark, inconsistent placeholder-style `D` branding, auth-screen layout and accessibility issues, inert “Post a task” / “Find work” pills, and a long white/blank interval before the cream animated splash.

Several auth, icon, and splash-source changes have been made locally. Expo Web screenshots and recordings exist, and static/type checks have passed. The native white-to-cream transition is **not yet verified on Android**. A native splash is generated into the app at build time, so the current local `app.json` change requires a new Android build and installation before the phone behavior can be confirmed.

The user asked not to commit the launcher-icon fix. No changes described here should be committed or pushed unless the user explicitly asks.

## Original feedback and goals

The user’s original screenshot review identified or raised these issues:

### Launcher icon and branding

- The `DFY.` wordmark appeared too large and close to the launcher tile edges; Android adaptive-icon masks can crop it.
- The launcher icon and in-app logo looked like different identities.
- A plain `D` or `D.` inside an orange tile appeared to be a placeholder, and branding differed between auth screens.
- Goal: pad the Android adaptive foreground and use real, consistent branding rather than a letter placeholder.

### Sign-in screen

- “Post a task” and “Find work” looked interactive but did nothing; user agreed they were unnecessary if not functional.
- Disabled button contrast was weak.
- A decorative top-right shape was clipped.
- The heading wrapped awkwardly.
- Large unused space below the content made the screen feel top-heavy.
- A “Forgot password?” path was missing.
- Input placeholders/borders and secondary text were low contrast or too small.
- Password visibility was a text “Show” control rather than a conventional accessible eye control.
- Several different taglines competed for attention.

### Registration screen

- Example placeholders could be mistaken for user-entered values.
- Label/input spacing was inconsistent.
- South African phone input needed a `+27` prefix and suitable validation/input behavior.
- Disabled Continue button contrast was weak.
- Step labels/indicator were small, low contrast, and potentially misaligned.
- A clear back path to sign-in was needed.
- Inline validation and terms/privacy consent were needed.
- There was excess bottom whitespace, and the header/branding differed from sign-in.

### Cross-cutting concerns

- Safe areas, keyboard behavior, touch targets, text contrast, and consistent design tokens needed attention.
- The auth content should feel vertically balanced while continuing to scroll and remain usable with the keyboard open.

The user also asked to increase the splash duration beyond five seconds, requested splash videos, and repeatedly reported the same white blank screen before the cream splash.

## Work and decisions so far

### Branch and commit context

- The intended work branch is `feat/mobile-feature-parity-audit-fixes`, not `main`.
- Existing user-provided history says commit `8054530` (`feat(mobile): refine auth branding and splash`) was pushed to that branch.
- That commit predates the later local changes summarized below; do not assume it contains the current launcher, auth, video, or native-splash updates.
- The user pasted PR #11 information: at that point, GitHub showed five successful checks, including Android release build, typecheck/bundle, screenshots, and UI audit. Those checks are evidence for the PR build at that time, **not** proof that the current local changes were built or installed.
- Earlier branch reconciliation reportedly left `stash@{0}` as a backup. Do not drop or alter it without checking with the user.

### Launcher icon

- At commit `8054530`, `assets/icon.png` and `assets/adaptive-icon.png` were identical Git blobs; the existence of an icon-generation script did not mean a distinct padded adaptive icon had been committed.
- A separate `assets/adaptive-icon.png` has since been generated locally with transparent space and reduced, centered artwork intended to fit inside Android’s adaptive-icon safe area. `assets/icon.png` was left unchanged.
- The change is currently local and uncommitted. User explicitly requested “fix that for the tile do not commit it.”
- `scripts/generate-icons.py` was adjusted so its documented outputs no longer include the transparent `splash-blank.png`.
- Visual size/safe-zone correctness still requires checking the icon in a built Android launcher tile; static checks cannot establish perceived size after masking.

### Auth screens

Local changes include:

- `src/components/AuthScreenLayout.tsx`: groups and vertically balances auth content rather than leaving a large spacer; preserves scrolling and keyboard-aware behavior.
- `src/screens/auth/LoginScreen.tsx`: shorter heading and an accessible eye-icon password toggle. The password-help path is a support-email flow; it is not evidence of an automated password-reset backend.
- `src/screens/auth/RegisterScreen.tsx`: `+27` prefix and shorter local-number example; adjusted heading/back-button arrangement to avoid overlapping the logo. Existing registration validation and consent work are retained.
- The inert “Post a task” / “Find work” pills are absent from sign-in.
- Existing work includes terms/privacy consent, phone validation, and the branded sign-out dialog, but this handoff does not claim every item in the original screenshot review has been fully addressed or device-verified.
- `e2e/marketing-screenshots/mobile-marketing-screenshots.spec.ts` includes checks for registration layout geometry, the phone prefix, and the sign-in eye control.

### Animated splash and startup investigation

- `src/components/AnimatedSplash.tsx` implements the cream React splash and DFY wordmark animation. It accepts a `fontsReady` prop and uses system-font fallbacks.
- In the current animation, D/F/Y have deliberate stagger delays of 50 ms, 250 ms, and 450 ms respectively; the tagline starts later. The seven-second timer determines when the animated splash ends, not when the DFY letters first start animating.
- `App.tsx` now mounts `AnimatedSplash` immediately instead of rendering `null` while custom fonts load. The app navigator waits for the splash animation, auth/session restoration, and font loading (or font error).
- `App.example.tsx` was updated to match the splash props/contract.
- `SplashScreen.preventAutoHideAsync()` is called at app module scope. The React splash calls `SplashScreen.hideAsync()` when its root view lays out.
- The user’s most recent clarification: their concern is the sequence **white blank screen → cream background → DFY appears around the seventh second**. This is not just the 50–450 ms stagger between letters. Explain the distinction accurately and do not tell them the native white gap is fixed without a device run.

### Native splash configuration (latest local change)

- Before the latest change, the top-level Expo and Android splash entries referenced transparent `assets/splash-blank.png`; `expo-splash-screen` was installed but not explicitly configured in the plugin array.
- `app.json` has now been changed locally to configure:
  - top-level splash image `./assets/icon.png`, width 180, cream `#FFF9F2`;
  - Android splash image `./assets/icon.png`, width 180, cream `#FFF9F2`;
  - explicit `expo-splash-screen` plugin with the same artwork, width, and cream background, including a cream dark-mode background.
- `npx expo config --type public` and `npx expo config --type introspect` succeeded. Introspected Android resources contain the cream `splashscreen_background` and use `@drawable/splashscreen_logo`.
- `scripts/audit-mobile-ui.mjs` now checks that all splash references point to the brand artwork and cream background.
- This is source/config validation only. It does not confirm the phone’s real startup sequence. Android splash assets/config are embedded at build time; generate and install a fresh APK, then record a cold launch on the target phone.
- Be alert to the fact that `assets/icon.png` includes its own cream tile background, so the chosen native splash artwork is a small contained cream-backed icon on a cream splash. Confirm the resulting appearance is what the user wants in an APK. The user asked about seeing cream then the animated DFY; they did not explicitly approve displaying a static centered icon during the native phase. If the icon looks like a duplicate/still logo before the animation, adjust the native artwork deliberately and retest.

### Preview images and videos

Generated under `website-assets/mobile-app/`:

- `dfy-mobile-sign-in.png`
- `dfy-mobile-registration.png`
- `dfy-mobile-splash.png`
- `dfy-mobile-splash.webm`
- `dfy-mobile-startup-preview.webm` (earlier preview)
- `dfy-mobile-splash-start-check.webm` (fresh capture from the current Expo Web source, approximately 8.5 seconds)
- Playwright may also leave auto-named `page@*.webm` files in that folder.

These are **Expo Web / Playwright** captures at a phone-sized viewport, not native Android recordings. They can show the React animation but cannot prove whether the Android OS displays a white screen before React mounts. The latest capture test was run with:

```sh
EXPO_PUBLIC_DFY_API_URL=http://127.0.0.1:8081/api/v1 \
  npx playwright test --config=playwright.marketing.config.ts \
  e2e/marketing-screenshots/mobile-marketing-screenshots.spec.ts \
  --grep "record the splash-to-login startup preview"
```

It passed and wrote `dfy-mobile-splash-start-check.webm`. The local staging-only proxy intentionally refuses to start unless the API URL points to its local proxy address.

## Current local state

The latest observed branch/status was:

```text
## feat/mobile-feature-parity-audit-fixes...origin/feat/mobile-feature-parity-audit-fixes
 M App.example.tsx
 M App.tsx
 M app.json
 M assets/adaptive-icon.png
 M e2e/marketing-screenshots/mobile-marketing-screenshots.spec.ts
 M scripts/audit-mobile-ui.mjs
 M scripts/generate-icons.py
 M src/components/AnimatedSplash.tsx
 M src/components/AuthScreenLayout.tsx
 M src/screens/auth/LoginScreen.tsx
 M src/screens/auth/RegisterScreen.tsx
?? test-results/
?? website-assets/
```

The `test-results/` directory appeared after the recent Playwright test. Inspect before deciding whether it is temporary output; do not delete user data or unrelated files. The listed source/asset changes are intentionally local and uncommitted.

## Verification completed

After the latest splash configuration change:

- `npx expo config --type public` — passed.
- `npx expo config --type introspect` — passed; Android output includes cream splash resources and splash logo drawable.
- `npm run typecheck` — passed.
- `npm run audit:ui` — passed with **17 checks passed, 0 failed**, plus 4 explicit visual/device checks.
- `git diff --check` — passed.
- Fresh Playwright splash startup video test — passed.

Visual/device items still open in the UI audit include:

- auth vertical balance on actual small/tall devices;
- launcher icon perceived size under Android masking;
- real splash animation/transition timing;
- keyboard, clipping, contrast, and tap targets.

No Android device was connected during the earlier investigation (`adb devices -l` returned no device). Confirm current device availability before attempting native validation.

## Recommended next steps

1. Review the `app.json` native splash artwork choice against the desired visual sequence. Confirm that the static native artwork does not create an unwanted second DFY logo before the animated one.
2. Produce a fresh Android build from this exact worktree/configuration and install it on the target device. A prior APK cannot pick up the `app.json` changes.
3. Cold-launch while recording the device screen. Verify the full timeline: OS/native launch, cream background, React animation start, and transition to sign-in/home. Check for white frames and measure when the first DFY letter appears.
4. If the device still shows white before cream, inspect the generated APK/native resources and splash hide/layout timing rather than relying on Expo Web. Keep the native splash visible until the React splash view is actually ready.
5. Review the launcher tile and auth screens visually on-device, including keyboard-open layouts and safe areas.
6. Preserve the user’s no-commit instruction unless they explicitly request a commit or push.

## Important communication points

- Be clear about the difference between the native OS splash and the React animated splash.
- The web video is useful for reviewing animation timing only; it is not Android-device evidence.
- The seven-second duration means the React splash remains visible that long. DFY letters are scheduled to begin within the first half-second after the animation component starts. A perceived seven-second wait for DFY suggests an earlier startup/native screen or a failure to see the web recording at the start; confirm with a cold native launch.
- Do not claim that the white screen is fixed until the new APK has been installed and observed on the device.

---

## Expanded chronological conversation record

This is a topic-by-topic handoff, not a verbatim export of every chat message. It records the user’s goals, corrections, decisions, and the answer/action taken so the next person can continue without relying on chat history.

### A. Earlier source/commit review

1. The user first asked what had changed in the recent mobile work and whether the launcher-tile logo had also been reduced to fit.
2. A prior review was based on commit `8054530` on `feat/mobile-feature-parity-audit-fixes`. It reported:
   - The animated splash and supporting app-source changes were implemented.
   - `scripts/generate-icons.py` existed, but the actual adaptive icon at that commit had not been regenerated distinctly.
   - `assets/icon.png` and `assets/adaptive-icon.png` had the same Git blob SHA (`1186a0094a4e97dcd5194220aca5867daa87d1c0`) at that commit.
   - Therefore, the earlier answer correctly concluded that the tile fix could not be claimed from the script alone.
3. The user asked where the logo lived and which image powered the tile. The relevant paths discussed were the general app icon and Android adaptive foreground in `assets/`, wired by `app.json`.
4. The user asked whether the logo had been reduced enough for the tile. The answer was no at that commit, because identical icon files showed that the padded adaptive asset had not been produced there.
5. The user explicitly requested: **“fix that for the tile do not commit it.”**
   - A separate locally modified `assets/adaptive-icon.png` was produced with transparent canvas/padding and a smaller centered wordmark.
   - Do not commit or push this unless the user reverses that instruction.
6. The user said five seconds was not enough for the splash.
   - Animated splash duration was subsequently set to seven seconds for normal motion; reduced-motion mode remains short.
   - This duration describes how long the React animation screen remains before the app proceeds. It is not intended to postpone the first letter until second seven.

### B. Screenshot review and requested fixes

7. The user shared multiple WhatsApp screenshots and supplied detailed screenshot feedback. The pasted feedback covered sign-in, registration, the launcher icon, and the bottom whitespace.
8. The initial findings emphasized:
   - oversized/cropped `DFY.` launcher tile;
   - mismatch between launcher wordmark and orange in-app `D`/`D.` tile;
   - inert “Post a task” / “Find work” pills;
   - low-contrast disabled actions and inputs;
   - clipped decoration, awkward heading wrap, excess bottom whitespace;
   - missing password-help path, weak password visibility control, inconsistent taglines;
   - registration placeholders that looked like filled data, inconsistent field spacing, local phone formatting, weak step labels, missing return path and consent, and bottom whitespace;
   - cross-screen safe-area, keyboard, accessibility, target-size, and design-token consistency.
9. The user then specifically asked: **“AND THE BOTTOM HUGE SPACE ON BOTH SCREENS?”**
   - The feedback proposed centering the content, pinning secondary/footer content near the bottom, or giving the space useful content.
   - User clarified that “centralized” meant centered and requested the logo beside “DoForYou” on both screens.
   - Guidance included a shared branded auth header, consistent alignment, scroll content that can grow (`flexGrow: 1`), keyboard avoidance, and safe-area padding.
10. An initial pasted UI implementation example contained rough/incomplete markup. Follow-up notes corrected details:
    - preserve the complete heading (do not accidentally omit “each other” unless the chosen final copy intentionally changes);
    - preserve the full secure footer note;
    - make “Already have an account?” include the sign-in action;
    - replace the literal “Show” text with the eye icon;
    - use a shorter South African local phone example when a `+27` prefix is separately displayed.
11. The eventual local auth-screen changes group and center content, preserve scroll/keyboard behavior, shorten the sign-in heading, use an eye-icon control, add `+27`, and position the registration back control so it does not overlap the logo.
12. A UI audit and screenshot/geometry assertions were added or extended to catch several regressions (password eye, phone prefix, logo/back-button overlap, spacing, etc.).
13. The user asked “fix everything.” Treat this as implementation intent for the screenshot feedback, but do not claim that every speculative suggestion (for example, social sign-in or backend-driven reset flow) was implemented. The current screen source and backend contracts must be inspected before claiming each individual item is done.

### C. Branch and GitHub pull request

14. The user showed GitHub PR #11: **“feat: close core mobile feature parity gaps”**, ready to merge, opened from `feat/mobile-feature-parity-audit-fixes` into `main`.
15. The user explicitly corrected/clarified the target: **“and should be for this branch … and not main branch.”**
    - The active working branch is `feat/mobile-feature-parity-audit-fixes`.
    - `main` is only the PR base shown on GitHub; it is not the branch to checkout or apply the user’s local screenshot fixes to.
    - Keep all work on the feature branch. Do not merge into or push directly to `main`.
16. The PR information pasted by the user stated:
    - PR #11 had five successful checks at that time: Android release build, typecheck/bundle, marketing screenshots, UI regression audit on PR, and UI audit on push.
    - PR page said no conflicts and “Ready to merge.”
    - A PR comment said native-device runtime verification was still required after producing a new APK.
17. A prior response gave download links but explicitly warned that the links referred to an earlier artifact and did not establish the artifact was built from `8054530`.
18. User-provided commit list included later branding, icon, auth, audit, screenshot, and CI changes. These commit names are historical context only; do not infer that any uncommitted local changes are part of the PR or successful CI.
19. The current source changes after the pushed `8054530` remain uncommitted. At the most recent observed status, the branch tracked `origin/feat/mobile-feature-parity-audit-fixes` and had local modifications plus untracked preview/output files.
20. The correct Git behavior for the next person:
    - continue on `feat/mobile-feature-parity-audit-fixes`;
    - preserve all current modifications;
    - inspect `git status` before any cleanup;
    - do not commit or push unless explicitly asked;
    - do not switch to `main`, reset, or discard user work.

### D. Login/registration image and preview questions

21. The user asked where registration and login images were saved.
    - Current screenshot paths are `website-assets/mobile-app/dfy-mobile-sign-in.png` and `website-assets/mobile-app/dfy-mobile-registration.png`.
22. The user then asked to “revive them.”
    - Screenshots were regenerated from Expo Web/Playwright and saved under the same mobile asset directory.
23. The user asked about the splash screen, then asked whether it could be a video.
    - WebM captures/previews were generated to demonstrate the React splash/transition. These are web-rendered captures, not native phone videos.
24. The user described the startup as a blank white splash followed by cream and DFY. They reported the same behavior again after earlier adjustments.
25. The user asked for another video as evidence.
    - `dfy-mobile-splash.webm` is the animation preview.
    - `dfy-mobile-startup-preview.webm` is the longer startup-to-login web preview.
    - A later run generated `dfy-mobile-splash-start-check.webm` with the current local changes.
26. The user asked for a download link. The response distinguished the earlier artifact from the exact latest commit because the specific run/artifact ID had not been confirmed.
27. The user then pasted their actual PR view, including checks and the “still in progress?” comment. This does not substitute for a fresh build/install of the current local configuration.

### E. Persistent white-before-cream startup issue

28. The user said the startup still showed a blank white screen for several seconds before cream and the DFY animation.
29. The source investigation established:
    - Earlier `App.tsx` behavior could return no React UI while waiting for custom fonts, leaving only the native splash visible.
    - `AuthContext` starts in a loading state and restores the saved session asynchronously; child components still render while that happens.
    - Expo native splash resources are build-time assets embedded into the APK.
    - The previous web capture could not show what Android’s OS/native splash rendered.
    - There had been no connected Android device in the earlier environment check.
30. `App.tsx` was changed to mount `AnimatedSplash` immediately with system-font fallbacks. It waits before showing the navigator until the splash timer, auth restoration, and font load/error are complete.
31. `AnimatedSplash` receives `fontsReady`, uses fallback font styles, and hides the native splash after its root view lays out.
32. The native config was subsequently changed (see below) because the previous splash artwork path was transparent/blank.
33. The user’s key clarification late in the conversation was that the observed timeline is **white blank → cream appears → DFY only visibly bounces in around the seventh second**. They were not asking about the intentional small stagger between individual letters.
34. In the current code, animation start is scheduled shortly after the React splash mounts: D at 50 ms, F at 250 ms, Y at 450 ms. The `setTimeout(onDone, 7000)` controls the full animation/splash duration. Thus the reported seven-second wait strongly suggests time before the React splash/animation starts, or a difference in the actual native build/runtime.
35. A response explained this distinction but did not claim the fix was proven. Keep doing so: the source/config fix needs a rebuilt and installed APK, cold-launched and recorded on device.

### F. Latest native splash configuration change

36. Before the latest change, `app.json` had:
    - top-level splash image `assets/splash-blank.png`;
    - Android nested splash image `assets/splash-blank.png`;
    - cream background `#FFF9F2`;
    - no explicit `expo-splash-screen` plugin entry, even though package `expo-splash-screen` was installed.
37. A local config edit added explicit `expo-splash-screen` options and pointed the top-level, Android, and plugin image values at `assets/icon.png`, with `imageWidth: 180`, `resizeMode: "contain"`, and cream `#FFF9F2`, including dark-mode cream.
38. The UI audit now checks that these image and color settings remain aligned.
39. Expo config introspection showed Android `splashscreen_background` as `#FFF9F2` and `windowSplashScreenAnimatedIcon` as `@drawable/splashscreen_logo`.
40. This validates generated config, not the actual visible native output. The configured icon artwork has a cream background of its own, so review the built launch screen for an unwanted static badge/duplicate logo before deciding this is the final design.

## File-by-file change register

This describes the worktree as last observed; confirm actual diffs before editing because concurrent changes may have occurred since.

| File/path | Purpose of local change | Verification / caveat |
|---|---|---|
| `App.tsx` | Render React splash immediately, use font readiness/error state, delay navigator until splash/session/font gates complete | Typecheck passed; native cold launch unverified |
| `App.example.tsx` | Align example app with new `fontsReady` prop and splash contract | Typecheck passed |
| `app.json` | Point top-level/Android/plugin splash artwork to icon with cream background | Expo public and introspected config passed; requires new APK to observe |
| `assets/adaptive-icon.png` | Separate transparent reduced Android foreground with safe padding | Static audit confirms distinct asset; actual launcher mask appearance unverified |
| `src/components/AnimatedSplash.tsx` | Animated wordmark, staggered letters, tagline, system-font fallback, 7-second display timer; hide native splash on layout | Typecheck/audit passed; native timing unverified |
| `src/components/AuthScreenLayout.tsx` | Shared vertically balanced auth layout while retaining scrolling/keyboard support | Typecheck/audit passed; visual device review open |
| `src/screens/auth/LoginScreen.tsx` | Login heading/password eye/password-help and branding refinements | Typecheck/audit passed; actual backend semantics for support flow should not be overstated |
| `src/screens/auth/RegisterScreen.tsx` | `+27` prefix, shorter example, title/back-button layout, registration screen refinements | Typecheck/audit and browser assertions passed; device review open |
| `scripts/audit-mobile-ui.mjs` | Static rules for shared branding, auth controls/layout, adaptive icon, native splash artwork/colors, and immediate splash mounting | Latest run: 17 pass, 0 fail; 4 visual checks remain |
| `scripts/generate-icons.py` | Documentation/output list adjusted after blank splash image stopped being used | No asset regeneration command was run as part of the most recent splash edit |
| `e2e/marketing-screenshots/mobile-marketing-screenshots.spec.ts` | Browser screenshot/geometry assertions and startup video capture; latest output gets a distinct check filename | Fresh capture passed; this is Expo Web |
| `website-assets/mobile-app/*` | Auth screenshots and splash videos | Untracked local assets; not native recordings |
| `test-results/*` | Playwright output created by recent run | Untracked; inspect before cleaning |
| `SESSION-HANDOFF.md` | This handoff document | Documentation only; uncommitted |

## Commands and observed results

The following were run in the worktree:

```text
npx expo config --type public
Result: completed successfully; effective top-level, Android and plugin splash config showed icon artwork and #FFF9F2.
```

```text
npx expo config --type introspect
Result: completed successfully; generated Android resources included cream splash background and splashscreen_logo drawable reference.
```

```text
npm run typecheck
Result: passed (tsc --noEmit).
```

```text
npm run audit:ui
Result: 17 passed, 0 failed; 4 visual/device checks explicitly remain.
```

```text
git diff --check
Result: passed at the time of the check.
```

```text
EXPO_PUBLIC_DFY_API_URL=http://127.0.0.1:8081/api/v1 npx playwright test \
  --config=playwright.marketing.config.ts \
  e2e/marketing-screenshots/mobile-marketing-screenshots.spec.ts \
  --grep "record the splash-to-login startup preview"
Result: 1 test passed; wrote website-assets/mobile-app/dfy-mobile-splash-start-check.webm.
```

The first attempt at the browser test omitted the required local proxy environment and failed before startup with:

```text
Refusing to start screenshot proxy: EXPO_PUBLIC_DFY_API_URL must point to the local staging-only proxy.
```

That was corrected by setting the local URL shown above. No application test failed in that first attempt; the proxy guarded its API target as designed.

## Exact remaining work and decision points

### Required before claiming splash resolution

- Determine whether the target Android device/emulator is now connected.
- If available, build a new Android APK from the current feature branch/worktree. Do not reuse an APK generated before the current `app.json` change.
- Install the new APK and cold-launch it while recording the physical display.
- Note timestamp/frame at:
  1. tap/icon launch;
  2. first rendered frame;
  3. cream native background;
  4. first visible DFY letter;
  5. completion of the seven-second React splash;
  6. auth/home screen.
- If white remains, inspect the APK’s generated Android resources and timing of `preventAutoHideAsync`/`hideAsync`; do not infer from web.
- If cream appears promptly but the logo still waits, investigate the component mount and animation scheduling in the actual Android runtime.
- Consider replacing the static icon image in native splash with a plain cream-only resource if the intended experience is cream first, then animated DFY. Make that change only with a clear understanding of how Expo’s Android plugin uses its splash image and inspect the generated result.

### Other visual verification

- Compare launcher adaptive icon in the installed launcher, checking circle/squircle crop and perceived logo size.
- Check login/registration balance and scroll behavior on the real device at normal and large font scales.
- Open the keyboard on each screen and confirm fields/actions remain accessible.
- Verify actual contrast and touch target sizes visually and with accessibility tooling where possible.
- Inspect all generated videos; do not refer to the WebM as proof of native launch behavior.

### Git and handoff safety

- Feature branch only: `feat/mobile-feature-parity-audit-fixes`.
- Never retarget this work to `main` or push directly to `main`; `main` is PR #11’s base branch only.
- Do not commit or push unless explicitly requested; the launcher fix in particular was explicitly “do not commit.”
- Preserve all uncommitted changes and inspect `git status`/`git diff` before acting.
- Preserve any existing stash, including the historically mentioned `stash@{0}`.
- Do not delete `test-results/` or other generated/untracked files without checking their contents and scope.

## Concise continuation brief

The current unresolved issue is not the animation’s letter stagger. The user sees a long white native startup, then cream, with DFY apparently only appearing around seven seconds into the experience. The latest local `app.json` now requests cream plus icon artwork through the Expo splash plugin; `App.tsx` mounts the animated React splash immediately with font fallbacks; static/config checks pass. The only decisive test is a new APK on the target Android device, cold-launched and recorded. Keep changes on `feat/mobile-feature-parity-audit-fixes`, do not commit, and do not say the white-screen issue is solved until that test is observed.
