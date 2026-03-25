# REMEDIATION_PLAN.md

> **Source:** Full audit report (2026-03-24)
> **Scope:** Phase 1 only — Security, Privacy, Clinical Safety
> **Status:** Approved for execution planning. No code changes yet.

---

## 1. Executive Summary

The Tibrah app has **6 non-negotiable P0 defects** that must be repaired before any feature work continues. These span three domains:

| Domain | Core Problem |
|--------|-------------|
| **Security** | Auth credentials stored in localStorage; middleware auth cookie is unsigned and forgeable; admin panel accessible to anyone who crafts a cookie |
| **Privacy** | Every `db.entities.*.list()` call returns all users' data — zero user-scoping |
| **Clinical Safety** | Hardcoded treatment plan shown to all patients; fake Google sign-in creates throwaway accounts with no recovery path |

Phase 1 addresses only these. No features will be added, removed, or visually redesigned. Wellness features (frequencies, meditation, emotional medicine) remain untouched but are frozen from modification.

---

## 2. Non-Negotiable P0 Fixes

| ID | Title | Domain | Effort |
|----|-------|--------|--------|
| **P0-SEC-1** | Replace localStorage auth with Firebase Auth as sole provider | Security | High |
| **P0-SEC-2** | Replace unsigned auth cookie with Firebase ID token verified server-side | Security | Medium |
| **P0-SEC-3** | Unify protected route definitions into single source of truth | Security | Low |
| **P0-SEC-4** | Remove admin dashboard link from login page | Security | Low |
| **P0-PRIV-1** | Add mandatory `user_id` scoping to all database queries | Privacy | Medium |
| **P0-CLIN-1** | Disable fake Google sign-in when Firebase is unavailable | Clinical Safety | Low |
| **P0-CLIN-2** | Replace hardcoded treatment plan with dynamic empty state | Clinical Safety | Low |
| **P0-CLIN-3** | Add emergency contact banner to triage emergency/urgent results | Clinical Safety | Low |
| **P0-LEGAL-1** | Create privacy policy + terms pages; link from registration consent | Legal/Trust | Medium |

---

## 3. Phase 1 Scope — Detailed Breakdown

### P0-SEC-1: Replace localStorage auth with Firebase Auth

**Current state:**
- `lib/localAuth.ts` (587 lines) stores password hashes, salts, sessions, and user records in `localStorage` under `tibrah_users` and `tibrah_session`.
- `contexts/AuthContext.tsx` attempts dual Firebase/Local auth with fragile fallback logic (lines 160–201).
- Auth provider can silently switch mid-session, causing user-id fragmentation.

**Target state:**
- Firebase Auth is the single auth backend. If Firebase is not configured, the app shows a configuration error — not a local fallback.
- `localAuth.ts` is retired. All localStorage auth keys (`tibrah_users`, `tibrah_session`, `tibrah_login_attempts`) are no longer written.
- `AuthContext.tsx` simplifies to Firebase-only: `onAuthStateChanged` → set user → done.

**Key decisions:**
- Existing local-only users will lose their accounts. This is acceptable because the app is pre-launch and no real patient data should be stored in localStorage.
- The `signInWithGoogle` flow uses Firebase popup auth directly — no local fallback.

---

### P0-SEC-2: Replace unsigned auth cookie with Firebase ID token

**Current state:**
- `AuthContext.tsx` (line 92) sets: `document.cookie = tibrah_auth=${btoa(JSON.stringify({email, role}))}`.
- `middleware.ts` (line 49) trusts this cookie for route protection. Anyone can forge `{role: "admin"}`.

**Target state:**
- On login, store the Firebase ID token in a `tibrah_auth` HttpOnly cookie (set via a lightweight API route `/api/session`).
- `middleware.ts` verifies the token signature server-side using Firebase Admin SDK (or at minimum, decodes the JWT and checks `exp` + `iss`).
- Admin role determination happens server-side by checking the token's `uid` against the `ADMIN_EMAILS` env var, not by trusting client-supplied `role`.

**Alternative (lighter):**
If Firebase Admin SDK is too heavy for Phase 1, a simpler approach:
- Continue using the existing cookie format but **HMAC-sign it** with a `COOKIE_SECRET` env var.
- `middleware.ts` verifies the HMAC before trusting the payload.
- This is a bridge solution; full JWT verification should follow in Phase 2.

---

### P0-SEC-3: Unify protected route definitions

**Current state — 3 conflicting lists:**

| Location | Format | Routes |
|----------|--------|--------|
| `middleware.ts:16–22` | URL paths (`/profile`, `/settings`, `/medical-file`, `/my-appointments`, `/health-tracker`) | Server-side redirect |
| `Layout.tsx:57–64` | PascalCase page names (`AdminDashboard`, `Profile`, `MedicalFile`, `Rewards`, `Settings`, `MyAppointments`) | Client-side redirect |
| `BottomNav.tsx:24–49` | PascalCase → tab mapping | Highlight logic |

