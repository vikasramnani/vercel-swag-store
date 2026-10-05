# What we built

[Index](README.md) · [Architecture](architecture.md)

A storefront in front of `https://vercel-swag-store-api.vercel.app/api`. The browser never calls that API. Server Components and Server Actions do.

## Routes

| Route | What the shopper gets |
|---|---|
| `/` | A promo bar, a headline, a link to search, and the featured products as a photo grid |
| `/products/[id]` | The full photo, name, dollar price, description, live stock, a quantity box, and Add to Cart |
| `/search` | A text box, a category menu, at most 5 matches, an empty state, and a loading state |
| `/cart` | This browser's lines, plus and minus, remove, and a subtotal |
| `/checkout` | A practice payment form. It always succeeds |
| `/checkout/thanks` | A confirmation, and the cart after that pretend payment |

The header has Home, Search, the assistant, and a cart badge. The badge is the sum of line quantities. The footer prints the copyright year.

The production host recorded on 2 Oct 2026 was `https://vercel-swag-store-vikas.vercel.app/`. A later deploy replaces what that host serves. This repository is the source.

## Homepage

The headline and the sentence under it are written in `app/page.tsx`. They are not loaded from the API. As of this writing the headline is "Merch That Deploys Instantly." The promo text above it is loaded from `GET /api/promotions` and changes when that API changes. Featured products come from `GET /api/products?featured=true`. Each card links to `/products/{slug}`.

## Product page

`id` in the URL may be a slug, such as `black-crewneck-t-shirt`. The details call and the stock call are separate. The photo uses `object-contain` inside a square, so the whole product is visible. Add to Cart is disabled when the stock read is 0. The quantity box will not stay above that count.

## Search

An empty search shows 5 products. A word shows at most 5 matches (`limit=5`). The category list comes from `GET /api/categories`. After 3 characters the address updates without a click. One or two characters do not update the address. The form is a GET to `/search`, so Enter or the Search button still sends a shorter word. Refresh keeps the word because it is in the URL.

## Cart

No login. The first add creates a cart with `POST /api/cart/create` and stores the `x-cart-token` response header in an httpOnly cookie named `cart-token`. Later requests send that cookie back to our server, which forwards it as `x-cart-token`.

`POST /api/cart` adds the chosen quantity onto a line that is already there. Add 1, then add 1 again, and the line quantity is 2. Plus and minus use `PATCH` to set the quantity. Minus stops at 1. Remove uses `DELETE` for one line. The subtotal is the API's subtotal, shown in dollars.

The cookie is `httpOnly`, `sameSite: "lax"`, `path: "/"`, `maxAge` 24 hours, and `secure` only when `NODE_ENV` is `production`. Each successful cart write sets the cookie again, which restarts the 24 hours. A browser with no cookie sees an empty cart and a badge of 0. A failed cart read is treated as empty.

## Practice checkout

Checkout was not part of the original page list. It was added so a pretend purchase can empty the cart. The card inputs have no `name`, so the browser does not submit them. `placeOrder` deletes each line, deletes the cookie, and redirects to `/checkout/thanks`. Nothing is charged. The success page is not a payment processor.

## Assistant

A panel in the header. The shopper types a sentence. The server may call `searchProducts`, `getProduct`, `getStock`, or `proposeAdd`. Adding to the cart happens only after the shopper clicks Yes. Details are in [the assistant doc](assistant.md).

## Not included

There is no account, wishlist, review, or live-chat client. The assistant is our panel. It is not the API's live-chat flag. There is no MCP server and no `/api/mcp` route.
