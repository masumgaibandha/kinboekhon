# Kinbo Ekhon: Version 1 Plan

Status: approved. Owner decisions are in section 13.

## 1. Goal

A fast, mobile-first shop where a visitor from a Facebook ad lands on one product page, understands the product in seconds and places an order with a short form. The owner manages orders, payments, products and settings from a small English admin panel.

Version 1 has no cart, no customer accounts and no online payment gateway. One order = one product (with a quantity).

## 2. Packages

Approved for version 1. Anything else needs approval first.

| Package | Why |
|---|---|
| `next`, `react`, `react-dom` | App framework |
| `typescript`, `@types/*` | Types |
| `tailwindcss`, `@tailwindcss/turbopack` | Styling (Tailwind v4, theme in CSS, loaded by Turbopack as set up by create-next-app) |
| `mongoose` | MongoDB models |
| `zod` | Input validation |
| `better-auth` | Admin login: email and password, MongoDB adapter, password hashing, sessions, login rate limit |
| `eslint`, `eslint-config-next` | Lint (comes with create-next-app) |
| `tsx` (dev only) | Runs `scripts/seed-admin.ts` with the project's TypeScript paths |
| `react-hot-toast` | Toast messages in the admin panel (one `AdminToaster` in `src/app/admin/layout.tsx`) |

Better Auth's MongoDB adapter talks to the native MongoDB driver. We reuse the driver that already ships inside `mongoose` (`mongoose.connection.getClient()`), so no extra package. If Better Auth requires `mongodb` as a direct dependency, ask before adding it.

Done without extra packages:
- Cloudinary upload: signed direct upload from the browser, signature made with Node `crypto`. Display through `next/image` with a Cloudinary loader, so Vercel image optimization is not used.
- Turnstile: Cloudflare script tag plus one server `fetch` to verify.
- Meta Pixel: official inline snippet. CAPI: plain `fetch` to the Graph API.
- CSV export: small string builder.
- Rate limiting: MongoDB collection with a TTL index.

## 3. Folder structure