**Mismatches found:**
- `Rewards` is protected in Layout but NOT in middleware.
- `health-tracker` is protected in middleware but NOT in Layout's `protectedPages`.
- `BottomNav` has its own `pageToTab` which is a separate concern but relies on the same page-name conventions.

**Target state:**
- Create `lib/routes.ts` exporting:
  - `PROTECTED_ROUTES: string[]` — URL paths requiring auth
  - `ADMIN_ROUTES: string[]` — URL paths requiring admin
  - `AUTH_ONLY_ROUTES: string[]` — redirect-away-if-logged-in paths
  - `getPageNameFromPath(path: string): string` — utility to convert between formats
- `middleware.ts`, `Layout.tsx`, and `BottomNav.tsx` all import from this single file.

---

### P0-SEC-4: Remove admin dashboard link from login page

**Current state:**
- `login.tsx:377–382` renders a visible link "الدخول إلى لوحة الإدارة (للموظفين فقط)" to all users.

**Target state:**
- Remove the `<Link href="/admin-dashboard">` block entirely from `login.tsx`.
- Admin access is only reachable by typing the URL directly (and is protected by middleware).

---

### P0-PRIV-1: Add user_id scoping to all database queries

**Current state:**
- `db.ts` `list()` method (line 253) fetches every document in a collection with no filtering.
- Pages like `my-care.tsx` call `db.entities.Appointment.list()` and `db.entities.Medication.list()` — returning all patients' records.

**Target state:**
- Every entity that contains user-specific data gets a mandatory `user_id` filter.
- Add a `listForUser(userId: string)` method or modify `list()` to require a `userId` parameter for user-scoped entities.
- User-scoped entities: `Appointment`, `Medication`, `MedicationLog`, `DailyLog`, `HealthMetric`, `SymptomLog`, `TriageRecord`, `DoseLog`, `WeightLog`, `WaterLog`, `SleepLog`, `FastingSession`, `CartItem`, `Order`, `PointTransaction`, `Redemption`, `UserHealth`, `LabResult`, `DiagnosticResult`, `Reminder`, `DoctorRecommendation`.
- Non-user-scoped (shared): `Product`, `Course`, `Lesson`, `KnowledgeArticle`, `Food`, `Recipe`, `Frequency`, `RifeFrequency`, `Comment`, `HealthProgram`.

**Implementation approach:**
- Add a `userScoped: boolean` flag to `createEntityOperations`.
- When `userScoped` is true, `list()` auto-filters by `user_id` (Firestore `where` clause + local filter fallback).
- All callers must pass `userId` — enforce via TypeScript overload signatures.

---

### P0-CLIN-1: Disable fake Google sign-in when Firebase unavailable

**Current state:**
- `localAuth.ts:431–465` `signInWithGoogle()` creates `demo.user.{timestamp}@gmail.com` — a random throwaway account.
- User sees success toast but has no real Google identity.

**Target state:**
- `AuthContext.tsx` `signInWithGoogle()`: if Firebase is not configured, throw a clear error with code `auth/google-unavailable`.
- `login.tsx` + `register.tsx`: catch this error code and show toast "تسجيل الدخول بجوجل غير متوفر حالياً. استخدم البريد الإلكتروني."
- Google sign-in button remains visible (for when Firebase is configured) but gracefully handles the unavailable state.

---

### P0-CLIN-2: Replace hardcoded treatment plan with dynamic empty state

**Current state:**
- `my-care.tsx:378–406` renders a hardcoded treatment phase ("إصلاح الأمعاء وتخفيف الالتهاب", "الأسبوع ٢ من ٤", "٥٠٪") as static JSX.
- Every patient sees the same plan.

**Target state:**
- The medications tab queries `db.entities.Medication.listForUser(user.id)`.
- If no medications exist, show an empty state: "لم يتم تحديد خطة علاجية بعد. احجز جلسة تشخيصية مع د. عمر لوضع خطتك."
- If medications exist (actually prescribed by the doctor), show them with their real phases.
- Remove the hardcoded gradient card with fake progress.

---

### P0-CLIN-3: Add emergency contact banner to triage results

**Current state:**
- Triage levels include `emergency` and `urgent_sameday` but no clear "call now" protocol exists when these are triggered.

**Target state:**
- Whenever triage result is `emergency` or `urgent_sameday`, render a persistent red banner:
  - "⚠️ حالتك تتطلب رعاية طبية فورية. اتصل بالطوارئ: 122 أو توجه لأقرب مستشفى."
- Banner is sticky, non-dismissible for `emergency` level.
- This is a clinical liability shield, not a feature.

---

### P0-LEGAL-1: Create privacy policy and terms pages

