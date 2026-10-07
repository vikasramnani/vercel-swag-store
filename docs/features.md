# Technical features

[Index](README.md) · [Architecture](architecture.md) · [Measurements](measurements.md)

Next.js 16.3.8, App Router, React 19. `cacheComponents: true` is set in `next.config.ts`. The production build marks every route as a partial prerender: a saved HTML shell, with live pieces streamed in afterwards.

## Server Components

Files in `app/` run on the server unless they start with `"use client"`. Home, search, the product page, the cart, and checkout fetch on the server. The browser receives HTML that already contains product names. The bypass token stays in `process.env` on that server.

A `"use client"` file is used only when the browser must hold state or handle typing: the search box, the category menu, the quantity box, the add form, and the assistant panel. Those files are listed in [Architecture](architecture.md).

## `"use cache"`

The directive is on three functions:

- `getFeaturedProducts` in `app/page.tsx`
- `getProduct` in `app/products/get-product.ts`
- `getCategories` in `app/search/page.tsx`

Each saves its return value per argument. A second look at the same product id can skip `GET /api/products/{id}`. Promo, the search-page product list, stock, the assistant search, and the cart are not marked. Stock, the cart, and the assistant search pass `cache: "no-store"`. The promo fetch and the search-page product fetch do not set `cache`. On 2 Oct 2026 the dev log still printed `cache skip` for those two, so the fetch cache did not store them.

In the dev terminal, `logging.fetches.fullUrl` prints each server fetch. A `"use cache"` hit is the absence of that URL on a later visit. The line does not print the words "cache hit". `cache skip` on a line that does appear is the separate `fetch` cache, which this app does not turn on. That log is a development print. A production server does not print those inner API URLs.

The search page `await`s `getCategories()` before it returns the results hole. On a cold visit the page waits for categories, then starts the product search. Later visits skip the category call and wait only for the matches. That order is visible in the [2 Oct search sample](measurements.md).

## Suspense

Cache Components will not block the saved shell on live work. Each live read sits in its own `<Suspense>` boundary with a fallback:

| Hole | Fallback |
|---|---|
| Homepage promo | "Loading the sale…" |
| Product photo and product text | "Loading product…" |
| Stock and Add to Cart | "Checking stock…" |
| Search form | The form with an empty box, so the page can paint |
| Search results | "Searching…" |
| Cart badge | A cart link with no count |
| Cart page, checkout, thanks | A one-line loading message |
| Footer year | Nothing (`fallback={null}`) |

The product photo and the product text are sibling holes. Both call the cached `getProduct`. Stock is a third hole, and it is not cached, so the name can appear while the count is still loading.

`generateStaticParams` in `app/products/[id]/page.tsx` lists every product slug. The build saves a page for each one with the photo, name, price, and description already in the HTML. "Checking stock…" is still the live piece. A slug that was not in that list shows "Loading product…" on the first visit. `npm run dev` still shows that sentence. The saved page is what `npm start` and the deployed site serve. Why the product hole exists, and the timings, are in [Problems](problems.md).

## `connection()`

The footer year is `new Date().getFullYear()`. Under Cache Components that read is dynamic. `CopyrightYear` calls `connection()` from `next/server` before reading the date, and the year is inside a Suspense boundary. The rest of the footer can be part of the shell. The year waits.

## Server Actions

`app/cart/actions.ts` starts with `"use server"`.

| Action | API |
|---|---|
| `addToCart` | `GET` stock, maybe `POST /api/cart/create`, then `POST /api/cart` |
| `updateCartQuantity` | `PATCH /api/cart/{productId}` |
| `removeCartItem` | `DELETE /api/cart/{productId}` |
| `placeOrder` | `DELETE` each line, delete the cookie, `redirect("/checkout/thanks")` |

`cookies()` is async. `cookies().set` runs inside these actions, not during render. `getCart` only reads the cookie.

`addToCart` reads stock again at click time. If the new count is lower than the chosen quantity it returns "Only N in stock." or "None left in stock." and does not create a cart. The stock API does not keep one shared warehouse count. That limit is described in [Problems](problems.md).

The assistant's `askAssistant` is also `"use server"`. The panel calls it. It does not write the cart. Yes on a proposal calls `addToCart`.

## Metadata

`app/layout.tsx` exports:

- title default `Vercel Swag Store`
- title template `%s · Vercel Swag Store`
- description `Official Vercel merchandise.`
- `openGraph.title` and `openGraph.description` with those same two strings

Home sets no title of its own, so the tab is "Vercel Swag Store". Search, Cart, Checkout, and the thanks page export a short title. The template adds the store name, so Search's tab is "Search · Vercel Swag Store".

A product cannot use a fixed string. `generateMetadata` in `app/products/[id]/page.tsx` calls the cached `getProduct` and returns that name as both `title` and `openGraph.title`, and the product description as `openGraph.description`. It also sets `openGraph.images` to that product's photo. A child `openGraph` object replaces the parent's, so the product page sets those fields itself. If it set only the title, the share description and the photo would disappear. Search does not set `openGraph`, so a shared search link keeps the store title, description, and image.

The image for every other page is `app/opengraph-image.tsx`. It draws the mark from `public/vercel.svg` (a white triangle) on a black field, as a 1200×630 PNG. Home, Search, Cart, Checkout, and the thanks page use that file. They do not set their own `openGraph.images`.

Checked in the browser on 5 Oct 2026: Home and Search had `og:image` pointing at `/opengraph-image`, alt "Vercel". The crewneck's `og:image` was the shirt PNG from the catalog, and its `og:title` and description were that product's own text.

## Speed Insights and Web Analytics

The root layout renders `<Analytics />` from `@vercel/analytics/next` and `<SpeedInsights />` from `@vercel/speed-insights/next`. They do not change the page. On localhost they load the debug scripts (`va.vercel-scripts.com`). The Real Experience Score and the visit count come from a visit to the deployed site, after those products are enabled on the Vercel project.

## Partial prerender

`npm run build` on 5 Oct 2026, with these packages included, compiled and generated 9 pages. Every app route was marked Partial Prerender. `/` and `/search` showed revalidate 15 minutes and expire 1 year. That build is the same compile Vercel runs. It does not start the dev server.