```
kinboekhon/
├─ CLAUDE.md
├─ docs/PLAN.md
├─ .env.example
├─ .gitignore
├─ next.config.ts
├─ public/
│  └─ brand/                     logo-horizontal-white.svg (shop header), logo-horizontal.svg (admin), icon-circle.svg (footer), copied from logos/
├─ scripts/
│  └─ seed-admin.ts              creates or updates the one admin from ADMIN_EMAIL and ADMIN_PASSWORD
└─ src/
   ├─ proxy.ts                   first gate for /admin/* and /api/admin/* (Next.js 16 name for middleware)
   ├─ app/
   │  ├─ layout.tsx              html, font, base metadata
   │  ├─ icon.svg                favicon (logos/kinboekhon-icon.svg)
   │  ├─ globals.css             Tailwind import + brand theme tokens
   │  ├─ not-found.tsx
   │  ├─ (shop)/                 customer site, Bangla
   │  │  ├─ layout.tsx           header, notice strip, footer, Meta Pixel base
   │  │  ├─ page.tsx             home: active products
   │  │  ├─ p/[slug]/page.tsx    product landing page
   │  │  ├─ thank-you/[publicId]/page.tsx
   │  │  ├─ privacy/page.tsx
   │  │  ├─ terms/page.tsx
   │  │  └─ return-policy/page.tsx
   │  ├─ admin/                  admin panel, English
   │  │  ├─ login/page.tsx
   │  │  └─ (panel)/
   │  │     ├─ layout.tsx        sidebar/top nav, session check
   │  │     ├─ page.tsx          dashboard
   │  │     ├─ orders/page.tsx
   │  │     ├─ orders/[id]/page.tsx
   │  │     ├─ orders/actions.ts
   │  │     ├─ payments/page.tsx         advance payments waiting for review
   │  │     ├─ payments/actions.ts
   │  │     ├─ incomplete/page.tsx
   │  │     ├─ incomplete/actions.ts
   │  │     ├─ products/page.tsx
   │  │     ├─ products/new/page.tsx
   │  │     ├─ products/[id]/page.tsx
   │  │     ├─ products/actions.ts
   │  │     ├─ settings/page.tsx
   │  │     └─ settings/actions.ts
   │  └─ api/
   │     ├─ auth/[...all]/route.ts         Better Auth handler
   │     ├─ orders/route.ts               POST create order
   │     ├─ drafts/route.ts               POST save incomplete order
   │     ├─ track/route.ts                POST CAPI for ViewContent, InitiateCheckout
   │     └─ admin/
   │        ├─ upload-signature/route.ts  POST Cloudinary signature
   │        └─ orders-export/route.ts     GET CSV
   ├─ components/
   │  ├─ shop/                   Header, Footer, ProductCard, PriceTag, TrustBadges,
   │  │                          landing/HookSection ... CtaSection, order/OrderForm,
   │  │                          order/PaymentPicker, order/OrderSummary, StickyOrderBar
   │  ├─ admin/                  AdminNav, StatCard, OrdersTable, OrderFilters,
   │  │                          StatusSelect, ProductForm, PaymentReviewCard,
   │  │                          products/ImageUploader, ImageThumb, upload-image.ts
   │  ├─ tracking/               MetaPixel.tsx, pixel.ts (client helpers)
   │  └─ ui/                     Button, Input, Textarea, Select, Badge, CloudinaryImage
   └─ lib/
      ├─ db.ts                   cached Mongoose connection
      ├─ env.ts                  reads and checks env vars with Zod
      ├─ models/                 Product.ts, Order.ts, IncompleteOrder.ts,
      │                          Settings.ts, Counter.ts, RateLimit.ts
      ├─ validation/             order.ts, draft.ts, product.ts, settings.ts (Zod schemas)
      ├─ orders/                 pricing.ts, create-order.ts, order-number.ts, duplicate-check.ts,
      │                          stats.ts, csv.ts
      ├─ phone.ts                normalize + validate BD mobile numbers
      ├─ money.ts                Taka formatting (lakh grouping), Bangla digits, discount percent
      ├─ catalog.ts              cached shop reads ("use cache" + tags); admin reads stay uncached in products.ts
      ├─ dates.ts                Asia/Dhaka day/week/month ranges
      ├─ turnstile.ts            server verify
      ├─ rate-limit.ts
      ├─ request.ts              client IP, user agent, cookie read
      ├─ product-images.ts       image type, formats, size and count limits (browser and server)
      ├─ cloudinary/             sign.ts (upload signature, server only), folder.ts, image-url.ts (URL + next/image loader)
      ├─ auth.ts                 Better Auth server config (MongoDB adapter, email + password, sign-up off)
      ├─ admin-session.ts        requireAdmin() for pages, actions and admin API routes
      └─ meta/
         ├─ capi.ts              send one event to Conversions API
         └─ user-data.ts         hash + build user_data
```

## 4. Database models (MongoDB + Mongoose)

All documents have `createdAt` and `updatedAt` (Mongoose timestamps). Money is whole Taka.

