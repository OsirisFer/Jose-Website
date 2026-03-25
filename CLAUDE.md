# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

**Next.js 16 App Router** single-page psychology practice website with an integrated booking system.

### Page Structure

`src/app/page.js` composes the full site as a sequence of sections (Header → Hero → Profile → Services → TherapeuticApproach → BookingChoice → Contact → ImmediateHelp → Footer). Navigation is hash-based (`#hero`, `#profile`, etc.).

### Styling

- **CSS Modules** per component (e.g., `Header.module.css` beside `Header.js`)
- **`globals.css`** defines design tokens: beige/peach palette, and utility classes like `.btn-primary`, `.section-padding`
- **Fonts**: Young Serif (headings) + Inter (body) via `next/font/google` in `layout.js`
- No Tailwind — use CSS modules and globals

### Booking System Flow

The booking wizard lives in `src/components/Booking/`. State flows through `BookingChoice.js` (modes: `LANDING → FIRST_TIME | CODE_ENTRY → BOOKING`).

**Existing patient path:**
1. Patient code → `POST /api/patient/verify` → validates against Google Sheets, returns `firstInterviewDone`
2. Date selection → `GET /api/availability?date=YYYY-MM-DD` (with `x-patient-code` header) → queries Google Calendar freebusy
3. Slot + contact info → `POST /api/book` → creates Google Calendar event, sends confirmation email via Nodemailer, optionally marks sheet row as completed

**First-time patients** are redirected to WhatsApp/contact (not fully implemented).

### External Integrations (`src/lib/`)

| File | Purpose |
|------|---------|
| `google.js` | Google service account auth, Calendar client setup |
| `sheets.js` | Patient database (code, active status, interview completion) |
| `booking.js` | Client-side fetch helpers for booking API |
| `security.js` | In-memory rate limiting + IP blacklist for API routes |

All Google API credentials are injected via environment variables (service account private key).

### Path Alias

`@/` maps to `src/` — use this for all imports (e.g., `@/components/Header`, `@/lib/google`).
