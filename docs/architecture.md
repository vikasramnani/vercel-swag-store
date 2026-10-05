# Architecture

[Index](README.md) · [What we built](what-we-built.md) · [Next.js 16](next-16.md)

## Who calls the API

```text
Browser
  |  HTML, and later a Server Action (the sentence, or a cart form)
  v
Next.js server  (app/)
  |  fetch, with the bypass header, and the cart token when there is one
  v
https://vercel-swag-store-api.vercel.app/api
```

`app/cart/swag.ts` exports the API origin and `swagHeaders()`. That function adds `x-vercel-protection-bypass` from `process.env.VERCEL_PROTECTION_BYPASS`. If a cart token is passed in, it also adds `x-cart-token`. Product details, stock, the cart, and the assistant search use it. The homepage and the search page write the same header inline, next to their own fetches.

Five files are marked `"use client"`:

| File | What it does in the browser |
|---|---|
| `app/components/search-box.tsx` | Writes the search word into the address after 3 characters |
| `app/components/category-select.tsx` | Writes the category into that same address |
| `app/components/quantity-selector.tsx` | Holds the quantity |
| `app/components/add-to-cart-form.tsx` | Submits the add-to-cart Server Action |
| `app/components/assistant-panel.tsx` | Sends the sentence to `askAssistant` |

None of those files call `fetch`. None read `process.env`. The search page, the product page, and the cart page still load data on the server.

## Saved data and live data

| Data | Where | Cached? |
|---|---|---|
| Featured products | `getFeaturedProducts` in `app/page.tsx` | Yes, `"use cache"` |
| One product's details | `app/products/get-product.ts` | Yes, `"use cache"` |
| Category list | `getCategories` in `app/search/page.tsx` | Yes, `"use cache"` |
| Promo | `PromoBanner` in `app/page.tsx` | No `"use cache"`. The fetch does not set `cache` |
| Stock | `app/products/get-stock.ts` | No, `cache: "no-store"` |
| Search matches | `SearchResults` in `app/search/page.tsx` | No `"use cache"`. The fetch does not set `cache` |
| Assistant search | `app/assistant/search-products.ts` | No, `cache: "no-store"` |
| Cart | `app/cart/get-cart.ts` and `app/cart/actions.ts` | No, `cache: "no-store"` |

The product page and the assistant both call `getProduct`, so they share one saved result per id. The assistant's `getStock` calls the same uncached `app/products/get-stock.ts` the product page uses.

No function in this repo calls `cacheLife()`. The production build on 5 Oct 2026 printed `Revalidate 15m` and `Expire 1y` for `/` and `/search`. The other routes are partial prerenders without those two columns. See [Measurements](measurements.md).

## The two environment keys

| Name | Who reads it | What it is for |
|---|---|---|
| `VERCEL_PROTECTION_BYPASS` | `swagHeaders()` | Catalog and cart requests |
| `AI_GATEWAY_API_KEY` | The AI SDK, inside `askAssistant` | The model call |

Both live in `.env.local` on a development machine. Git ignores `.env*`. A Vercel deployment does not receive that file. The same names are set in the project's Environment Variables for Production and Preview, and the project is redeployed after they change.

The cart token is not one of those keys. It is the `cart-token` cookie, taken from the `x-cart-token` response header of `POST /api/cart/create`. Page JavaScript cannot read it.

On 5 Oct 2026, `GET /api/products?limit=1` returned 200 with the bypass header and again without it. The deployed store can therefore show products even if the variable was never typed into Vercel. The code still sends the header when the variable is set. If the API starts requiring it, an empty header fails.

## Why the cart code is split

Home, search, and a product keep a fetch next to the page that uses it. The cart is read by the cart page, the header badge, checkout, and the thanks page, and it is written by the product form, plus, minus, remove, and Pay. A `page.tsx` is the route. Other screens cannot import it.

- `app/cart/actions.ts` is `"use server"`. A form can call add, update, remove, and Pay. The browser does not receive the function body or the tokens.
- `app/cart/get-cart.ts` reads the cart while a page is rendered. It does not set a cookie. Cookie writes happen in the Server Actions.
- `app/cart/swag.ts` is the API address and the headers. It has no JSX.

`addToCart` takes `(previousState, formData)` because the product form and the assistant's Yes button use `useActionState`. A raw form action would pass `FormData` as the first argument.

`revalidatePath("/", "layout")` after a cart write refreshes the header badge. It also refetches uncached stock on the product page that is open. That is why the stock sentence can change after Add. See [Problems](problems.md).

## No MCP server

MCP is a tool catalog for an agent that lives in another program. This website is the only client. The four assistant tools are functions in this Next.js process. An MCP server would be a second process and a second place to keep the bypass token, for the same calls. There is no `/api/mcp` route.

## Where the app runs

On 5 Oct 2026 a catalog response included `x-vercel-id: lhr1::iad1::...`. From this machine, `lhr1` was the London edge and `iad1` was the API function in Washington, D.C. Store pages on that check were served as a cache hit at the London edge, so that header did not show the store's function region. The store's region is a Vercel project setting (`Settings → Functions → Function Region`). It is not set in this repository. `npm run dev` on this Mac still calls Washington directly, which is why local catalog calls were often 1.5–3 seconds.
