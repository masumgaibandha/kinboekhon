# Kinbo Ekhon (কিনবো এখন)

Bangladeshi online shop at kinboekhon.com. Slogan: দরকার যখন, কিনবো এখন.
Customers come from Facebook ads, mostly on mobile phones. Many product categories, sourced from China.

The full version 1 plan is in `docs/PLAN.md`. Read it before starting any module. Update it when a decision changes.

## Tech stack

Next.js (App Router) + TypeScript, Tailwind CSS, MongoDB Atlas + Mongoose, Zod, Auth.js, Cloudflare Turnstile, Cloudinary, Meta Pixel + Conversions API. Hosted on Vercel.

## Rules

### Code
- Keep code simple and clean. Small files, clear names.
- One file does one job. Split a file when it grows past about 150 lines.
- Prefer Server Components. Add `"use client"` only where interaction needs it.
- Validate every input on the server with Zod, even if the browser already checked it.
- Use TypeScript strictly. No `any`.
- Comments only where truly needed, one line each.
- Never write history comments such as "ported from", "copied from reference", "changed in step 3" or "old version".

### Scope
- Build only what is asked. No extra features, options or abstractions "for later".
- Ask before adding any new npm package. The approved list is in `docs/PLAN.md`.
- Build one module at a time, in the order of `docs/PLAN.md`. Each module must work in the browser before the next starts.

### Reference folder
- Never edit, move, delete, import from or commit anything in `_reference/`.
- `_reference/` is for reading ideas only. Do not copy its structure, naming or comments.

### Language
- All customer-facing text is in Bangla.
- All admin panel text is in English.
- Never use em dashes (the long dash) in any text: code, UI copy, comments, docs or commits. Use a comma, colon, full stop or normal hyphen instead.

### Secrets
- Never put secrets, keys, passwords or account tokens in code.
- Secrets live in `.env.local`, which is never committed.
- Keep `.env.example` up to date with every variable name and an empty or dummy value.
- Only variables the browser truly needs get the `NEXT_PUBLIC_` prefix.

## Brand

Use these exactly. They are defined once as Tailwind theme tokens in `src/app/globals.css`. Never hard-code hex values in components.

| Token | Hex | Use |
|---|---|---|
| `brand` | #F85606 | Buttons, price, header, icons |
| `brand-dark` | #B33F00 | Small accent text, product name highlight, discount text |
| `brand-light` | #FFF0E8 | Notice strip, discount badge background |
| `heading` | #111111 | Headings, important text |
| `body` | #212121 | Normal text, forms, totals |
| `desc` | #4A4A4A | Product description, helper text |
| `muted` | #757575 | Old price (strike-through), hints |
| `page` | #F5F5F5 | Page background |
| `card` | #FFFFFF | Sections, cards, form |
| `line` | #EEEEEE | Card borders |
| `line-strong` | #D6D6D6 | Input borders, dividers |
| `footer` | #2B2B2B | Footer background |

- Font: Hind Siliguri via `next/font/google`, weights 400, 500, 600, 700.
- Logos: use the files from `logos/` (copied into `public/brand/`). Do not redraw or recolor the logo.
- Design: mobile first, premium, fast, built to sell. Big product images, clear price, clear order button, COD and delivery info, short order form.
- Show prices with the Taka sign and Bangla digits on the customer site (৳৮৯০). Admin uses English digits.

## Conventions

- Phone numbers are stored as 11 digits: `01XXXXXXXXX`.
- Money is stored as whole Taka integers. No decimals.
- Dates are stored in UTC and shown in Asia/Dhaka time.
- Every admin page, Server Action and admin API route checks the session on the server, not only in `proxy.ts`.
