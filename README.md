# Khouanchay Trading Corporate Website

Development-only corporate website shell and Management application foundation.

## Stack and setup

Next.js App Router, React, TypeScript, CSS variables. No database, external identity provider, or deployment is configured.

1. Run `npm install`.
2. The generated `.env.local` has random local development credentials and is ignored by Git. For a fresh setup, copy `.env.example` to `.env.local` and replace all passwords and `SESSION_SECRET` with unique values.
3. Run `npm run dev` and open `http://localhost:3000/home`.
4. Use the email and password pairs in `.env.local` to test Manager and Admin access. Never use these accounts outside local development.

## Route access

| Routes                                                                       | Guest            | Manager       | Admin |
| ---------------------------------------------------------------------------- | ---------------- | ------------- | ----- |
| `/home`, `/company`, `/business`, `/brands`, `/news`, `/careers`, `/contact` | Yes              | Yes           | Yes   |
| `/management`                                                                | Sign in required | Yes           | Yes   |
| `/management/edit`                                                           | Sign in required | Access denied | Yes   |

`/` redirects to `/home`. Unmatched routes show 404. The App Router allows child pages under each route segment.

The root layout renders one global Navbar on public, login, Management, and status pages. `src/config/navigation.ts` filters menu links through centralized permissions and the authenticated session; Management keeps only secondary navigation inside its content area. Navbar visibility never grants route access. Protected pages check the signed session and permission server-side through `src/auth/access.ts`; future route handlers and mutations must make their own check.

## Languages

The interface supports Lao (`lo`) and English (`en`) at the same URLs. Lao is the default even when the browser requests another language. The shared Navbar selector stores `kcc_locale` for one year (`Path=/`, `SameSite=Lax`), then reloads the current URL so server-rendered and client-rendered text use the same locale. The locale cookie is an interface preference and is separate from the signed development session. Invalid values, including the former Thai preference, fall back to Lao.

`src/i18n/dictionaries/{lo,en}.ts` holds interface copy by feature. English defines the required key shape, and TypeScript checks Lao for missing keys. `getDictionary` also uses English for an empty or missing key at runtime. Server components call `getI18n()`, while client controls read the same server-provided dictionary through `I18nProvider`. Page metadata is localized where supported. Add new UI copy to each dictionary rather than embedding it in components.

Future company profiles, articles, and Management records should keep a stable content ID and store locale-specific fields or translation records keyed by locale, with an editorially approved fallback. Keep that content separate from these interface dictionaries. No multilingual database schema or content backend is configured yet.

Development authentication works only with `NODE_ENV=development` and `DEV_AUTH_ENABLED=true`. The login endpoint verifies request origin and assigns roles from server environment variables, never form input. The signed, HTTP-only session cookie persists across browser and computer restarts. It uses `SameSite=Lax` and automatically uses `Secure` on HTTPS or in production mode.

Session lifetime is configured with `SESSION_IDLE_HOURS`, `SESSION_MAX_DAYS`, and `SESSION_RENEWAL_MINUTES`. The defaults are a 14-day sliding idle window, a fixed 90-day maximum lifetime, and renewal after 12 hours of normal navigation activity. `src/proxy.ts` performs lightweight validation and renewal before page rendering; protected routes still perform their own server-side role checks. Existing valid eight-hour development cookies are upgraded once without asking the user to sign in again. Logout expires the browser cookie immediately.

This development adapter remains stateless. The stable session ID, authentication timestamp, absolute expiry, and rotation counter prepare the token shape for a future server-backed session store, but they do not provide server-side revocation, replay detection, or strong refresh-token rotation today. Production authentication must replace this adapter with server-side session records, revocation and rotation tracking, and additional recent-authentication checks for sensitive Admin actions. Production sign-in remains disabled.

## Demonstration organization chart

`/management` contains the read-only organization chart for Managers and Admins. `/management/edit` adds the Admin-only editor. Both remain protected by the existing server permission checks and use the shared global Navbar.

The initial chart has one protected `President of KCC` root. Positions, people, and active assignments are separate records in `src/features/organization`. Position IDs are stable, all non-root positions require a valid parent, and model validation rejects additional roots, self-reporting, missing parents, and hierarchy cycles. The root position cannot be moved or deleted; its occupant can be replaced under the existing root rules.

Prototype organization edits are saved under `kcc_demo_organization_v1` in browser `localStorage`. Chart-view presentation data is stored separately under `kcc_chart_views_v1`. Existing browsers receive a protected **Executive** view containing their existing positions; this migration does not reset Person, Position, Assignment, biography, image, or reporting data.

Chart-view membership and links are presentation records. A position may belong to several views while retaining one underlying Position, Person, and Assignment record. The chart always draws real reporting edges when both positions are visible; a member whose real parent is outside the selected view is shown as a disconnected branch and flagged to the Admin rather than silently re-parented. Both storage adapters are development-only and are not shared across browsers, devices, or users. A future backend should retain these stable IDs and store effective-dated assignment and reporting history separately.

## Structure

- `src/app`: routes and global states
- `src/auth`: sessions and development credentials
- `src/permissions`: centralized permission model
- `src/config`: permission-aware navigation
- `src/i18n`: locale preference, typed dictionaries, and server/client access
- `src/components/navigation`: shared global Navbar
- `src/components/public`: public footer and content sections
- `src/components/management`: secondary Management workspace navigation
- `src/features/organization`: demonstration data, hierarchy validation, and browser-local persistence
- `src/features/chart-views`: chart-view presentation model, validation, navigation helpers, and browser-local persistence
- `src/components/ui`: status and empty states

## Later phases

Replace all marked placeholder copy, figures, logos, news, jobs, contact details, and organization demonstration records with verified company content in each language. Connect a production identity provider, server-side role source, and shared organization data service before deployment. Define additional Management modules and effective-dated history workflows from later specifications. Enable contact submission only after its destination and privacy handling are defined. Add approved brand assets and deployment configuration separately. No production domain settings are included.