**Current state:**
- `register.tsx:291–293` references "سياسة الخصوصية" with no link to an actual page.
- No `/privacy` or `/terms` route exists.

**Target state:**
- Create `pages/privacy.tsx` — privacy policy page (even if using placeholder legal text initially, it must exist).
- Create `pages/terms.tsx` — terms of service page.
- Link "سياسة الخصوصية" text in registration consent to `/privacy`.
- Both pages are public, no auth required.

---

## 4. Files Likely to Change

| File | Changes |
|------|---------|
| `lib/localAuth.ts` | Retire entirely (or reduce to stub that throws) |
| `contexts/AuthContext.tsx` | Simplify to Firebase-only; remove dual-provider logic |
| `middleware.ts` | Verify signed token instead of raw base64 cookie |
| `lib/db.ts` | Add `userScoped` flag and `user_id` filtering to `createEntityOperations` |
| `pages/login.tsx` | Remove admin link; handle `auth/google-unavailable` error |
| `pages/register.tsx` | Link privacy policy; handle Google unavailable |
| `pages/my-care.tsx` | Remove hardcoded treatment plan; use dynamic data |
| `Layout.tsx` | Import protected routes from `lib/routes.ts` |
| `components/navigation/BottomNav.tsx` | Import page mappings from `lib/routes.ts` |

**New files:**

| File | Purpose |
|------|---------|
| `lib/routes.ts` | Single source of truth for all route protection config |
| `pages/api/session.ts` | API route to set signed auth cookie from Firebase token |
| `pages/privacy.tsx` | Privacy policy page |
| `pages/terms.tsx` | Terms of service page |

---

## 5. Architectural Impact

| Change | Layers Affected | Risk |
|--------|----------------|------|
| Remove local auth | `lib`, `contexts`, `pages/login`, `pages/register` | Medium — requires Firebase to be properly configured |
| Signed cookie | `contexts`, `middleware`, new `api/session` route | Low — additive change |
| User-scoped DB | `lib/db.ts`, every page/component that calls `db.entities.*.list()` | Medium — broad surface area, many callers |
| Route config unification | `lib`, `Layout`, `middleware`, `BottomNav` | Low — refactor only |
| Treatment plan removal | `pages/my-care.tsx` only | Low — isolated change |

Per `ARCHITECTURE.md` and `Skill.md`:
- These changes **improve** separation of concerns (auth logic centralized, routes centralized).
- Business logic moves out of UI (`my-care.tsx` treatment plan) into data queries.
- No new feature-to-feature coupling is introduced.

---

## 6. Risks and Dependencies

| Risk | Mitigation |
|------|-----------|
| **Firebase not configured in `.env.local`** | Verify Firebase config exists before executing P0-SEC-1. If missing, first step is getting valid Firebase credentials. |
| **Existing local-auth users lose accounts** | Acceptable — app is pre-launch. Add a one-time migration notice if needed. |
| **`db.entities.*.list()` callers are widespread** | Grep all callers before modifying. Create a migration checklist. Some callers (admin dashboard) legitimately need unscoped access — handle those with an `adminList()` variant. |
| **Middleware token verification adds latency** | Keep verification lightweight — decode JWT + check expiry. Full Firebase Admin SDK verification can come in Phase 2. |
| **Treatment plan removal might break `my-care.tsx` layout** | Replace with a well-designed empty state, not a blank gap. |

---

## 7. Recommended Implementation Order

Execute in this exact sequence to minimize broken intermediate states:

```
1. P0-SEC-3  → Create lib/routes.ts (no breakage, pure addition) ✅ DONE
2. P0-SEC-4  → Remove admin link from login.tsx (trivial, instant) ✅ DONE
3. P0-CLIN-1 → Disable fake Google sign-in (small, isolated) ✅ DONE
4. P0-CLIN-2 → Replace hardcoded treatment plan (isolated to my-care.tsx) ✅ DONE
5. P0-CLIN-3 → Add emergency banner to triage results (additive) ✅ DONE
6. P0-LEGAL-1 → Create privacy + terms pages (additive, no breakage)
7. P0-SEC-1  → Replace localStorage auth with Firebase Auth (largest change)
8. P0-SEC-2  → Replace auth cookie with signed token (depends on SEC-1)
9. P0-PRIV-1 → Add user_id scoping to DB queries (depends on SEC-1 for stable user IDs)
```

**Rationale:** Items 1–6 are safe, isolated changes that can ship immediately. Items 7–9 are interdependent (user IDs must stabilize before scoping queries) and form one atomic workstream.

---

## 8. What Must Be Frozen

**Do not modify these files/features during Phase 1:**

