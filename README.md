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

`src/permissions` holds grants and access decisions. `src/config/navigation.ts` uses permissions for visibility only. Protected pages check the signed session and permission server-side through `src/auth/access.ts`; future route handlers and mutations must make their own check.

Development authentication works only with `NODE_ENV=development` and `DEV_AUTH_ENABLED=true`. The login endpoint verifies request origin and assigns roles from server environment variables, never form input. Cookies are HTTP-only, SameSite=Lax, signed, and expire after eight hours. Production authentication must replace this adapter before deployment. Production sign-in is disabled.

## Structure

- `src/app`: routes and global states
- `src/auth`: sessions and development credentials
- `src/permissions`: centralized permission model
- `src/config`: permission-aware navigation
- `src/components/public`: corporate site layout
- `src/components/management`: internal workspace layout
- `src/components/ui`: status and empty states

## Later phases

Replace all marked placeholder copy, figures, logos, news, jobs, and contact details with verified company content. Connect a production identity provider and server-side role source before deployment. Define Management modules and editing workflows from the next specification. Enable contact submission only after its destination and privacy handling are defined. Add multilingual content and approved brand assets. Add deployment configuration separately. No production domain settings are included.
