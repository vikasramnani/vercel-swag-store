# Measurements

[Index](README.md) · [Technical features](features.md) · [Problems](problems.md)

These are recorded runs. They are not a current production benchmark. The cache samples are from `npm run dev` on this machine on 2 Oct 2026, before the light layout. The Lighthouse pass is from the same day, against `next start`, and was not repeated after the homepage redesign. The build table is from 5 Oct 2026 and includes the analytics packages.

`logging.fetches.fullUrl` was on. `cache skip` on an API line is the `fetch` cache, which we left off. A `"use cache"` hit is a missing API line on the next visit.

## Before `"use cache"` — 2 Oct 2026

Home, three full visits. The page waited for featured, then the promo. Application time is those two waits added.

| Visit | Page | Featured | Promo |
|---|---|---|---|
| 1 | 4.3s | 1678ms | 2535ms |
| 2 | 4.3s | 1258ms | 2990ms |
| 3 | 4.4s | 1979ms | 2421ms |

Search, one visit: `/search?search=&category=t-shirts` in 5.0s. Categories 3226ms, then products 1454ms. Both `cache skip`.

Product page, one visit, the water bottle, in 5.1s. Details 1905ms, then `/stock` 2708ms. The page waited for details to finish and then called stock. This was one visit, not five refreshes. The route was compiled on this request, so the `next.js` time (487ms) was higher than on Home.

## After `"use cache"` — Home, 2 Oct 2026

`getFeaturedProducts` is cached. The promo fetch is not. Four visits to `/`.

| Visit | Page | Featured | Promo |
|---|---|---|---|
| 1 | 5.2s | 2171ms, `cache skip` | 2682ms, `cache skip` |
| 2 | 5.2s | no API line | 2952ms, `cache skip` |
| 3 | 2.5s | no API line | 2507ms, `cache skip` |
| 4 | 3.2s | no API line | 3090ms, `cache skip` |

Featured called the API once. Promo called it on all four visits.

## After `"use cache"` — product page, 2 Oct 2026

First visit to the water bottle, 2.7s. Details 1250ms and `/stock` 2235ms, both `cache skip`. They ran together. Application time was about the slower call, not the two waits added. Before the Suspense split, the same page had waited for details and then stock, about 5.1s.

Second visit, same bottle, 3.0s. The details URL was absent. `/stock` was 2895ms, `cache skip`.

## After `"use cache"` — search, 2 Oct 2026

`getCategories` is cached. The product search is not.

| Visit | Page | Categories | Products |
|---|---|---|---|
| 1 | `/search?search=shirt&category=t-shirts` in 4.7s | 2560ms | 1790ms |
| 2 | `/search` in 4.4s | no API line | 1826ms |
| 3 | `/search?search=&category=bottles` in 2.1s | no API line | 2007ms |
| 4 | `/search` in 2.2s | no API line | 2089ms |

Visit 1 waited for categories, then products, because the page awaits `getCategories` before it returns the results hole. 2560ms + 1790ms is the 4.5s of application time. Later visits only waited for the matches.

## Lighthouse — 2 Oct 2026

One lab pass on this machine, mobile, against `next start` on port 3001 after `npm run build`. Not the dev server. One visit each. Not re-run after the light layout, which draws large product photos instead of 56px thumbnails.

**Home `/`**

| Category | Score |
|---|---|
| Performance | 75 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

First paint 0.8s. Largest paint 27.9s. Time to interactive 27.9s. Blocking time 30ms. Layout shift 0.035. The largest paint was the featured thumbnails. Six PNGs, about 0.5 MB to 1.1 MB each, were drawn at 56 pixels. Lighthouse estimated about 5,027 KiB of image savings.

**Product `/products/matte-black-stainless-steel-water-bottle`**

| Category | Score |
|---|---|
| Performance | 80 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

First paint 0.8s. Largest paint 2.4s. Time to interactive 2.4s. Blocking time 10ms. Layout shift 0.373. The shift was the product block arriving in the Suspense hole: the photo and the name were not in the first HTML.

## Product page stream — 5 Oct 2026

`npm run dev`, `/products/black-crewneck-t-shirt`. Times are when each string first appeared in the HTML response.

| | Both loading sentences | Shirt name | "in stock" |
|---|---|---|---|
| First request of that session | 0.90s | 3.44s | 4.53s |
| Next request | 0.09s | 0.12s | 2.17s |

The second request did not wait on the product API. The name followed the shell. Stock was still the long call.

`npm start` on port 3001, after `generateStaticParams`, sent the name and "Checking stock…" at 0.07s. The stock number arrived at 3.2s. The saved file `black-crewneck-t-shirt.html` contains the name and "Checking stock…", and does not contain "Loading product…".

## Production build — 5 Oct 2026, before product paths

`npm run build`, Next.js 16.3.8, Cache Components on, TypeScript passed, 9 pages generated. Analytics and Speed Insights were in the layout for this run. This run had no `generateStaticParams`, so every product URL used the `/products/[id]` shell.

| Route | Revalidate | Expire |
|---|---|---|
| `/` | 15m | 1y |
| `/search` | 15m | 1y |
| `/products/[id]`, `/cart`, `/checkout`, `/checkout/thanks` | partial prerender | partial prerender |

Every app route was marked Partial Prerender: prerendered HTML with dynamic server-streamed content.

## Production build — 5 Oct 2026, with product paths

The same command after `generateStaticParams`. TypeScript passed. 38 pages generated. The catalog list was 28 slugs (`limit=100`, `total` 28, one page).

| Route | Revalidate | Expire |
|---|---|---|
| `/`, `/search` | 15m | 1y |
| `/products/matte-black-stainless-steel-water-bottle` and 27 other slugs | 15m | 1y |
| `/products/[id]` | partial prerender | partial prerender |
| `/cart`, `/checkout`, `/checkout/thanks` | partial prerender | partial prerender |

`/products/[id]` is the shell for a slug that was not in the list. It still contains "Loading product…" and "Checking stock…".

Speed Insights has no score in this document. The dashboard fills after a visit to the deployed site. That visit had not been recorded here when these pages were written.
