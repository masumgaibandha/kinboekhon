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
| `tailwindcss`, `@tailwindcss/postcss` | Styling (Tailwind v4, theme in CSS) |
| `mongoose` | MongoDB models |
| `zod` | Input validation |
| `next-auth` (Auth.js v5) | Admin login |
| `eslint`, `eslint-config-next` | Lint (comes with create-next-app) |

Done without extra packages:
- Password hashing: Node `crypto.scrypt`.
- Cloudinary upload: signed direct upload from the browser, signature made with Node `crypto`.
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
│  └─ brand/                     logo.png, logo-white.png, icon.png, og.png
├─ scripts/
│  └─ hash-password.ts           prints a scrypt hash for ADMIN_PASSWORD_HASH
└─ src/
   ├─ proxy.ts                   protects /admin/* (Next.js 16 name for middleware)
   ├─ auth.ts                    Auth.js config, single admin, Credentials provider
   ├─ app/
   │  ├─ layout.tsx              html, font, base metadata
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
   │     ├─ auth/[...nextauth]/route.ts
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
   │  │                          StatusSelect, ProductForm, ImageUploader, PaymentReviewCard
   │  ├─ tracking/               MetaPixel.tsx, pixel.ts (client helpers)
   │  └─ ui/                     Button, Input, Textarea, Select, Badge
   └─ lib/
      ├─ db.ts                   cached Mongoose connection
      ├─ env.ts                  reads and checks env vars with Zod
      ├─ models/                 Product.ts, Order.ts, IncompleteOrder.ts,
      │                          Settings.ts, Counter.ts, RateLimit.ts
      ├─ validation/             order.ts, draft.ts, product.ts, settings.ts (Zod schemas)
      ├─ orders/                 pricing.ts, create-order.ts, order-number.ts, duplicate-check.ts,
      │                          stats.ts, csv.ts
      ├─ phone.ts                normalize + validate BD mobile numbers
      ├─ money.ts                Taka formatting, Bangla digits
      ├─ dates.ts                Asia/Dhaka day/week/month ranges
      ├─ turnstile.ts            server verify
      ├─ rate-limit.ts
      ├─ request.ts              client IP, user agent, cookie read
      ├─ cloudinary.ts           signature + image URL builder
      ├─ admin-session.ts        requireAdmin() for pages and actions
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
| slug | string, unique | used in `/p/[slug]`, English letters and hyphens |
| price | number | selling price |
| oldPrice | number, optional | shown struck through; discount % computed |
| images | `{ url, publicId, width, height }[]` | first image is the main one |
| shortDescription | string | one or two lines under the headline |
| hook | `{ headline, subheadline }` | first screen |
| problem | `{ title, points: string[] }` | pain points |
| story | `{ title, body }` | short story |
| solution | `{ title, benefits: string[], images: Image[] }` | how the product solves it |
| proof | `{ title, images: Image[], reviews: { name, text }[] }` | customer screenshots, reviews |
| cta | `{ title, text }` | final push above the form |
| active | boolean | only active products are shown or orderable |
| sortOrder | number | home page order |

Index: `slug` unique, `{ active, sortOrder }`.
Any landing section left empty is simply not rendered.

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
| duplicateWindowHours | default 24 |

### Counter
`{ _id: "order", seq }`. Atomic `$inc` gives the next order number.

### RateLimit
`{ key, count, expiresAt }`. TTL index on `expiresAt`. Key = scope + hashed IP.

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

Pages are statically generated and refreshed with `revalidatePath` when the admin saves a product or settings, so they load fast from the edge.

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
| `/admin/products` | List with active toggle, edit link, view link |
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
| `/api/auth/[...nextauth]` | GET/POST | Auth.js | Login attempts rate limited |
| `/api/admin/upload-signature` | POST | Signed Cloudinary upload params | Admin session |
| `/api/admin/orders-export` | GET | CSV of filtered orders (UTF-8 with BOM so Excel shows Bangla) | Admin session |

Server Actions (each calls `requireAdmin()` first):
- orders: `updateOrderStatus`, `saveAdminNote`
- payments: `approvePayment`, `rejectPayment`
- products: `createProduct`, `updateProduct`, `setProductActive`, `deleteProduct`
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

- Admin login: one admin from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`), scrypt hash, JWT session cookie (httpOnly, secure), login rate limited.
- `proxy.ts` redirects `/admin/*` to `/admin/login` without a session, and every admin page, action and API route checks again on the server.
- Admin pages: `noindex`, no Pixel.
- Thank-you page uses a random `publicId` and shows no address or phone.
- All customer JSON responses use `Cache-Control: no-store`.

## 10. Environment variables (`.env.example`)

```
MONGODB_URI=
AUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
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
| M1 | **Admin login**: Auth.js credentials, hash script, `proxy.ts`, `/admin/login`, empty panel layout with nav and logout | `/admin` redirects to login; wrong password fails; right password opens panel; logout works |
| M2 | **Database + Settings**: Mongo connection, Settings model, settings page | Save delivery charges and bKash number, reload, values stay |
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
| M16 | **Launch**: Vercel project, env vars, Atlas network access, domain, Turnstile hostname, Meta domain verification, Lighthouse mobile check | Live site at kinboekhon.com, real test order end to end, then delete it |

## 12. Not in version 1

Cart, customer accounts, coupons, product variants, stock tracking, courier API (Steadfast, Pathao), SMS, email notifications, online payment gateway, multiple admins, blog, search.

## 13. Owner decisions

1. Payment options: Cash on Delivery (no discount), delivery charge in advance (৳20 off delivery), full amount in advance (৳50 off delivery). Discount and final amount shown clearly before submit. Both discounts editable in Settings.
2. Purchase event fires when the order is placed.
3. Duplicate order is blocked and the old order number is shown. Window: 24 hours.
4. Landing URL: `/p/product-slug`.
5. Maximum quantity per order: 5.
6. Order number format: `KE10001` (first order is KE10001).
7. Logo: use the PNG files for now. An SVG will be added to `logos/` later; switch to it then.
8. Policy pages: drafted in Bangla for owner review. Return window: 3 days, only for damaged, wrong or defective products.
9. No cookie consent banner.
10. Admin login email: set in `ADMIN_EMAIL` in `.env.local` (kept out of the repo).
11. Default delivery charges: inside Dhaka ৳80, outside Dhaka ৳150. Both editable in Settings.
