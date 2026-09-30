# Ababil Client

An ecommerce backend/CMS built on the [Laravel React Starter Kit](https://laravel.com/docs/starter-kits#react) (Laravel 13, Inertia v3, React 19, TypeScript, Tailwind v4). The customer-facing storefront is intentionally a single, minimal checkout page — the CMS/backend is the focus for this phase. The frontend will be redesigned later.

## Requirements

- PHP 8.3+
- Composer 2
- Node.js 20+ and npm
- MySQL 8+

## Installation

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

## Environment configuration

Edit `.env` and set your MySQL credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ababil
DB_USERNAME=root
DB_PASSWORD=
```

Create the database (e.g. `CREATE DATABASE ababil;`) before migrating.

## Migrate & seed

```bash
php artisan migrate --seed
php artisan storage:link
```

Seeding creates:

- An admin user: **admin@example.com** / **password**
- A regular (non-admin) user: **test@example.com** / **password**
- 5 sizes (S–XXL), 2 shipping areas (Inside/Outside Dhaka), a sample product with variants, and default settings.

> These are local-development credentials only. Never use them in production.

## Development server

```bash
composer run dev
```

This runs the Laravel server, queue listener, log watcher, and Vite dev server together (via `php artisan dev`). Or run pieces individually:

```bash
php artisan serve
npm run dev
```

## Frontend build

```bash
npm run build
```

## Admin CMS

Log in at `/login` with the admin credentials above, then visit `/admin`. Sections:

- **Dashboard** — order/revenue summary
- **Catalog → Products / Sizes** — products, sizes, and per-size variants (stock, price override)
- **Orders → Orders / Incomplete Orders** — order management with status timeline; abandoned-checkout tracking
- **Operations → Shipping / Courier Integration** — shipping areas and courier provider status
- **Content → Media** — image/file library
- **Security → Blocked IPs** — block IPs from placing orders (never affects admin access)
- **Settings** — site name, contact info, currency, order prefix, analytics IDs

Admin access is controlled by the `users.is_admin` boolean, enforced server-side via the `admin` route middleware (`app/Http/Middleware/EnsureUserIsAdmin.php`) — never by hiding frontend routes.

## Database architecture

- `products` → `product_variants` (per-size stock/price override) → `sizes`, with `product_images`/`media` for the media library and featured image.
- `orders` → `order_items` (snapshots product name/SKU/size/price at purchase time, so historical orders stay accurate even if the catalog changes) → `order_status_histories` (status timeline).
- `shipping_areas` — database-driven shipping charges; the frontend only ever selects an area, the backend prices it.
- `incomplete_orders` — debounced abandoned-checkout tracking, keyed by a per-visitor session token; converts to `order_id` once an order is placed.
- `blocked_ips` — IPv4/IPv6-aware order blocking, applied only to customer order routes.
- `settings` — simple key/value store (`App\Models\Setting::get()/set()`), cached.

All monetary columns are `decimal(10,2)`. Every price used to build an order (`app/Actions/Orders/PlaceOrderAction.php`) is re-derived from the database inside a transaction with row locking — nothing the frontend submits for price, subtotal, shipping charge, discount, or total is ever trusted. Stock is decremented with a locked, conditional update (`stock >= quantity`) so concurrent orders can't oversell.

## Courier integration architecture

Order fulfilment depends only on `App\Services\Courier\CourierServiceInterface` (`createParcel()`, `getParcelStatus()`, `cancelParcel()`). `NullCourierService` backs it until a provider is configured. Provider config lives in `config/courier.php` and reads credentials from the environment only — they are never exposed to the frontend. See the Courier Integration page in the admin CMS for current provider status.

**Pathao** is implemented (`App\Services\Courier\PathaoCourierService`) against their documented Merchant API:

- OAuth token (issue + refresh) is persisted in the `courier_tokens` table and renewed automatically.
- `createParcel()` posts to `/aladdin/api/v1/orders` with the order's items/quantity/weight and COD amount; `getParcelStatus()` reads `/aladdin/api/v1/orders/{id}/info`.
- Pathao does not document a cancel-order endpoint, so `cancelParcel()` fails clearly instead of guessing one — cancel from the Pathao merchant dashboard.
- Pathao does not enumerate all possible order statuses (only "Pending" appears in their docs), so status is mapped best-effort to `App\Enums\CourierStatus`, with the raw status text always preserved on `orders.courier_raw_status` for admins.
- Recipient city/zone/area are intentionally omitted from parcel creation — checkout only collects a free-text address, and Pathao auto-resolves these from it.
- To activate: create your store in Pathao's own merchant dashboard first (store creation isn't part of this CMS), then set `COURIER_DEFAULT=pathao` and the `PATHAO_*` variables in `.env`.

To add another provider (Steadfast, RedX, ...), implement `CourierServiceInterface` for it and add one line to the `match` in `App\Providers\AppServiceProvider::register()`.

Each product has a `weight` (kg, default 0.5) used to calculate the parcel's total weight for the courier; it's snapshotted onto `order_items` at order time, same as price.

## Useful Artisan commands

```bash
php artisan route:list                 # inspect all routes
php artisan migrate:fresh --seed        # reset and reseed the database
php artisan test --compact              # run the test suite
vendor/bin/pint                         # fix PHP code style
vendor/bin/phpstan analyse              # static analysis
```

## Known limitations / future work

- The customer landing page features a single product; multi-product browsing/search is not built yet (the schema supports it).
- Product gallery images (`product_images`) have a backing table/model but no dedicated CMS UI yet — only the featured image is manageable today.
- Only Pathao is implemented; other providers need their own `CourierServiceInterface` implementation (see above).
- Store creation and city/zone/area selection aren't part of the CMS — Pathao auto-resolves the delivery zone from the free-text address.
- No coupon/discount code system yet (`orders.discount` exists and defaults to 0).