### Product
| Field | Type | Notes |
|---|---|---|
| name | string | Bangla name |
| slug | string, unique | used in `/p/[slug]`, typed by the admin: lowercase English letters, numbers and single hyphens |
| price | number | selling price |
| oldPrice | number or null | optional; if set, must be higher than price; shown struck through; discount % computed |
| images | `{ publicId, width, height }[]` | gallery, first image is the main one, up to 8 |
| shortDescription | string | one or two lines under the headline |
| hook | `{ headline, subheadline }` | first screen |
| problem | `{ title, points: string[] }` | pain points |
| story | `{ title, body }` | short story |
| solution | `{ title, benefits: string[], images: Image[] }` | how the product solves it, up to 6 images |
| proof | `{ title, images: Image[], reviews: { name, text }[] }` | customer screenshots (up to 10), reviews |
| cta | `{ title, text }` | final push above the form |
| active | boolean | only active products are shown or orderable; new products start inactive (the create form's Active box starts unchecked). Saving the edit form writes `active` only when the admin changed the box: the form sends the value it was loaded with (`activeInitial`), and the edit form is keyed on the product's `updatedAt`, so a page restored from navigation history always shows fresh values |
| sortOrder | number | home page order |

Index: `slug` unique, `{ active, sortOrder }`.
Any landing section left empty is simply not rendered.

#### Product images
- Only `{ publicId, width, height }` is stored. URLs are never taken from the browser: `cloudinaryImageUrl()` builds them from the `publicId` as `res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,c_limit,w_<n>/<publicId>`.
- `f_auto` serves AVIF or WebP to browsers that support them, so HEIC uploads display everywhere.
- Upload: the admin uploader gets a signature from `POST /api/admin/upload-signature`, then posts the file straight to Cloudinary. Signed params: `allowed_formats=jpg,jpeg,png,webp,heic`, `folder=<CLOUDINARY_UPLOAD_FOLDER>/products`, `transformation=c_limit,h_2000,w_2000` (stored originals at most 2000 px), `timestamp` (Cloudinary rejects it after 1 hour).
- Limits: 10 MB per file (checked in the browser, Cloudinary free plan also caps images at 10 MB); 8 gallery, 6 solution, 10 proof images (checked in the browser and by Zod).
- On save, Zod checks every `publicId` is inside the product folder.
- Reorder with earlier and later buttons, remove with a button. A removed image stays on Cloudinary (old orders keep its picture).
- Mongoose models replace any model left from an earlier hot reload, so schema changes apply in development without a restart.

### Order
| Field | Type | Notes |
|---|---|---|
| orderNumber | string, unique | human number, e.g. `KE10001`, from Counter |
| publicId | string, unique | random 16 chars, used in thank-you URL so it cannot be guessed |
| product | `{ productId, name, slug, image, price }` | snapshot at order time |
| quantity | number | 1 to 5 (`MAX_QUANTITY`) |
| subtotal | number | price x quantity |
| deliveryArea | `inside_dhaka` \| `outside_dhaka` | |
| deliveryCharge | number | from Settings at order time, before discount |
| deliveryDiscount | number | from Settings, depends on payment option, never more than deliveryCharge |
| total | number | subtotal + deliveryCharge - deliveryDiscount |
| customer | `{ name, phone, address }` | phone as `01XXXXXXXXX` |
| status | `pending` \| `confirmed` \| `shipped` \| `delivered` \| `returned` \| `cancelled` | starts `pending` |
| statusHistory | `{ status, at, note }[]` | every change, for audit |
| payment.option | `cod` \| `advance_delivery` \| `advance_full` | see section 6, "Payment options" |
| payment.method | `cod` \| `bkash` \| `nagad` \| `rocket` \| `bank` | `cod` only with option `cod` |
| payment.status | `cod` \| `submitted` \| `verified` \| `rejected` | `cod` for cash on delivery |
| payment.advanceAmount | number | amount the customer sends now (0 for COD) |
| payment.dueOnDelivery | number | total - advanceAmount, collected by the courier |
| payment.senderNumber | string | mobile wallet number, or sender account for bank |
| payment.transactionId | string | as typed |
| payment.transactionIdNormalized | string | trimmed + uppercase, for duplicate check |
| payment.reviewNote | string | admin note on approve or reject |
| payment.reviewedAt | Date | |
| adminNote | string | free note |
| tracking | `{ ip, userAgent, fbp, fbc, sourceUrl, utmSource, utmCampaign }` | for CAPI and reports |
| capiPurchase | `{ status: pending\|sent\|failed, error }` | result of server Purchase event |

Indexes:
- `orderNumber` unique, `publicId` unique
- `{ "customer.phone": 1, "product.productId": 1, createdAt: -1 }` for the duplicate check
- `{ status: 1, createdAt: -1 }` for lists and dashboard
- `{ "payment.status": 1, createdAt: 1 }` for the payment queue
- `payment.transactionIdNormalized` unique, partial (only when it is a string), so one TxID cannot be used twice

### IncompleteOrder
| Field | Type | Notes |
|---|---|---|
| draftKey | string, unique | random id kept in the visitor's localStorage |
| productId, productName | | |
| name, phone, address | string | whatever was typed (phone saved only when valid) |
| quantity, deliveryArea, paymentMethod | | |
| tracking | `{ ip, userAgent, fbp, fbc, sourceUrl }` | |

TTL index: removed 30 days after `updatedAt`. Deleted as soon as the matching order is placed.

### Settings (single document, `key: "main"`)
| Field | Notes |
|---|---|
| deliveryChargeInsideDhaka | number, default 80 |
| deliveryChargeOutsideDhaka | number, default 150 |
| advanceDeliveryDiscount | number, default 20: delivery discount when the delivery charge is paid in advance |
| fullAdvanceDiscount | number, default 50: delivery discount when the full amount is paid in advance |
| bkash, nagad, rocket | `{ enabled, number, accountType: personal\|agent\|merchant }` |
| bank | `{ enabled, bankName, accountName, accountNumber, branch, routingNumber }` |
| supportPhone | shown in header and thank-you page |
| whatsappNumber | shown to customers |
| duplicateWindowHours | default 24 |

Read through `getSettings()` in `src/lib/settings.ts` (`"use cache"`, tag `settings`). Defaults apply until the first save. `saveSettings` calls `updateTag("settings")`, so the next read is fresh. Mongoose models are registered on `appDb` from `src/lib/db.ts`, which shares the one MongoClient with Better Auth.

### Counter
`{ _id: "order", seq }`. Atomic `$inc` gives the next order number.

### RateLimit
`{ key, count, expiresAt }`. TTL index on `expiresAt`. Key = scope + hashed IP. Used for orders, drafts and tracking.

### Better Auth collections
`user`, `session`, `account`, `verification` and `rateLimit` are created and managed by Better Auth through its MongoDB adapter, in the same database. No Mongoose models for them. Never edit them by hand; the seed script is the only way to create or change the admin.

## 5. Pages

### Customer site (Bangla)
| Route | What it shows |
|---|---|
| `/` | Logo header, notice strip (সারা বাংলাদেশে ক্যাশ অন ডেলিভারি), grid of active products (image, name, price, old price, discount badge, order button) |
| `/p/[slug]` | Landing page, see below |
| `/thank-you/[publicId]` | Thank-you message, order number, product, total, discount, advance paid (with "payment under review" note) and amount due on delivery, support phone |
| `/privacy`, `/terms`, `/return-policy` | Static Bangla text, linked in the footer |

Landing page `/p/[slug]`, top to bottom:
1. **Hook**: headline, subheadline, big main image (swipe gallery if more images), price, old price, discount badge, big "এখনই অর্ডার করুন" button that scrolls to the form, three trust badges (ক্যাশ অন ডেলিভারি, সারা দেশে ডেলিভারি, পণ্য দেখে টাকা দিন).
2. **Problem**: title + list of pain points.
3. **Story**: short paragraph.
4. **Solution**: benefit list with check icons + images.
5. **Proof**: review screenshots + short text reviews.
6. **CTA**: final push text + price again.
7. **Order form** (see below).
8. Sticky bottom bar on mobile with price and order button, hidden when the form is on screen.

Pages are statically generated. Their data comes from `"use cache"` functions with cache tags, and admin saves call `updateTag`, so pages stay fast and still show changes right away.

#### Shop caching
- `getActiveProducts()` in `src/lib/catalog.ts`: `"use cache"`, `cacheTag("products")`, `cacheLife("max")`. Loads card fields only (name, slug, price, old price, first image) of active products, sorted by `sortOrder` then newest.
- `/` reads only cached data and no request data, so `next build` prerenders it as a static page (CDN on Vercel). Visits do not touch the database.
- `createProduct`, `updateProduct` and `setProductActive` call `updateTag("products")` after a successful write. The next visit renders fresh (one database read), later visits are cached again.
- The build reads Atlas, so the Vercel build needs `MONGODB_URI` and Atlas network access.
- M6 adds `product-<slug>` tags for landing pages.

#### Home page
- Slim one-line heading (আমাদের পণ্য), no banner. Bangla message when no product is active.
- Grid: 2 columns on mobile, 3 from 640px, 4 from 1024px.
- Each card is one link to `/p/[slug]`. "অর্ডার করুন" is a button-styled `span` inside the link, never a real `button`.
- The first 2 card images load with `loading="eager"` and `fetchPriority="high"`; the rest are lazy.
- Discount badge: `৩৪% ছাড়`, percent rounded down.

Order form fields:
- নাম (required)
- মোবাইল নম্বর (required, Bangladeshi mobile check, accepts Bangla digits and +880)
- পূর্ণ ঠিকানা (required, textarea)
- পরিমাণ (stepper, 1 to MAX_QUANTITY)
- ডেলিভারি এলাকা: ঢাকার ভিতরে / ঢাকার বাইরে (charges from Settings)
- পেমেন্ট অপশন, three cards, each showing its saving:
  - ক্যাশ অন ডেলিভারি (default, no discount)
  - ডেলিভারি চার্জ অগ্রিম দিন (৳২০ ছাড় on delivery)
  - পুরো টাকা অগ্রিম দিন (৳৫০ ছাড় on delivery)
- For an advance option: choose বিকাশ / নগদ / রকেট / ব্যাংক (only enabled ones), see our account number with a copy button and the exact amount to send, then fill sender number and Transaction ID.
- Live summary: product price x quantity, delivery charge, delivery discount (shown in brand-dark as a minus line), total, "এখন পরিশোধ করবেন" (advance amount) and "ডেলিভারির সময় দেবেন" (due on delivery). Updates instantly when quantity, area or payment option changes.
- Turnstile widget (invisible or managed mode).
- Button: অর্ডার কনফার্ম করুন.

### Admin panel (English)
| Route | What it does |
|---|---|
| `/admin/login` | Email + password |
| `/admin` | Dashboard: period switch (today, this week, this month, all time); orders count; count per status; total sales; delivered value; return %; cancel %; orders per product; incomplete orders count; advance payments waiting |
| `/admin/orders` | Table with search (order number, phone, name), filters (status, payment method, payment status, product, date range), pagination, CSV export button using the same filters |
| `/admin/orders/[id]` | Full order, status change with optional note, status history, admin note, call button (`tel:`) |
| `/admin/payments` | Queue of advance payments with `submitted` status, oldest first: payment option, advance amount expected, method, sender number, TxID, customer. Approve or Reject, each with a note |
| `/admin/incomplete` | Incomplete orders newest first, with call button and delete |
| `/admin/products` | List with main image thumbnail (placeholder when none), name and edit link opening the edit page, active toggle, view link |
| `/admin/products/new`, `/admin/products/[id]` | Product form: basics, price, old price, images (upload, reorder, remove), landing sections, active |
| `/admin/settings` | Delivery charges, advance payment discounts, payment accounts, support phone, duplicate window |

Dashboard definitions (dates in Asia/Dhaka):
- Total sales = sum of `total` for orders not `cancelled`.
- Delivered value = sum of `total` for `delivered` orders.
- Return % = returned / (delivered + returned).
- Cancel % = cancelled / all orders in the period.

## 6. API routes and Server Actions

Customer-facing writes are Route Handlers (JSON). Admin writes are Server Actions.

| Route | Method | Purpose | Protection |
|---|---|---|---|
| `/api/orders` | POST | Create order | Same-origin check, Turnstile, rate limit, Zod, duplicate check |
| `/api/drafts` | POST | Upsert incomplete order by `draftKey` | Same-origin check, rate limit, Zod, size limit |
| `/api/track` | POST | Send ViewContent or InitiateCheckout to CAPI with the browser's event_id | Same-origin check, rate limit, allow-list of event names |
| `/api/auth/[...all]` | GET/POST | Better Auth handler (sign in, sign out, session) | Sign-up disabled, login rate limited |
| `/api/admin/upload-signature` | POST | Signed Cloudinary upload params | `proxy.ts` + `requireAdmin()` |
| `/api/admin/orders-export` | GET | CSV of filtered orders (UTF-8 with BOM so Excel shows Bangla) | `proxy.ts` + `requireAdmin()` |

Login: the `/admin/login` form posts to `/api/auth/sign-in/email`. It must go through this route, because Better Auth only applies its rate limit to requests through its handler, not to direct server API calls. Logout is a Server Action in the panel nav; Better Auth's `nextCookies` plugin clears the cookie.

Server Actions (each calls `requireAdmin()` first):
- orders: `updateOrderStatus`, `saveAdminNote`
- payments: `approvePayment`, `rejectPayment`
- products: `createProduct`, `updateProduct`, `setProductActive` (no delete in v1, deactivate instead)
- incomplete: `deleteIncompleteOrder`
- settings: `saveSettings`

### Create order flow (`POST /api/orders`)
1. Check origin, content type, body size.
2. Rate limit by IP (example: 5 orders per 10 minutes, 20 per day).
3. Verify Turnstile token with Cloudflare.
4. Validate body with Zod. Normalize phone. Reject if invalid.
5. Load product (must be active) and Settings. Price and delivery charge always come from the database, never from the browser.
6. Duplicate check: same phone + same product within `duplicateWindowHours` and status not `cancelled`. If found, return the existing order number with a Bangla message instead of creating a new one.
7. If advance payment: method must be enabled, TxID required, TxID must not already exist.
8. Calculate delivery discount, total, advance amount and due on delivery on the server (see "Payment options").
9. Get next order number, create order, delete the matching incomplete order.
10. Respond with `publicId`. Browser goes to `/thank-you/[publicId]`.
11. After the response (`after()` from `next/server`), send Purchase to CAPI and save the result in `capiPurchase`.

### Payment options
One function in `src/lib/orders/pricing.ts` does this math. The order form uses it for the live summary and the server uses it again to save the order.

| Option | Delivery discount | Paid now (advance) | Due on delivery |
|---|---|---|---|
| `cod` | 0 | 0 | total |
| `advance_delivery` | `advanceDeliveryDiscount` (default 20) | deliveryCharge - discount | subtotal |
| `advance_full` | `fullAdvanceDiscount` (default 50) | total | 0 |

- total = subtotal + deliveryCharge - discount.
- The discount is capped at the delivery charge, so it is never negative.
- Example inside Dhaka, product ৳৮৯০, quantity 1, delivery ৳৮০:
  - COD: total ৳৯৭০, pay now ৳০, due ৳৯৭০.
  - Delivery advance: total ৳৯৫০, pay now ৳৬০, due ৳৮৯০.
  - Full advance: total ৳৯২০, pay now ৳৯২০, due ৳০.

### Payment verification
- Approve: atomic update only when `payment.status` is `submitted`. Sets `verified`, note, time, and moves order `pending` to `confirmed`.
- Reject: same atomic guard. Sets `rejected` and note. Order stays `pending` so the owner can call the customer, then confirm as COD or cancel.
- A second click on an already reviewed payment changes nothing and shows "Already reviewed".

## 7. Facebook tracking

Browser Pixel and Conversions API send the same events with the same `event_id`, so Meta counts each event once.

| Event | Browser (Pixel) | Server (CAPI) | event_id |
|---|---|---|---|
| PageView | every page load | no | none |
| ViewContent | landing page load | `/api/track` | `vc_<random>` made in the browser |
| InitiateCheckout | first time the visitor types in the order form | `/api/track` | `ic_<draftKey>` |
| Purchase | thank-you page load | from the order route, after the order is saved | `purchase_<orderNumber>` |

- Pixel base snippet is rendered once in the shop layout with `next/script`. Admin pages never load it.
- `custom_data`: `content_ids` (product id), `content_name`, `content_type: product`, `currency: BDT`, `value`, `num_items`.
- `user_data` on the server: hashed phone (`880` + 10 digits), hashed first name, hashed `external_id` (phone), `country: bd` hashed, client IP, user agent, `_fbp` and `_fbc` cookies as they are (not hashed). If `_fbc` is missing but the URL had `fbclid`, build `fb.1.<time>.<fbclid>`.
- CAPI request has an 8 second timeout. Errors are recorded by code only; response bodies are never logged.
- `META_TEST_EVENT_CODE` env var sends events to Events Manager "Test events" while testing.
- No cookie consent banner: the audience is in Bangladesh (owner confirmed).
- Purchase fires when the order is placed, for COD and advance orders alike (owner decision). `value` is the order total after discount.

## 8. Fake order protection

| Layer | How |
|---|---|
| Phone check | Normalize (Bangla digits to English, strip spaces, `+880`/`880` prefix to `0`) then must match `^01[3-9]\d{8}$` |
| Duplicate order | Same phone + product inside 24 hours (editable in Settings) is blocked; the customer sees the old order number |
| Bot protection | Cloudflare Turnstile on the order form, verified on the server |
| Rate limit | Per IP, stored in MongoDB with auto-expiry |
| Server pricing | Price, delivery charge and total always recalculated on the server |
| Unique TxID | One Transaction ID can be used on one order only |

## 9. Security

### Admin login (Better Auth)
- Email and password only, stored by Better Auth in MongoDB through its MongoDB adapter. Better Auth hashes the password.
- Public sign-up is disabled (`emailAndPassword.disableSignUp`). No sign-up page, no sign-up link.
- Exactly one admin account. `scripts/seed-admin.ts` reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env.local` and creates the admin through Better Auth's own internal API (so the password hash matches). Run again: it updates the password of the same account. It never creates a second user.
- Run with `npm run seed:admin`. `ADMIN_PASSWORD` is only needed on the machine that runs the seed, never on Vercel.
- Admin password: at least 12 characters, checked by the seed script and by Better Auth.
- Session cookie: httpOnly, secure in production, `SameSite=Lax`, 7 day expiry (Better Auth defaults).
- Login rate limit: Better Auth's built-in limiter with database storage (works on Vercel serverless), on in all environments, 5 sign-in attempts per minute per IP.
- Database name is set in code (`kinboekhon` in `src/lib/db.ts`), so the connection string does not need one.

### Protecting the admin
Three layers, every one required:
1. `proxy.ts`: for `/admin/*` (except `/admin/login`) with no session cookie, redirect to `/admin/login`. For `/api/admin/*` with no session cookie, return 401. This is only a fast first check of the cookie, not proof.
2. `requireAdmin()` in `src/lib/admin-session.ts`: validates the session with Better Auth on the server. Called by the `(panel)` layout, by every admin page that reads data and as the first line of every admin Server Action. Admin Route Handlers call `requireAdminApi()` from the same file, which runs the same check and returns a 401 response instead of redirecting. Pages redirect to login; Route Handlers and actions return 401 or "Not authorized" and do nothing else.
3. Sign-up disabled, so a valid session can only belong to the seeded admin.

With Cache Components on, session checks read request headers, so admin pages render dynamically inside `<Suspense>`. Follow `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.

### Other
- Admin pages: `noindex`, no Pixel.
- Admin pages: `noindex`, no Pixel.
- Thank-you page uses a random `publicId` and shows no address or phone.
- All customer JSON responses use `Cache-Control: no-store`.

## 10. Environment variables (`.env.example`)

```
MONGODB_URI=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=https://kinboekhon.com
ADMIN_EMAIL=          # seed script only
ADMIN_PASSWORD=       # seed script only, never set on Vercel
NEXT_PUBLIC_SITE_URL=https://kinboekhon.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=kinboekhon
NEXT_PUBLIC_META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=
META_TEST_EVENT_CODE=
```

## 11. Build order

Each module ends with a browser test. Do not start the next module until the test passes.

| # | Module | Browser test |
|---|---|---|
| M0 | **Project setup**: create-next-app (TypeScript, Tailwind, App Router, `src/`), brand tokens, Hind Siliguri, logos in `public/brand`, shop layout (header, notice strip, footer), placeholder home, `.env.example` | Open `/` on a 375px wide view: branded header, Bangla text in Hind Siliguri, footer in #2B2B2B |
| M1 | **Admin login**: Mongo connection (`src/lib/db.ts`), Better Auth config (MongoDB adapter, email + password, sign-up off, database rate limit), `/api/auth/[...all]`, seed script, `proxy.ts`, `requireAdmin()`, `/admin/login`, empty panel layout with nav and logout | Run `npm run seed:admin`; `/admin` redirects to login; wrong password fails; right password opens panel; logout works; a direct sign-up request to `/api/auth/sign-up/email` is refused; `/api/admin/orders-export` without login returns 401 |
| M2 | **Settings**: Settings model, settings page | Save delivery charges and bKash number, reload, values stay |
| M3 | **Products (text)**: Product model, list, create, edit, active toggle, landing section fields | Create a product, edit it, toggle inactive, see changes in the list |
| M4 | **Product images**: Cloudinary signed upload, reorder, remove, image URL helper | Upload 3 images, change order, reload, images show from Cloudinary |
| M5 | **Home page**: active product grid | Active product shows, inactive one does not |
| M6 | **Landing page**: all sections, gallery, price block, trust badges, sticky bar, form layout (not submitting yet) | Open `/p/slug` on mobile view; order button scrolls to form; empty sections are hidden |
| M7 | **COD order**: phone helper, Zod schema, Counter, Order model, `/api/orders` (without Turnstile and rate limit), thank-you page | Place a COD order, land on thank-you page with order number; wrong phone shows Bangla error |
| M8 | **Admin orders**: list, search, filters, detail, status change with history, admin note | Find the order by phone, change status to Confirmed, history shows it |
| M9 | **Advance payment**: three payment options with discounts, `pricing.ts`, live summary, method picker, account display with copy, TxID fields, server checks, `/admin/payments` approve and reject | Each option shows the right discount, total, pay now and due amounts; change discounts in Settings and see the form update; place a bKash order, approve it, order turns Confirmed; reuse same TxID, see error |
| M10 | **Fake order protection**: duplicate check, Turnstile, rate limit | Same phone + product twice shows old order number; Turnstile test "always fails" key blocks order; 6th quick order is rate limited |
| M11 | **Incomplete orders**: autosave draft on field blur, `/api/drafts`, admin list, delete on order | Type name and phone, close tab, see it in `/admin/incomplete`; place order, draft disappears |
| M12 | **Dashboard**: stats with period switch | Numbers match a hand count of test orders |
| M13 | **CSV export** | Download CSV with current filters, open in Excel, Bangla shows correctly |
| M14 | **Meta Pixel + CAPI**: base pixel, ViewContent, InitiateCheckout, Purchase, `/api/track` | Meta Pixel Helper shows events with event IDs; Events Manager Test events shows browser and server events deduplicated |
| M15 | **Policy pages + polish**: Bangla drafts of privacy, terms and return policy for owner review (return within 3 days, only for damaged, wrong or defective products), 404, metadata, favicon, Open Graph image | Owner approves the policy text; footer links work; sharing a product link on Facebook shows image and title |
| M16 | **Launch**: Vercel project, env vars, Atlas network access, run `npm run seed:admin` once against the production database, domain, Turnstile hostname, Meta domain verification, Lighthouse mobile check | Live site at kinboekhon.com, real test order end to end, then delete it |

## 12. Not in version 1

Cart, customer accounts, coupons, product variants, stock tracking, courier API (Steadfast, Pathao), SMS, email notifications, online payment gateway, multiple admins, blog, search.

## 13. Owner decisions

1. Payment options: Cash on Delivery (no discount), delivery charge in advance (৳20 off delivery), full amount in advance (৳50 off delivery). Discount and final amount shown clearly before submit. Both discounts editable in Settings.
2. Purchase event fires when the order is placed.
3. Duplicate order is blocked and the old order number is shown. Window: 24 hours.
4. Landing URL: `/p/product-slug`.
5. Maximum quantity per order: 5.
6. Order number format: `KE10001` (first order is KE10001).
7. Logo: SVG files in `logos/`. Favicon uses `kinboekhon-icon.svg`. Shop header logo: see decision 24.
8. Policy pages: drafted in Bangla for owner review. Return window: 3 days, only for damaged, wrong or defective products.
9. No cookie consent banner.
10. Admin login email: set in `ADMIN_EMAIL` in `.env.local` (kept out of the repo).
11. Default delivery charges: inside Dhaka ৳80, outside Dhaka ৳150. Both editable in Settings.
12. Admin login uses Better Auth (not Auth.js): email and password, MongoDB adapter, public sign-up disabled, one admin created by a seed script from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
13. Products are never deleted, only deactivated.
14. Product slug is typed by hand (lowercase English letters, numbers, hyphens, unique). The edit page warns when the slug is changed, because it breaks old links and ads.
15. Old price is optional; if given, it must be higher than the price. Prices are whole taka.
16. Product form lists: problem points and benefits are one per line; reviews are add/remove rows (name and text).
17. The "View" link from the admin product list to `/p/[slug]` is added in M6.
18. Hosting region: MongoDB Atlas stays in AWS us-east-1 (Virginia) and the Vercel function region stays `iad1`, so server-to-database trips are about 1 ms. Shop speed for Bangladeshi visitors comes from cached pages, not from moving regions.
19. No Better Auth session cookie cache for now. Admin pages accept the extra database trips.
20. Product images: three lists (gallery, solution, proof), at most 8, 6 and 10 images.
21. Image files: jpg, jpeg, png, webp and heic, up to 10 MB each. Delivered as WebP or AVIF through `f_auto`.
22. A removed image is kept on Cloudinary, never deleted.
23. Each image stores only `{ publicId, width, height }`. URLs are built in code from the `publicId`.
24. Shop header is orange (`brand`, #F85606) with the white horizontal logo. `public/brand/logo-horizontal-white.svg` is made from `logos/kinboekhon-logo-horizontal-white.svg` with the orange background removed and the viewBox cropped tightly to the artwork; the original in `logos/` is unchanged. It is shown 28px tall, so it matches the old header logo. Header text and icons are white. The notice strip and footer stay as they are and must read well under the orange header.
25. Home page: slim one-line heading, no banner.
26. Discount percent is rounded down.
27. The whole product card is one link to `/p/[slug]`; the order "button" inside it is a styled `span`.
28. Product grid: 2, 3 and 4 columns; the first 2 images load with high priority.
