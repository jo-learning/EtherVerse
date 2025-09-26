This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# EtherVerse

## Countdown Timer Component

We added a reusable `CountdownTimer` component (`components/CountdownTimer.tsx`) used in the trade detail page to show live remaining time until a trade finalizes. When the timer finishes it triggers a `router.refresh()` call to pull updated data.

Basic usage:

```tsx
import CountdownTimer from "@/components/CountdownTimer";

<CountdownTimer
	seconds={90}             // total duration (or use targetTime={Date.now() + 90_000})
	label="Time Left"
	onComplete={() => console.log('Finished!')}
/>;
```

Props:
- `seconds`: number (default 60) – duration if `targetTime` not provided
- `targetTime`: timestamp in ms – absolute end time
- `onComplete`: callback once (fires when it reaches zero)
- `autoRestart`: restarts automatically using the same duration (optional)
- `intervalMs`: update granularity (default 1000ms)
- `label`: small label text
- `render`: custom render function `(remainingSeconds) => ReactNode`

Displayed format auto-switches between `MM:SS` and `H:MM:SS` for long timers. The component is client-only.

## Wallet Data Architecture

User balances now live in a consolidated `userWallet` table (one row per user, columns per symbol). Static metadata (logo, name) comes from `walletsData`.

### API: `/api/userWallet`
GET `/api/userWallet?userId=<email>&symbol=<optional>` returns merged metadata + per-user balance(s).

Example response:
```json
{
	"userId": "alice@example.com",
	"wallets": [
		{ "symbol": "BTC", "name": "BTC Wallet", "logo": "...", "balance": "0", "network": "", "address": "" }
	]
}
```

### Client Helpers

If you add new coins to `userWallet` schema, update `walletsData` and they’ll flow automatically.


### Admin Chat API

Endpoints (cookie `admin_session` required from admin login):

1. Assign / Unassign User (SUPERADMIN only)
	POST `/api/(admin)/chat/assign`
	Body: `{ userId?: string, userEmail?: string, adminId?: string }`
	- Provide `userId` or `userEmail` to identify user.
	- Provide `adminId` (Admin primary id) to assign.
	- Omit `adminId` to unassign (deactivate current active assignment).

2. List Users
	GET `/api/(admin)/chat/users?assigned=true|false`
	- SUPERADMIN: all users, optional filter.
	- ADMIN: only users assigned to them.

3. Fetch Messages
	GET `/api/(admin)/chat/messages?userId=...&cursor=...&limit=50`
	- Pagination: pass last `chat.id` as `cursor` to fetch next page (ordered newest first).
	- Access: SUPERADMIN any user; ADMIN only assigned users.

4. Send Message (admin side)
	POST `/api/(admin)/chat/messages`
	Body: `{ userId: string, message: string }`
	- Creates chat row with `who = 'admin'` and links `adminId`.

Schema additions:
```
model AdminUserAssignment { id String @id @default(uuid()) admin Admin @relation(fields:[adminId], references:[id]) adminId String user User @relation(fields:[userId], references:[id]) userId String createdAt DateTime @default(now()) active Boolean @default(true) @@unique([userId, active], name: "one_active_assignment_per_user") }
model chat { ... admin Admin? @relation(fields:[adminId], references:[id]) adminId String? }
```

Auth helper: `lib/adminAuth.ts` (`requireAdmin(req, { super: true })`).

Notes:
* Only one active assignment per user enforced by unique composite index `(userId, active)`.
* Unassigning retains historical assignment records (active=false) for audit.
* Chats remain even if reassigned; subsequent messages will carry new `adminId`.
