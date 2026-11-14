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
│  ├─ seed-admin.ts              creates or updates the one admin from ADMIN_EMAIL and ADMIN_PASSWORD
│  ├─ build-locations.ts         builds src/data/bd-locations.json from the bangladesh-geocode JSON files
│  └─ location-thanas.ts         CMP (Chattogram) city thana list used by build-locations.ts
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
   │  │     ├─ page.tsx          dashboard (`?period=today|week|month|all`)
   │  │     ├─ orders/page.tsx                 list, search, filters, pagination
   │  │     ├─ orders/[orderNumber]/page.tsx   detail: /admin/orders/KE10001
   │  │     ├─ orders/actions.ts               updateOrderStatus, saveAdminNote, updateOrderCustomer
   │  │     ├─ payments/page.tsx         advance payments waiting for review
   │  │     ├─ payments/actions.ts       reviewPayment (approve or reject)
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
   │  │                          order/PaymentSection, PaymentOptionPicker, PaymentAccountBox, CopyButton,
   │  │                          order/OrderSummary, OrderSubmit, ContactFields, use-payment-choice.ts, use-turnstile.ts,
   │  │                          use-draft.ts, StickyOrderBar
   │  ├─ admin/                  AdminNav, dashboard/StatCard, PeriodSwitch, ProductStatsTable, ProductForm, payments/PaymentReviewCard, ReviewForm,
   │  │                          products/ImageUploader, ImageThumb, upload-image.ts,
   │  │                          orders/OrdersTable, OrderFilters, Pagination, StatusBadge, OrderCard,
   │  │                          OrderCustomer, CustomerEditor, CustomerEditForm, AdminLocationFields,
   │  │                          OrderAmounts, OrderPayment, OrderTracking, SwitchToCodForm, StatusForm, StatusHistory, AdminNoteForm,
   │  │                          use-admin-action.ts, incomplete/DraftCard, DraftActions
   │  ├─ tracking/               MetaPixel.tsx, pixel.ts (client helpers)
   │  └─ ui/                     Button, Input, Textarea, Select, Badge, CloudinaryImage, Money (Taka icon + amount), TakaIcon
   └─ lib/
      ├─ db.ts                   cached Mongoose connection
      ├─ env.ts                  reads and checks env vars with Zod
      ├─ models/                 Product.ts, Order.ts, IncompleteOrder.ts,
      │                          Settings.ts, Counter.ts, RateLimit.ts, order-document.ts (Order types)
      ├─ validation/             order.ts, location-fields.ts (shared location check), admin-order.ts,
      │                          order-payment.ts, order-filters.ts, dashboard-period.ts, draft.ts, product.ts, settings.ts (Zod schemas)
      ├─ orders/                 enums.ts, limits.ts (MAX_QUANTITY), pricing.ts, create-order.ts,
      │                          order-number.ts, thank-you.ts, status.ts (labels, allowed moves),
      │                          admin-order-list.ts, admin-order-detail.ts, change-status.ts (status + admin note),
      │                          edit-customer.ts, payment-methods.ts (enabled accounts, labels), transaction-id.ts,
      │                          payment-queue.ts, payment-review.ts (approve, reject, switch to COD),
      │                          duplicate-check.ts, stats.ts (dashboard numbers), csv.ts
      ├─ drafts/                 save-draft.ts (save, delete on order), draft-place.ts, admin-draft-list.ts
      ├─ admin-result.ts         result type and helpers for admin Server Actions
      ├─ phone.ts                normalize + validate BD mobile numbers
      ├─ locations/              types.ts (location types), dhaka.ts (city corporations, city group of a district), resolve.ts (server check + Bangla names),
      │                          format.ts (location as admin text)
      ├─ catalog.ts              cached shop reads ("use cache" + tags); admin reads stay uncached in products.ts
      ├─ dates.ts                Asia/Dhaka date format, day ranges, week start (Saturday) and month start
      ├─ turnstile.ts            server verify (passed, failed, unverified)
      ├─ rate-limit.ts           fixed-window counters in MongoDB
      ├─ rate-limit.ts
      ├─ request.ts              same-origin check, client IP, user agent, keyed IP hash
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
| costs | `{ chinaPrice, weightGrams, shippingPerKg, agentFee, packaging, courier, codPercent, returnPercent, adCost, targetProfit }` | price calculator inputs (P1a), admin only. `toProductInput()` leaves them out, so the shop never reads them. A product without `costs` starts the form with China price and weight empty and the rates from Settings `costDefaults` |

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
| discount | number | `fullAdvanceDiscount` from Settings for a full advance payment, 0 for COD, never more than subtotal |
| total | number | subtotal - discount |
| customer | `{ name, phone, address, location }` | phone as `01XXXXXXXXX`; `address` is the typed part (house, road, area); `location` always has `divisionId, division, districtId, district`, plus `kind`. `kind: dhaka_city` (a Dhaka city corporation was chosen): `cityCorporation` (`dncc` | `dscc`), `cityCorporationName`. `kind: outside_dhaka` (any upazila or city thana, also Dhaka district's upazilas): `upazilaId, upazila, upazilaType: upazila | city_thana`. Bangla names, for courier booking later |
| status | `pending` \| `confirmed` \| `shipped` \| `delivered` \| `returned` \| `cancelled` | starts `pending` |
| statusHistory | `{ kind, status, at, note, outcome }[]` | every change, for audit. `kind: status` for a status change (the first entry is the order being placed), `kind: edit` for a customer edit, `kind: payment` for a payment review or a switch to cash on delivery and `kind: call` for a call (P1b, with `outcome`). For the last three, `status` is the status at that moment and `note` says what happened |
| payment.option | `cod` \| `advance_full` | see section 6, "Payment options" |
| payment.method | `cod` \| `bkash` \| `nagad` \| `rocket` \| `bank` | `cod` only with option `cod` |
| payment.status | `cod` \| `submitted` \| `verified` \| `rejected` | `cod` for cash on delivery |
| payment.advanceAmount | number | amount the customer sends now (0 for COD) |
| payment.dueOnDelivery | number | total - advanceAmount, collected by the courier |
| payment.senderNumber | string | mobile wallet number, or sender account for bank |
| payment.transactionId | string | as typed |
| payment.transactionIdNormalized | string | uppercase with every space removed, for the duplicate check; the admin panel shows this form |
| payment.reviewNote | string | admin note on approve or reject |
| payment.reviewedAt | Date | |
| adminNote | string | free note |
| lastCall | `{ outcome, at, note }` | the newest call (P1b), for the orders list column and filter. `outcome`: `agreed_to_wait` \| `declined` \| `no_answer` \| `call_later` |
| tracking | `{ ip, ipHash, userAgent, turnstile, fbp, fbc, sourceUrl, utmSource, utmCampaign }` | `ip` is kept for CAPI (P1c); the admin sees only `ipHash` (HMAC with `IP_HASH_SECRET`). `turnstile`: `passed` or `unverified` |
| capiPurchase | `{ status: pending\|sent\|failed, error }` | result of server Purchase event |

Indexes:
- `orderNumber` unique, `publicId` unique
- `{ "customer.phone": 1, "product.productId": 1, createdAt: -1 }` for the duplicate check
- `{ status: 1, createdAt: -1 }` for lists and dashboard
- `{ createdAt: -1 }` for the unfiltered admin list, newest first
- `{ "tracking.ipHash": 1, createdAt: -1 }` for the admin tracking box
- `{ "payment.status": 1, createdAt: 1 }` for the payment queue
- `{ "lastCall.outcome": 1, createdAt: -1 }` for the latest call filter
- `payment.transactionIdNormalized` unique, partial (only when it is a string), so one TxID cannot be used twice

### IncompleteOrder
| Field | Type | Notes |
|---|---|---|
| draftKey | string, unique | 16 random bytes as hex, one per product, kept in the visitor's localStorage |
| productId, productName | | name read from the database |
| name, phone, address | string | whatever was typed; phone is always a valid normalized number |
| quantity | | |
| divisionId, districtId, upazilaId | string | ids as chosen so far, "" when not chosen; `upazilaId` may be `dncc` or `dscc` |
| paymentOption, paymentMethod | | never the sender number or Transaction ID |
| contactedAt | Date or null | set by "Mark contacted" |
| tracking | `{ ipHash, userAgent, sourceUrl }` | hashed IP only (decision 72); `sourceUrl` from the Referer header |

TTL index: removed 30 days after `updatedAt` (the same index sorts the admin list). Index `{ phone, productId }` for the delete on order. Deleted as soon as the matching order is placed.

### Settings (single document, `key: "main"`)
| Field | Notes |
|---|---|
| fullAdvanceDiscount | number, default 50: taken off the order total when the full amount is paid in advance |
| bkash, nagad, rocket | `{ enabled, number, accountType: personal\|merchant }`; agent accounts are not offered (decision 63) |
| bank | `{ enabled, bankName, accountName, accountNumber, branch, routingNumber }` |
| supportPhone | shown in header and thank-you page |
| whatsappNumber | shown to customers |
| duplicateWindowHours | default 24 |
| costDefaults | `{ shippingPerKg: 710, agentFee: 0, packaging: 10, courier: 120, codPercent: 1, returnPercent: 15, adCost: 250, targetProfit: 150 }`: price calculator starting values (P1a), admin only. `getSettings()` leaves them out; the admin reads them with `getCostDefaults()` (uncached) |

Read through `getSettings()` in `src/lib/settings.ts` (`"use cache"`, tag `settings`). Defaults apply until the first save. `saveSettings` calls `updateTag("settings")`, so the next read is fresh. Mongoose models are registered on `appDb` from `src/lib/db.ts`, which shares the one MongoClient with Better Auth.

### Counter
`{ _id: "order", seq }`. Atomic `$inc` gives the next order number.

### RateLimit
`{ key, count, expiresAt }` in the `ratelimits` collection (separate from Better Auth's `rateLimit`). TTL index on `expiresAt`. Key = scope + window name + hashed IP + window start (fixed windows), counted with one atomic upsert. Used for orders, later drafts and tracking.

### Better Auth collections
`user`, `session`, `account`, `verification` and `rateLimit` are created and managed by Better Auth through its MongoDB adapter, in the same database. No Mongoose models for them. Never edit them by hand; the seed script is the only way to create or change the admin.

## 5. Pages

### Customer site (Bangla)
| Route | What it shows |
|---|---|
| `/` | Logo header, notice strip (সারা দেশে ফ্রি ডেলিভারি, ক্যাশ অন ডেলিভারি), grid of active products (image, name, price, order button) |
| `/p/[slug]` | Landing page, see below |
| `/thank-you/[publicId]` | Thank-you message, order number, product, delivery free, total, discount, advance paid (with "payment under review" note) and amount due on delivery, support phone |
| `/privacy`, `/terms`, `/return-policy` | Static Bangla text, linked in the footer |

Landing page `/p/[slug]`, top to bottom. Visual reference: `docs/design/landing-design-d.html` (design D), rebuilt with Tailwind and brand tokens; its placeholder header is not used. Single column, `max-w-xl`, white sections with a 10px gap on the grey page:
1. **Hook**: headline, subheadline, big main image (swipe gallery if more images), price with a "সারা দেশে ফ্রি ডেলিভারি" tag next to it, big "এখনই অর্ডার করুন" button that scrolls to the form, three trust badges (ক্যাশ অন ডেলিভারি, সারা দেশে ফ্রি ডেলিভারি, পণ্য দেখে টাকা দিন).
2. **Problem**: title + list of pain points.
3. **Story**: short paragraph.
4. **Solution**: benefit list with check icons + images.
5. **Proof**: review screenshots + short text reviews, then an "এখনই অর্ডার করুন" button that scrolls to the form (only when the proof section shows).
6. **CTA**: final push text + price again (with the free delivery tag).
7. **Order form** (see below).
8. Sticky bottom bar on mobile with price and order button, hidden when the form is on screen or scrolled past.

Address location data:
- `src/data/bd-locations.json` (8 divisions, 64 districts, 500 upazilas, 16 Chattogram city thanas; about 30 KB, 10 KB compressed) is built by `scripts/build-locations.ts` from github.com/nuhil/bangladesh-geocode (MIT, Copyright (c) 2014 Nuhil Mehdy; notice in `src/data/NOTICE-bangladesh-geocode.txt`). Names are stored in Unicode NFC.
- Checked against bangladesh.gov.bd/views/upazila-list (November 2026, the portal states 500 upazilas): added চন্দ্রগঞ্জ, মোকামতলা, ভূল্লী, রুহিয়া, শায়েস্তাগঞ্জ, দক্ষিণ গফরগাঁও; renamed দক্ষিণ সুনামগঞ্জ to শান্তিগঞ্জ; official spellings for 12 more.
- Chattogram city thanas: the 16 CMP thanas on cmp.gov.bd (Bangla as on the site), ids `cmp-01` ... When Chattogram district is chosen they show first as a group ("চট্টগ্রাম সিটির থানা"), then "উপজেলা". When Dhaka district is chosen the third list shows "সিটি কর্পোরেশন" first (ঢাকা উত্তর সিটি কর্পোরেশন, ঢাকা দক্ষিণ সিটি কর্পোরেশন, values `dncc` and `dscc`), then "উপজেলা" (সাভার, কেরাণীগঞ্জ, ধামরাই, দোহার, নবাবগঞ্জ). `cityGroupOf()` in `src/lib/locations/dhaka.ts` gives the shop and admin forms this first group.
- Everything is sorted in Bangla alphabetical order; city thana groups stay first.
- The file is a separate chunk, loaded with `import()` when the order form comes within 800px of the screen; the selects show "লোড হচ্ছে..." until then.
- Every customer picks বিভাগ, জেলা, উপজেলা / থানা as three selects (decision 79). There is no ঢাকার ভিতরে / ঢাকার বাইরে picker. Changing the division clears the district and the third list; changing the district clears the third list.

Landing details:
- Gallery: 1:1 slides, `object-contain` on white so nothing is cropped, CSS scroll-snap swipe with dots. The first image is preloaded.
- Problem points use a small muted dot; solution benefits use an orange check.
- Solution and proof images keep their own shape (no crop).
- Order form in M6: name, phone, address, quantity 1 to 5, delivery area (ঢাকার ভিতরে / ঢাকার বাইরে) and a live summary from the Settings charges. The confirm button is visible but disabled until M7.
- Unavailable page (inactive or unknown slug): Bangla message, home button, up to 4 other active products.
- Header: white phone icon with `supportPhone` as a `tel:` link, hidden when empty. Footer: phone (`tel:`) and WhatsApp (`https://wa.me/880...`), each hidden when empty. Numbers shown in English digits (decision 41).

Pages are statically generated. Their data comes from `"use cache"` functions with cache tags, and admin saves call `updateTag`, so pages stay fast and still show changes right away.

#### Shop caching
- `getActiveProducts()` in `src/lib/catalog.ts`: `"use cache"`, `cacheTag("products")`, `cacheLife("max")`. Loads card fields only (name, slug, price, first image) of active products, sorted by `sortOrder` then newest.
- `/` reads only cached data and no request data, so `next build` prerenders it as a static page (CDN on Vercel). Visits do not touch the database.
- `createProduct`, `updateProduct` and `setProductActive` call `updateTag("products")` after a successful write. The next visit renders fresh (one database read), later visits are cached again.
- The build reads Atlas, so the Vercel build needs `MONGODB_URI` and Atlas network access.
- Landing pages: `getProductBySlug()` (`"use cache"`, `cacheTag("product-<slug>")`, `cacheLife("max")`) returns an active product or `null`. `generateStaticParams` lists active slugs (`getActiveSlugs()`, tag `products`), so `/p/<slug>` is prerendered. When no product is active it returns the placeholder slug `_none` (Cache Components needs at least one param), which renders the unavailable page.
- `createProduct` refreshes `products` and `product-<new slug>`; `updateProduct` refreshes `products` plus the old and new slug tags (it reads the old slug in the same write); `setProductActive` refreshes `products` and `product-<slug>`. `saveSettings` refreshes `settings`, which also covers the header, footer and the payment accounts and discount on landing pages.
- An inactive or unknown slug renders `p/[slug]/not-found.tsx`. With Cache Components the first request after a change is streamed after the shell, so it returns `200` with `<meta name="robots" content="noindex">`; the result is cached and later requests return a real `404`.

#### Home page
- Slim one-line heading (আমাদের পণ্য), no banner. Bangla message when no product is active.
- Grid: 2 columns on mobile, 3 from 640px, 4 from 1024px.
- Each card is one link to `/p/[slug]`. "অর্ডার করুন" is a button-styled `span` inside the link, never a real `button`.
- The first 2 card images load with `loading="eager"` and `fetchPriority="high"`; the rest are lazy.

Order form fields:
- নাম (required)
- মোবাইল নম্বর (required, Bangladeshi mobile check, accepts Bangla digits and +880)
- ঠিকানা (বাড়ি, রাস্তা, এলাকা) (required, textarea, 3 to 200 characters)
- পরিমাণ (stepper, 1 to MAX_QUANTITY)
- বিভাগ, জেলা, উপজেলা / থানা (Dhaka: city corporations first)
- পেমেন্ট অপশন, two cards, each showing its total:
  - ক্যাশ অন ডেলিভারি (default, no discount)
  - পুরো টাকা অগ্রিম (৳50 ছাড় off the total)
- For an advance option: choose বিকাশ / নগদ / রকেট / ব্যাংক (only enabled ones), see our account number with a copy button and the exact amount to send, then fill sender number and Transaction ID.
- Live summary: product price x quantity, "ডেলিভারি চার্জ: ফ্রি", "অগ্রিম পেমেন্ট ছাড়" (brand-dark minus line, full advance only), total, "এখন অগ্রিম পাঠাবেন" (advance amount) and "ডেলিভারির সময় দেবেন" (due on delivery). Updates instantly when quantity or payment option changes.
- Turnstile widget (invisible or managed mode).
- Button: অর্ডার কনফার্ম করুন.

### Admin panel (English)
| Route | What it does |
|---|---|
| `/admin/login` | Email + password |
| `/admin` | Dashboard: period switch (today, this week, this month, all time); orders count; count per status; total sales; delivered value; return %; cancel %; orders per product; incomplete orders count; advance payments waiting |
| `/admin/orders` | Table with search (order number, phone, name), filters (status, product, date range; payment method and payment status come in M9; latest call outcome in P1b), a latest call column, 25 per page newest first, CSV export button using the same filters (added in P2h) |
| `/admin/orders/[orderNumber]` | Full order, status change with optional note, status history, admin note, call button (`tel:`), call outcome form (P1b), customer edit while pending or confirmed |
| `/admin/payments` | Queue of advance payments with `submitted` status, oldest first: payment option, advance amount expected, method, sender number, TxID, customer. Approve or Reject, each with a note |
| `/admin/incomplete` | Incomplete orders, newest 100 by last change: phone, name, product and quantity, payment option, place, address, last typed time; Call (`tel:`), Mark contacted (badge with the time), Delete |
| `/admin/products` | List with main image thumbnail (placeholder when none), name and edit link opening the edit page, active toggle, view link |
| `/admin/products/new`, `/admin/products/[id]` | Product form: basics, price, price calculator, images (upload, reorder, remove), landing sections, active |
| `/admin/settings` | Full advance discount, payment accounts, support phone, duplicate window, price calculator defaults (no delivery charges) |

Price calculator (P1a), below Basics in the product form. Inputs: China price (taka), weight (grams), air shipping (taka per kg), agent fee, packaging, courier charge, COD charge %, return rate %, ad cost per order, target profit. Money inputs are whole taka; percents allow one decimal (COD 0 to 20, return 0 to 90); China price and weight may be empty (0). Results update live as the admin types, including the Price field:
- Landed cost = China price + weight / 1000 x shipping per kg + agent fee.
- Profit per order = (1 - return %) x (price - price x COD % - landed cost) - courier - packaging - ad cost. Returned orders earn nothing but still pay courier, packaging and ads.
- Suggested price = the lowest price ending in 90 at or above ((target profit + courier + packaging + ad cost) / (1 - return %) + landed cost) / (1 - COD %).
- Results show rounded to whole taka (`price-calculator.ts` keeps exact values). Inputs are saved with the product (`costs`) and validated by Zod on the server. The suggested price is never written to Price on its own.

Dashboard definitions (dates in Asia/Dhaka, decision 80):
- Period: today (from 00:00 today), this week (from 00:00 on the latest Saturday, today when it is Saturday), this month (from 00:00 on the 1st), all time. The period is in the URL (`?period=`); a missing or bad value shows today. Every count and amount on the page covers orders placed in the period, except the two live counts below.
- Total sales = sum of `total` for orders not `cancelled` and not `returned`.
- Delivered value = sum of `total` for `delivered` orders.
- Return % = returned / (delivered + returned).
- Cancel % = cancelled / all orders in the period. A percent with nothing to divide by shows "-".
- Orders per product: orders count and sales (same rule as total sales) per product, grouped by `product.productId` with the newest snapshot name, most orders first.
- Incomplete orders and advance payments waiting (`payment.status: submitted`) are live counts, not filtered by period. Each card links to `/admin/incomplete` or `/admin/payments`.

## 6. API routes and Server Actions

Customer-facing writes are Route Handlers (JSON). Admin writes are Server Actions.

| Route | Method | Purpose | Protection |
|---|---|---|---|
| `/api/orders` | POST | Create order | Same-origin check, Turnstile, rate limit, Zod, duplicate check |
| `/api/drafts` | POST | Upsert incomplete order by `draftKey` | Rate limit (60 per 10 minutes per hashed IP, every request), same-origin check, Zod, 4 KB size limit |
| `/api/track` | POST | Send ViewContent or InitiateCheckout to CAPI with the browser's event_id | Same-origin check, rate limit, allow-list of event names |
| `/api/auth/[...all]` | GET/POST | Better Auth handler (sign in, sign out, session) | Sign-up disabled, login rate limited |
| `/api/admin/upload-signature` | POST | Signed Cloudinary upload params | `proxy.ts` + `requireAdmin()` |
| `/api/admin/orders-export` | GET | CSV of filtered orders (UTF-8 with BOM so Excel shows Bangla) | `proxy.ts` + `requireAdmin()` |

Login: the `/admin/login` form posts to `/api/auth/sign-in/email`. It must go through this route, because Better Auth only applies its rate limit to requests through its handler, not to direct server API calls. Logout is a Server Action in the panel nav; Better Auth's `nextCookies` plugin clears the cookie.

Server Actions (each calls `requireAdmin()` first):
- orders: `updateOrderStatus`, `saveAdminNote`, `updateOrderCustomer`
- payments: `reviewPayment` (approve or reject); orders: `switchOrderToCod`
- products: `createProduct`, `updateProduct`, `setProductActive` (no delete in v1, deactivate instead)
- incomplete: `markDraftContacted`, `deleteIncompleteOrder`
- settings: `saveSettings`

### Create order flow (`POST /api/orders`)
1. Check origin, content type, body size.
2. Rate limits by hashed IP (decision 64): every request counts toward 30 per 10 minutes; the order limit (10 per 10 minutes, 50 per day) counts only placed orders and failed Turnstile checks.
3. Verify Turnstile token with Cloudflare.
4. Validate body with Zod. Normalize phone. Reject if invalid.
5. Load product (must be active) and Settings. Price and discount always come from the database, never from the browser.
6. Duplicate check: same phone + same product within `duplicateWindowHours` and status not `cancelled`. If found, return the existing order number with a Bangla message instead of creating a new one.
7. If advance payment: method must be enabled, TxID required, TxID must not already exist.
8. Calculate discount, total, advance amount and due on delivery on the server (see "Payment options").
9. Get next order number, create order, delete the matching incomplete order.
10. Respond with `publicId`. Browser goes to `/thank-you/[publicId]`.

Built in M7 (steps 1, 4, 5, 8 for COD, 9 without the draft delete, 10):
- Request checks: `Origin` must equal the site origin (`src/lib/request.ts`), `Content-Type: application/json`, body at most 4 KB. Every response is `no-store`. Errors: 403, 415, 413, 400 (with Bangla `fieldErrors`), 409 (product not active), 500.
- `src/lib/validation/order.ts` (Bangla messages): name 2 to 60 characters, phone normalized then `^01[3-9]\d{8}$`, typed address 3 to 200 characters, quantity 1 to `MAX_QUANTITY`, `productId` an ObjectId. Location (`src/lib/locations/resolve.ts`): division, district and the third id must exist and belong together; the third id may be `dncc` or `dscc` only when the district is ঢাকা; anything else is refused with a Bangla field error. Unknown keys (for example a price) are dropped. An error on a field without its own message on the form (quantity, product) becomes the main message.
- The product is read fresh from the database (must be active), the discount comes from `getSettings()`, and `calculateOrder()` in `pricing.ts` computes the amounts; the landing page summary uses the same function.
- Order number: atomic `$inc` on Counter `{ _id: "order" }`, `KE` + (10000 + seq). Deleting the counter document restarts at KE10001.
- `publicId`: 12 random bytes as base64url (16 characters).
- The order saves a product snapshot (id, name, slug, main image `publicId`, price). `tracking` stays empty until M10 and P1c.
- The form blocks a second submit while one is running (a ref, so a double tap sends one request), keeps typed values on errors, and clears a field's error when it is edited.
- Thank-you page: rendered per request (`await connection()` inside `<Suspense>`), `noindex`. Shows the order number, product and quantity, price, "ডেলিভারি চার্জ: ফ্রি", discount and advance when present, total, amount due on delivery, a call line with the support phone when set, and "আরও পণ্য দেখুন". It never shows the address or phone.
11. After the response (`after()` from `next/server`), send Purchase to CAPI and save the result in `capiPurchase`.

### Fake order protection (M10)
- `/api/orders` order of checks: the request limit (every request, 30 per 10 minutes, 429 with the same message as below), origin, content type, size (now 8 KB, room for the token), then the order limit, checked without counting (429 "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।"), then Turnstile (403 "নিরাপত্তা যাচাই সফল হয়নি। পেজটি আবার লোড করে চেষ্টা করুন।"), then Zod, product, the duplicate and phone checks, payment checks, create. A failed Turnstile check and a placed order each count one hit on the order limit; form errors, duplicate and phone blocks don't.
- Turnstile widget: Cloudflare's script loads only when the order form comes within 800px of the screen, rendered with `appearance: "interaction-only"` (invisible unless Cloudflare needs a click), `size: "flexible"`, `language: "bn"`, `action: "order"`, `refresh-expired: "auto"`. The token is ready while the customer types; on submit the form waits up to 15 seconds for it. A token works once, so the widget resets after every refused submit. If the script can't load, the form shows "নিরাপত্তা যাচাই লোড হয়নি। পেজটি আবার লোড করে চেষ্টা করুন।" and sends nothing.
- Server verify: `siteverify` with the secret and the customer's IP, 5 second timeout. No token or a refused token: the order is refused. Cloudflare unreachable (network error, timeout, non-2xx, `internal-error`): the order is accepted and saved with `tracking.turnstile: "unverified"`.
- Duplicate: same phone + same product inside `duplicateWindowHours`, not cancelled: "আপনি গত 24 ঘণ্টায় এই পণ্যটি অর্ডার করেছেন। আপনার অর্ডার নম্বর KE10001।" plus "কিছু বদলাতে চাইলে কল করুন <support phone>।" when a support phone is set.
- Phone limit: a 4th order from one phone in 24 hours: "এই নম্বর থেকে গত 24 ঘণ্টায় 3টি অর্ডার হয়েছে। আরও অর্ডার করতে চাইলে পরে চেষ্টা করুন।" plus "জরুরি হলে কল করুন <support phone>।".
- Local development uses Cloudflare's test keys (site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA` always pass; secret `2x0000000000000000000000000000000AA` always fails). Real keys: Cloudflare dashboard, Turnstile, Add widget, hostname kinboekhon.com, mode Managed; set them on Vercel in P1d.
- Admin order detail: a Tracking card with the Turnstile result, other orders from the same hashed address in the 24 hours before this order, the first 12 characters of the hash and the user agent.

### Incomplete orders (M11)
- The browser saves a draft on every field blur inside the order form and once when the page is hidden (`visibilitychange`, `fetch` with `keepalive`), so closing the tab still saves. Nothing is sent until the phone is a valid mobile number; an unchanged draft is not sent again.
- `draftKey`: one per product in localStorage (`ke_draft_<productId>`); if storage is blocked, a key for this page only. The order request sends it too. After the order is placed the key is removed, so the next visit starts a new draft.
- `/api/drafts` replies with an empty body (204, or 400, 403, 413, 415, 429, 500); the form never shows these. The product must be active. A draft is not saved when the same phone already ordered this product inside `duplicateWindowHours`, so a blur that arrives after the order cannot bring the draft back.
- Placing an order deletes the draft with its `draftKey` and every draft with the same phone and product. A failed delete never fails the order.
- Admin: "Mark contacted" sets `contactedAt` without changing `updatedAt`, so the list order and the 30 day expiry still follow the customer's last change. Delete removes the draft at once, without a confirm step.

### Admin orders (M8)
- List: `/admin/orders`, 25 per page, newest first. Filters live in the URL (a `next/form` GET form), so a filtered list can be reloaded or bookmarked. A bad value in the URL drops only that filter.
- Search, one box: `KE10001` or `10001` finds the order number; digits starting with 0 find phones by prefix (Bangla digits and `+880` work, via `normalizePhone`); anything else finds names (contains, ignoring case).
- Date range: `from` and `to` are Dhaka calendar days, both included (`src/lib/dates.ts`, Dhaka is always UTC+6).
- Area column: Dhaka North or Dhaka South for a city corporation, otherwise "upazila, district".
- Detail: `/admin/orders/KE10001`. Customer (with a Call button `tel:`), product and amounts, status, admin note, history (newest first).
- Status moves (`src/lib/orders/status.ts`): pending to confirmed or cancelled; confirmed to shipped or cancelled; shipped to delivered or returned; cancelled can be reopened to pending; delivered and returned are final. The form lists only allowed moves; Zod refuses any other move. Every change pushes a history entry with the optional note.
- Stale protection: the status form sends the status it was loaded with and the update matches on it (`findOneAndUpdate({ orderNumber, status: from })`). The note form sends the note it was loaded with. The customer form sends all loaded values (`initialValues`) and writes only changed fields, each matched against its loaded value. Any miss shows "This order was changed since you opened it. Reload the page." Every form is keyed on the order's `updatedAt`, and each action calls `revalidatePath("/admin", "layout")` after a change, which re-renders the open page and drops the admin pages the browser kept, so the orders list and dashboard are fresh on the next click.
- Customer edit: name, phone, typed address and location, with the same rules as the shop form (division, district, then city corporation, upazila or thana) and the same server check (`src/lib/validation/location-fields.ts`), with English messages. Allowed only while pending or confirmed. A location change changes no amount (decision 76). Each save pushes a `kind: edit` history entry listing old and new values.

### Call outcome (P1b)
- Order detail: a "Call outcome" card with four choices (Agreed to wait, Declined, No answer, Call later), an optional note (up to 300 characters) and "Save call". Zod checks the outcome on the server.
- Each save pushes a `kind: call` history entry (outcome, time, note, status at that moment) and sets `lastCall` to the same values. Calls are only added, never edited. History shows "Call: No answer" with the time and note.
- Status from the call (`src/lib/orders/call-outcome.ts`): Agreed to wait moves the order to Confirmed, Declined to Cancelled, in the same guarded update, with a `kind: status` history entry "After call: <outcome>". No answer and Call later keep the status. Only allowed moves apply (`canMoveStatus`), so a shipped, delivered, returned or cancelled order keeps its status; an advance payment waiting for review is confirmed only by approving it (the call is saved with a warning).
- Orders list: a "Latest call" column (outcome badge and time, or "Not called"; No answer and Call later stand out with the brand border) and a "Latest call" filter (`call` in the URL) that matches only the newest call of each order.

### Payment options
One function in `src/lib/orders/pricing.ts` does this math. The order form uses it for the live summary and the server uses it again to save the order.

Delivery is free everywhere; its cost is built into the product price (decision 76).

| Option | Discount | Paid now (advance) | Due on delivery |
|---|---|---|---|
| `cod` | 0 | 0 | total |
| `advance_full` | `fullAdvanceDiscount` (default 50) | total | 0 |

- subtotal = price x quantity; total = subtotal - discount.
- The discount is capped at the subtotal, so the total is never negative. When the total would be 0 the full advance option is hidden.
- Example, product ৳850, quantity 2:
  - COD: total ৳1,700, pay now ৳0, due ৳1,700.
  - Full advance: total ৳1,650, pay now ৳1,650, due ৳0.

### Payment verification
- Approve: atomic update only when `payment.status` is `submitted`. Sets `verified`, note, time, and moves order `pending` to `confirmed`.
- Reject: same atomic guard. Sets `rejected` and note. Order stays `pending` so the owner can call the customer, then confirm as COD or cancel.
- A second click on an already reviewed payment changes nothing and shows "Already reviewed".

### Advance payment (M9)
- `calculateOrder(price, quantity, option, fullAdvanceDiscount)` in `pricing.ts` does all money math for the form summary, the saved order and the switch to cash on delivery. The discount comes from Settings (`fullAdvanceDiscount`).
- Shop form: after the quantity, a "পেমেন্ট" picker with two cards (ক্যাশ অন ডেলিভারি, পুরো টাকা অগ্রিম), each with its discount and total. An advance option whose pay-now amount is 0 is hidden. Choosing an advance option picks the first enabled method; the customer can pick another. The account box shows the number and account type (wallets: পার্সোনাল means সেন্ড মানি, মার্চেন্ট means পেমেন্ট) or the bank details, then "পাঠাবেন" with the exact pay-now amount. The number, bank account number and amount each have a copy button (`navigator.clipboard`). Then the sender number (bank: sender account number, 6 to 20 digits; Rocket may have 12 digits) and the Transaction ID. The summary adds the discount, "এখন অগ্রিম পাঠাবেন" and "ডেলিভারির সময় দেবেন".
- Only methods enabled in Settings with a number (bank: with an account number) are shown (`enabledAccounts()`). With none, the form shows no payment picker: cash on delivery only, as before.
- Server (`/api/orders`): Zod checks the option, method, sender number and Transaction ID (`src/lib/validation/order-payment.ts`, Bangla messages). `createOrder()` then refuses a method that is no longer enabled (error on the method field) and a Transaction ID already used (checked first; the unique partial index on `payment.transactionIdNormalized` catches a race). The order saves `payment.status: submitted` with the sender and both Transaction ID forms. The thank-you page says the advance will be checked before the order is confirmed.
- `/admin/payments`: one card per `submitted` payment, oldest first, with expected advance, method, option, sender, Transaction ID, order total, customer and product, an optional note, and Approve and Reject. Approve on a pending order also confirms it in the same guarded update and adds a `payment` and a `status` history entry. Approve on an order that is no longer pending only verifies the payment and shows a warning toast. Reject keeps the status and adds a `payment` history entry.
- Order detail: a Payment card (option, payment status, method, advance, sender, Transaction ID, review time and note). While a payment waits, the status form hides Confirmed and the server refuses Pending to Confirmed ("Approve or reject the advance payment first."); Cancel stays allowed. After a rejected advance payment, "Switch to cash on delivery" sets the option, method and payment status to `cod`, removes the discount, sets pay-now to 0 and due to the new total, and adds a `payment` history entry.
- Orders list: payment method and payment status filters.

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
| Rate limit | Per hashed IP, stored in MongoDB with auto-expiry: every request to `/api/orders` counts toward 30 per 10 minutes; placed orders and failed Turnstile checks count toward 10 per 10 minutes and 50 per day (form errors don't count, because many customers share one address behind their mobile operator) |
| Phone limit | At most 3 orders per phone in 24 hours, all products and statuses |
| Server pricing | Price, discount and total always recalculated on the server |
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
- Database: Atlas in AWS ap-south-1 (Mumbai); Vercel functions in `bom1` (`vercel.json`). See decision 56.

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
IP_HASH_SECRET=        # random secret for hashing customer IPs
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
| M0 | **Project setup**: create-next-app (TypeScript, Tailwind, App Router, `src/`), brand tokens, system font stack (decision 40), logos in `public/brand`, shop layout (header, notice strip, footer), placeholder home, `.env.example` | Open `/` on a 375px wide view: branded header, Bangla text in Hind Siliguri, footer in #2B2B2B |
| M1 | **Admin login**: Mongo connection (`src/lib/db.ts`), Better Auth config (MongoDB adapter, email + password, sign-up off, database rate limit), `/api/auth/[...all]`, seed script, `proxy.ts`, `requireAdmin()`, `/admin/login`, empty panel layout with nav and logout | Run `npm run seed:admin`; `/admin` redirects to login; wrong password fails; right password opens panel; logout works; a direct sign-up request to `/api/auth/sign-up/email` is refused; `/api/admin/orders-export` without login returns 401 |
| M2 | **Settings**: Settings model, settings page | Save delivery charges and bKash number, reload, values stay |
| M3 | **Products (text)**: Product model, list, create, edit, active toggle, landing section fields | Create a product, edit it, toggle inactive, see changes in the list |
| M4 | **Product images**: Cloudinary signed upload, reorder, remove, image URL helper | Upload 3 images, change order, reload, images show from Cloudinary |
| M5 | **Home page**: active product grid | Active product shows, inactive one does not |
| M6 | **Landing page**: all sections, gallery, price block, trust badges, sticky bar, form layout (not submitting yet) | Open `/p/slug` on mobile view; order button scrolls to form; empty sections are hidden |
| M7 | **COD order**: phone helper, Zod schema, Counter, Order model, `/api/orders` (without Turnstile and rate limit), thank-you page | Place a COD order, land on thank-you page with order number; wrong phone shows Bangla error |
| M8 | **Admin orders**: list, search, filters, detail, status change with history, admin note, customer edit (decision 55) | Find the order by phone, change status to Confirmed, history shows it |
| M9 | **Advance payment**: three payment options with discounts, `pricing.ts`, live summary, method picker, account display with copy, TxID fields, server checks, `/admin/payments` approve and reject | Each option shows the right discount, total, pay now and due amounts; change discounts in Settings and see the form update; place a bKash order, approve it, order turns Confirmed; reuse same TxID, see error |
| M10 | **Fake order protection**: duplicate check, Turnstile, rate limit | Same phone + product twice shows old order number; Turnstile test "always fails" key blocks order; 6th quick order is rate limited |
| M11 | **Incomplete orders**: autosave draft on field blur, `/api/drafts`, admin list, delete on order | Type name and phone, close tab, see it in `/admin/incomplete`; place order, draft disappears |
| M12 | **Dashboard**: stats with period switch | Numbers match a hand count of test orders |

Modules M0 to M12 are done. The rest is built in three phases (decision 81), one module at a time in this order. Each module still ends with a browser test. Exact fields, formulas and screens are planned at the start of each module and written here before coding.

### Phase 1: before the test campaign

| # | Module | Browser test |
|---|---|---|
| P1a | **Price calculator** in the admin product form: China price, weight, air shipping rate per kg, agent fee, packaging, courier charge, COD charge %, return rate %, ad cost per order, target profit. Shows the suggested selling price and the profit per order. Default rates live in Settings. Delivery stays free for the customer (decision 76), so the courier charge is a cost inside the price | Enter test values: suggested price and profit match a hand calculation; change a default in Settings and the form starts with the new value |
| P1b | **Call outcome** on each order: agreed to wait, declined, no answer, call later, each saved with a note and the time. Agreed to wait confirms, declined cancels (not once shipped). Orders list filter by call outcome | Save "No answer" with a note on an order, see it with the time on the order page; filter the list by it and see only that order |
| P1c | **Meta Pixel + CAPI** (was M14): base pixel, ViewContent, InitiateCheckout, Purchase, `/api/track` | Meta Pixel Helper shows events with event IDs; Events Manager Test events shows browser and server events deduplicated |
| P1d | **Launch** (was M16): Vercel project, env vars, Atlas network access, run `npm run seed:admin` once against the production database, domain kinboekhon.com, Turnstile hostname, Meta domain verification, Lighthouse mobile check | Live site at kinboekhon.com, real test order end to end, then delete it |
| P1e | **Policy pages** (moved from P3d, decision 82): Bangla `/privacy`, `/terms` and `/return-policy`, linked in the footer. Return policy: return within 3 days, only for damaged, wrong or defective products. Drafts go to the owner for review | Owner approves the text; the three footer links open each page on mobile |

### Phase 2: while the stock ships (about 20 days)

Services not chosen yet (fraud check, SMS) are picked by the owner at the start of their module. Any new package still needs approval.

| # | Module | Browser test |
|---|---|---|
| P2a | **Customer CRM** by phone number: all orders, total spent, delivered and returned counts, call history, notes, tags, blacklist | Open a customer from an order: their orders and totals match a hand count; add a note and a tag; a blacklisted phone is flagged on its next order |
| P2b | **Steadfast API**: book an order, save the tracking code, sync the delivery status | Book a test order, see the tracking code on the order; a status change at Steadfast shows on the order after sync |
| P2c | **Fraud check** by phone before confirming (service to be chosen) | Check a phone from the order page and see the result before confirming |
| P2d | **Profit report**: profit per order and daily ad spend entry, with a daily profit report | Enter a day's ad spend: the report's profit matches a hand calculation for that day's orders |
| P2e | **Stock count** with a low-stock alert | Set stock and a low-stock level; place orders until the alert shows |
| P2f | **COD payout reconciliation** | Enter a courier payout: matched orders are marked paid, missing or wrong amounts are listed |
| P2g | **Order SMS** (provider to be chosen) | Place a test order and receive the SMS on a test phone |
| P2h | **Print and export** (CSV export was M13): invoice and parcel label print, CSV export with the current filters, courier CSV export | Print an invoice and a label; download both CSVs and open them in Excel with Bangla shown correctly |

### Phase 3: after launch

| # | Module | Browser test |
|---|---|---|
| P3a | **Repeat-customer promo codes** | A code works once for a returning phone and is refused for a new one |
| P3b | **Blog and info pages** | Publish a post and an info page, open both on mobile |
| P3c | **Editable notices and offers** | Change the notice strip text in the admin and see it on the shop |
| P3d | **SEO and share previews** (was M15): 404, metadata, favicon, Open Graph image. The policy pages moved to P1e | Sharing a product link on Facebook shows image and title |
| P3e | **Staff logins**: changes the one-admin rule in CLAUDE.md when built | A staff user logs in and sees only what their role allows |

## 12. Not planned

Cart, customer accounts, product variants, Pathao courier API, email notifications, online payment gateway, search.

## 13. Owner decisions

1. Replaced by decision 77: payment options are cash on delivery and full advance.
2. Purchase event fires when the order is placed.
3. Duplicate order is blocked and the old order number is shown. Window: 24 hours.
4. Landing URL: `/p/product-slug`.
5. Maximum quantity per order: 5.
6. Order number format: `KE10001` (first order is KE10001).
7. Logo: SVG files in `logos/`. Favicon uses `kinboekhon-icon.svg`. Shop header logo: see decision 24.
8. Policy pages: drafted in Bangla for owner review. Return window: 3 days, only for damaged, wrong or defective products.
9. No cookie consent banner.
10. Admin login email: set in `ADMIN_EMAIL` in `.env.local` (kept out of the repo).
11. Replaced by decision 76: delivery is free, there are no delivery charges.
12. Admin login uses Better Auth (not Auth.js): email and password, MongoDB adapter, public sign-up disabled, one admin created by a seed script from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
13. Products are never deleted, only deactivated.
14. Product slug is typed by hand (lowercase English letters, numbers, hyphens, unique). The edit page warns when the slug is changed, because it breaks old links and ads.
15. Prices are whole taka. (The optional old price was removed by decision 43.)
16. Product form lists: problem points and benefits are one per line; reviews are add/remove rows (name and text).
17. The "View" link from the admin product list to `/p/[slug]` is added in M6.
18. Replaced by decision 56: the database moved from Virginia to Mumbai.
19. No Better Auth session cookie cache for now. Admin pages accept the extra database trips.
20. Product images: three lists (gallery, solution, proof), at most 8, 6 and 10 images.
21. Image files: jpg, jpeg, png, webp and heic, up to 10 MB each. Delivered as WebP or AVIF through `f_auto`.
22. A removed image is kept on Cloudinary, never deleted.
23. Each image stores only `{ publicId, width, height }`. URLs are built in code from the `publicId`.
24. Shop header is orange (`brand`, #F85606) with the white horizontal logo. `public/brand/logo-horizontal-white.svg` is made from `logos/kinboekhon-logo-horizontal-white.svg` with the orange background removed and the viewBox cropped tightly to the artwork; the original in `logos/` is unchanged. It is shown 28px tall, so it matches the old header logo. Header text and icons are white. The notice strip and footer stay as they are and must read well under the orange header.
25. Home page: slim one-line heading, no banner.
26. Replaced by decision 43: there is no discount percent.
27. The whole product card is one link to `/p/[slug]`; the order "button" inside it is a styled `span`.
28. Product grid: 2, 3 and 4 columns; the first 2 images load with high priority.
29. Landing page design: design D (`docs/design/landing-design-d.html`), with our orange header.
30. M6 order form: name, phone, address, quantity, delivery area and live summary; submitting starts in M7.
31. Header phone and footer phone + WhatsApp links from Settings, each hidden when empty.
32. Gallery images are 1:1 with `object-contain` on white.
33. Unavailable product page shows a home button and up to 4 other active products.
34. An extra order button follows the proof section.
35. Unavailable product pages keep the Cache Components behaviour: the first request after a change returns 200 with noindex, later requests a cached 404. No slug check in proxy.ts, so landing pages stay on the CDN.
36. The duplicate block, rate limit and Turnstile stay in M10.
37. Order form limits: name 2 to 60 characters. The typed address is 3 to 200 characters (decision 44).
38. The thank-you page links to more products. (Its delivery area and charge line was removed by decision 76.)
39. Order `tracking` is filled in M10 (IP, user agent) and P1c (fbp, fbc, UTM).
40. Font follows Daraz: no web font (Hind Siliguri removed). Shop and admin use the system font stack system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", "Kohinoor Bangla", "Nirmala UI", sans-serif. The logo SVGs are paths only, so they do not depend on the site font.
41. Numbers use English digits, like Daraz: prices (৳ 850, ৳ 1,290), quantities, phone numbers, order numbers (KE10001) and percentages, also inside Bangla error messages. All other customer text stays Bangla. The phone field keeps accepting Bangla digits.
42. Money is shown with a Taka icon instead of the "৳" character, which looks weak in system fonts. `TakaIcon` (`src/components/ui/TakaIcon.tsx`) is the taka stroke of Heroicons `currency-bangladeshi` (MIT) without the circle, with the viewBox cropped to the stroke (outline 8.25, 7.214, 7.5 × 10.037 plus half the stroke on each side). It is 0.71em tall, the measured digit height of the system font, sits on the text baseline, and takes the text color. `Money` (`src/components/ui/Money.tsx`) puts a 0.15em gap before the amount (English digits, lakh grouping: 850, 1,290). Stroke 1.3 for regular text and 2.8 for bold prices, matching the digit stems at weight 400 and 700. The icon is `aria-hidden` with a visually hidden "টাকা". Every on-screen amount in the shop and admin uses `Money`; plain text that cannot show an icon (page title, meta description, Zod messages) writes "৳".
43. No old price anywhere: no struck-through price, no discount badge, no "% ছাড়". The field is removed from the admin form and list, the Zod schema and the Mongoose schema, and the stored `oldPrice` values were unset in the database. The delivery discount for advance payment (M9) is a different thing and stays.
44. Address: the customer picks বিভাগ, জেলা and উপজেলা / থানা from dropdowns and types the rest (3 to 200 characters). The order saves the location with Bangla names and ids.
45. Replaced by decision 48: Dhaka city thanas are not used in the shop; Chattogram (CMP, 16) city thanas appear first as a group when Chattogram district is chosen.
46. Replaced by decision 49: there is no mismatch hint.
47. Divisions, districts and upazilas are in Bangla alphabetical order.
48. Replaced by decision 79. The delivery area picker comes first. ঢাকার ভিতরে: the customer picks only ঢাকা উত্তর or ঢাকা দক্ষিণ সিটি কর্পোরেশন (with well-known areas under each); division and district are ঢাকা. ঢাকার বাইরে: বিভাগ, জেলা, উপজেলা; Dhaka district shows only its upazilas. The DMP thana list is removed from the shop.
49. Replaced by decision 79 (no delivery area picker). No mismatch hint.
50. Orders save the city corporation when one is chosen, otherwise division, district and upazila. The server refuses anything else with a Bangla error.
51. Order status flow: pending to confirmed or cancelled; confirmed to shipped or cancelled; shipped to delivered or returned. Delivered and returned are final. Cancelled can be reopened to pending. Every change is added to the history with an optional note.
52. The payment method and payment status filters are hidden until M9. The CSV export button is hidden until P2h.
53. The order detail URL uses the order number: `/admin/orders/KE10001`.
54. Orders list: 25 per page, newest first. Search finds the order number (KE10001 or 10001), phone by prefix, or name (contains, ignoring case).
55. The admin can edit the customer's name, phone, typed address and location while the order is pending or confirmed, with the shop form's rules. Changing the location changes no amount (decision 76). Every edit adds a history entry saying what changed. Stale protection as in CLAUDE.md.
56. Hosting region (replaces decision 18): MongoDB Atlas runs in AWS ap-south-1 (Mumbai), in its own Atlas project, and the Vercel function region is `bom1` (Mumbai), set in `vercel.json`, so the server sits next to the database and close to Bangladeshi customers. Moved in November 2026 by copying the whole `kinboekhon` database (all collections, documents and indexes; counts and indexes checked on both sides). The old Virginia cluster is kept untouched as a backup; its connection string stays only in the local `.env.local` as `MONGODB_URI_OLD_VIRGINIA` and is never set on Vercel.
57. Approving a payment on an order that is no longer pending only verifies the payment and shows a warning toast.
58. After a rejected payment the admin can switch the order to cash on delivery: the total becomes the subtotal without the discount, pay-now becomes 0, and a history entry is added.
59. While a payment is waiting for review, Pending to Confirmed is blocked; only approving confirms. Cancel stays allowed.
60. Replaced by decision 76: the location no longer affects the price, so it can be changed on any order the admin may edit.
61. Transaction ID: 6 to 30 letters, digits or hyphens, stored uppercase with inner spaces removed for the duplicate check. One Transaction ID can be used on one order only.
62. Bank transfer: the customer gives only the sender account number.
63. Wallet account types are only personal (Send Money) and merchant (Payment). Agent is removed from Settings, validation and the shop, because Cash Out adds a fee the customer would have to pay on top. A wallet still saved as agent is hidden from the shop, and the Settings page asks the admin to choose Personal or Merchant before it can be saved again.
64. Rate limits per IP on `/api/orders`: every request counts toward 30 per 10 minutes (stops bots hammering the endpoint); only placed orders and failed Turnstile checks count toward the order limit of 10 per 10 minutes and 50 per day, so form errors from customers sharing a carrier address never use it up.
65. At most 3 orders per phone in 24 hours across all products. The 24-hour same-product duplicate block stays.
66. If our server can't reach Cloudflare, the order is accepted and marked unverified.
67. Customer IPs are hashed with `IP_HASH_SECRET` for rate limits and the admin view; the raw IP is kept on the order only for the Conversions API.
68. The duplicate message shows only the old order number and the call line, never the old thank-you page.
69. The admin order detail has a Tracking box: Turnstile result, other orders from the same hashed IP in the 24 hours before the order, the hashed IP and the user agent.
70. Drafts are saved on field blur and once when the page is hidden (`fetch` with `keepalive`), only after the phone is valid.
71. Draft rate limit: 60 saves per 10 minutes per hashed IP.
72. Drafts store the hashed IP, never the raw IP.
73. `/admin/incomplete` has Call, Mark contacted (time and badge) and Delete. No convert to order.
74. Placing an order deletes the draft with the same `draftKey` and all drafts with the same phone and product.
75. One `draftKey` per product in the visitor's browser.
76. Free delivery everywhere in Bangladesh (November 2026). The delivery cost is built into the product price, so the customer sees one price and "সারা দেশে ফ্রি ডেলিভারি" (price tag, trust badge, notice strip; the summary and thank-you page show "ডেলিভারি চার্জ: ফ্রি"). Delivery charges are removed from Settings, `pricing.ts`, the order summary, the thank-you page and the admin order pages. The ঢাকার ভিতরে / ঢাকার বাইরে picker was later removed (decision 79). Orders no longer store `deliveryCharge`; `deliveryDiscount` became `discount`. The old Settings fields were unset in the database.
77. Advance payment: the "delivery charge in advance" option is removed. Options are cash on delivery and full advance. Full advance gets a fixed discount off the total, `fullAdvanceDiscount` in Settings (default ৳50).
78. Old orders keep their saved amounts unchanged; no order is recalculated. When decisions 76 and 77 were made the database held 0 orders, so no order needed a migration.
79. No ঢাকার ভিতরে / ঢাকার বাইরে picker (November 2026). Every customer picks বিভাগ, জেলা, উপজেলা / থানা. When জেলা is ঢাকা, the third list shows ঢাকা উত্তর and ঢাকা দক্ষিণ সিটি কর্পোরেশন first, then Dhaka's upazilas; Chattogram city thanas stay as before. The order still saves the city corporation when one is chosen (`kind: dhaka_city`), so courier booking works. Orders and drafts no longer store `deliveryArea`, and drafts no longer store `cityCorporation` (it is the `upazilaId`). When জেলা is ঢাকা a hint line under the list names well-known areas: "উত্তর সিটি: উত্তরা, মিরপুর, গুলশান, বনানী, বাড্ডা, মোহাম্মদপুর। দক্ষিণ সিটি: ধানমন্ডি, মতিঝিল, পুরান ঢাকা, যাত্রাবাড়ী, লালবাগ, খিলগাঁও।" (`CITY_CORPORATION_HINT`). In November 2026 dncc.gov.bd and dscc.gov.bd were reachable but publish no usable ward or area list (DNCC ward pages are empty and its linked PDF is an unrelated 2016 tax gazette; DSCC has no ward pages), so the earlier Wikipedia check stands: খিলগাঁও is mostly DSCC (DNCC ward 23 also covers part), পুরান ঢাকা is a common name. The admin customer edit form and the server check follow the same rules.
80. Dashboard (M12, November 2026): the week starts on Saturday. Total sales leave out cancelled and returned orders; delivered value is the sum for delivered orders. Incomplete orders and advance payments waiting are live counts, each linking to its admin page. Orders per product shows count and sales, most orders first.
81. Build order after M12 (November 2026): three phases. Phase 1 before the test campaign: price calculator, call outcome, Meta Pixel + CAPI, launch. Phase 2 while the stock ships (about 20 days): customer CRM, Steadfast API, fraud check, profit report with ad spend, stock count, COD payout reconciliation, order SMS, print and CSV exports. Phase 3 after launch: repeat-customer promo codes, blog and info pages, editable notices and offers, SEO and share previews with the policy pages, staff logins. Steadfast, SMS, stock tracking, coupons, blog and more than one admin are no longer "not planned".
82. Policy pages move to Phase 1 as P1e (November 2026): Bangla privacy, terms and return policy, linked in the footer. Return policy: 3 days, only for damaged, wrong or defective products.
83. Price calculator (P1a, November 2026): landed cost = China price + weight x air shipping rate + agent fee; profit per order = (1 - return rate) x (price - price x COD % - landed cost) - courier - packaging - ad cost; the suggested price reaches the target profit, rounded up to end in 90. Defaults in Settings: air shipping ৳710/kg, agent fee ৳0, packaging ৳10, courier ৳120, COD 1%, return rate 15%, ad cost ৳250 per order, target profit ৳150. The inputs are saved per product, admin only, never shown in the shop.
84. Call outcome sets the status (P1b, November 2026): Agreed to wait confirms a pending order, Declined cancels a pending or confirmed order; No answer and Call later keep it pending with a badge in the list. Shipped or later orders keep their status.