| Frozen Area | Reason |
|-------------|--------|
| `pages/frequencies.tsx`, `pages/rife-frequencies.tsx` | Wellness features — gate/relabel later, not now |
| `pages/meditation.tsx`, `pages/breathe.tsx` | Wellness — no changes until Phase 2 |
| `pages/emotional-medicine.tsx` | Wellness — frozen |
| `pages/radio.tsx` | Non-core — frozen |
| `pages/courses.tsx`, `pages/course-details.tsx` | Non-core — frozen |
| `pages/meal-planner.tsx` | Non-core — frozen |
| `pages/body-map.tsx` | Non-core — frozen |
| `pages/rewards.tsx` | Rewards backend work deferred to Phase 2 |
| `pages/shop.tsx`, `pages/checkout.tsx`, `pages/product-details.tsx` | Shop is stable, don't touch |
| `pages/premium.tsx` | Premium gating deferred to Phase 2 |
| `components/ai/CompanionBot.tsx` | AI features frozen until guardrails approved |
| `data/*` | Static data files — no changes |
| `styles/*` | No visual changes in Phase 1 |
| All `components/home/*` | Home page layout frozen |

**Allowed to change:** Only files listed in Section 4.

---

## 9. Acceptance Criteria

| ID | Criteria | Verification |
|----|----------|-------------|
| **P0-SEC-1** | `localStorage` contains zero auth-related keys (`tibrah_users`, `tibrah_session`, `tibrah_login_attempts`). Login/register works via Firebase Auth only. | Manual test: register → login → logout → check localStorage |
| **P0-SEC-2** | Forging `tibrah_auth` cookie with `{role:"admin"}` in base64 does NOT grant access to `/admin-dashboard`. Middleware rejects unsigned/invalid tokens with redirect to `/login`. | Manual test: set forged cookie → navigate to `/admin-dashboard` → expect redirect |
| **P0-SEC-3** | `PROTECTED_ROUTES`, `ADMIN_ROUTES` defined in exactly one file (`lib/routes.ts`). `middleware.ts` and `Layout.tsx` import from it. No hardcoded route arrays elsewhere. | Code review: grep for hardcoded route arrays |
| **P0-SEC-4** | Login page contains no visible link to admin dashboard. | Visual inspection of `/login` |
| **P0-PRIV-1** | Calling `db.entities.Appointment.list()` as User A returns only User A's appointments. User B's data is never visible. | Test: create appointments for 2 users → verify isolation |
| **P0-CLIN-1** | Clicking "تسجيل الدخول بحساب Google" when Firebase is not configured shows toast "تسجيل الدخول بجوجل غير متوفر حالياً" — no random account created. | Manual test with Firebase env vars removed |
| **P0-CLIN-2** | `my-care.tsx` medications tab shows "لم يتم تحديد خطة علاجية بعد" when user has no medications. No hardcoded phase/progress card visible. | Visual inspection as new user |
| **P0-CLIN-3** | Triage result with level `emergency` shows sticky red banner with emergency number. Banner is not dismissible. | Trigger emergency triage → verify banner |
| **P0-LEGAL-1** | `/privacy` and `/terms` pages load with content. Registration consent "سياسة الخصوصية" links to `/privacy`. | Click link → verify navigation |

---

## 10. Rollback / Fallback Considerations

| Scenario | Fallback |
|----------|----------|
| Firebase Auth fails to initialize at runtime | Show clear error screen: "خطأ في الاتصال بالخادم. تأكد من اتصالك بالإنترنت." Do NOT fall back to localStorage auth. |
| Firebase config is missing from `.env.local` | App shows configuration error at startup. This is intentional — we are removing the silent fallback that created security holes. |
| Signed cookie verification fails in middleware | Allow the request through with `user = null` (treat as unauthenticated). Protected routes will redirect to login. Never silently grant access. |
| User-scoped DB query fails (missing `user_id` field) | Return empty array, not all records. Log warning for debugging. |

---

## 11. Suggested Branch / Workstream Breakdown

```
main
 └── fix/phase1-remediation
      ├── fix/routes-config          ← P0-SEC-3 + P0-SEC-4 (1-2 hours)
      ├── fix/clinical-safety        ← P0-CLIN-1 + P0-CLIN-2 + P0-CLIN-3 (2-3 hours)
      ├── fix/legal-pages            ← P0-LEGAL-1 (1-2 hours)
      ├── fix/firebase-auth-only     ← P0-SEC-1 + P0-SEC-2 (4-6 hours)
      └── fix/user-scoped-data       ← P0-PRIV-1 (3-4 hours)
```

**Merge order:** `routes-config` → `clinical-safety` → `legal-pages` → `firebase-auth-only` → `user-scoped-data`

Each branch is independently shippable except `user-scoped-data` which depends on `firebase-auth-only` for stable user IDs.

**Total estimated effort:** 11–17 hours of focused implementation.

---

*This plan will be updated as implementation progresses. No code changes until explicitly authorized.*
