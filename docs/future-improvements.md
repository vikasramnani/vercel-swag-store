# Future improvements

[Index](README.md) · [Problems](problems.md) · [Assistant](assistant.md)

These are limits of the code in this repository. They are not built. The recorded stock reads are in [Problems](problems.md).

## Stock is a new number on every read

`getStock` in `app/products/get-stock.ts` calls `GET /api/products/{id}/stock` with `cache: "no-store"`. The function is not marked `"use cache"`. The comment in that file says a new call can return a different number.

The product page puts that read in its own Suspense hole (`StockLine`). The number on the page is whatever that request returned. `revalidatePath("/", "layout")` after a cart write loads the page again, so the hole fetches stock again. On 5 Oct 2026 that second number was not the first number minus the quantity just added. Two reads of the water bottle, with no cart change between them, came back 21 and then 4.

`addToCart` reads stock once, compares it with the quantity in the form, and then `POST`s the cart. The check uses only that one response:

- quantity greater than the number just read returns "Only N in stock."
- a read of 0 returns "None left in stock." and the button on the product page is disabled when the number it was given is 0

Nothing in this app stores that number, decrements it, or stops a second browser from adding the same product. A later read is a new response from the API, not the remainder of the earlier one. Plus and minus do not read stock at all. `updateCartQuantity` `PATCH`es the line to `quantity + 1` or `quantity - 1`. Pay does not read stock either.

So the stock sentence and the "Only N in stock." message describe one response. They do not describe a warehouse. Caching that response would keep showing one of those changing numbers. That is why this app leaves the call uncached. A stock figure that can be trusted would have to be a count the API decreases when a unit is held, and this app would have to treat a later read as that same count. This repository does not do that.

## Two people, and two payments at once

There is no account. The cart is the `cart-token` cookie set in `rememberCart`. The cookie is `httpOnly`, `sameSite: "lax"`, `path: "/"`, and it expires 24 hours after the last successful cart write. The first add, when the cookie is missing, calls `POST /api/cart/create` and stores the `x-cart-token` response header. Later cart calls send that value back as `x-cart-token`.

Two browsers do not share that cookie. Each one with no cookie creates its own cart on the first add. One browser's Pay runs `placeOrder` for the token in that browser's cookie only. It does not look at any other token.

`placeOrder` does this, in order:

1. Read `cart-token`. If there is no cookie, skip the cart and still redirect to `/checkout/thanks`.
2. `GET /api/cart` with that token.
3. If that GET succeeds, `DELETE /api/cart/{productId}` once per line, one after another. The loop does not check those DELETE responses.
4. Delete the cookie.
5. `revalidatePath("/", "layout")` and `redirect("/checkout/thanks")`.

The card inputs on the checkout page have no `name`. The form action is `placeOrder`. The page says nothing is charged and that this always succeeds. There is no order id, no charge, and no row that records what was bought. The thanks page does not receive the lines. After the cookie is gone, `getCart` sees no token and returns an empty cart.

What that means for two shoppers at the same time:

- They are not editing one cart. They cannot see each other's lines, and one Pay does not empty the other cart.
- They also do not compete for a unit. Stock is not reduced, and Pay does not read it. Both can add the same product and both can land on the thanks page.
- Plus on one cart does not affect the other cart.

What that means for two actions on the same cookie at the same time (two tabs in one browser share the cookie):

- Both tabs send the same `x-cart-token`. `addToCart`, `updateCartQuantity`, `removeCartItem`, and `placeOrder` do not take a lock and do not send a version of the cart.
- Two adds can each read stock, both pass, and both `POST /api/cart`. That POST adds the quantity onto a line that is already there.
- Pay reads the lines, then deletes them one by one. An add that arrives after that GET and before the matching DELETE is not in the list Pay is deleting. An add that arrives after the cookie is deleted belongs to a new `POST /api/cart/create` on the next add. This code does not record which of those happened.
- Two Pays can both GET the same lines and both DELETE them. The second DELETE is not checked. Both still delete the cookie and both redirect to the thanks page.

This app does not manage a shared checkout. A later version would need a stock count that goes down for everyone, a cart that stays one shopper's, and a payment that records the lines it actually took. None of those exist in this code. The practice Pay only empties the cart for the cookie it was given.

## The assistant does not send earlier turns

The panel keeps the bubbles on screen. `AssistantPanel` stores them in `lines` (`useState`). That state lives in the header, so it stays while the panel is closed and while the shopper moves to another page in the same load. A full reload starts `lines` at `[]` again.

The model does not receive those bubbles. `send` calls `askAssistant(sentence)` with the new input only. `askAssistant` passes that string as `prompt`. It does not take a message list, and `generateText` is not given the previous question, the previous reply, the product paths, or the proposal. The system text is the same fixed instructions on every call.

A first message such as "shirt" can call `searchProducts`, and the reply can include `/products/black-crewneck-t-shirt`. A second message such as "add that into the cart" is a new call. The words in that second string are the only ones the model sees. "that" does not name a product. The earlier path is on screen in the browser and is not an argument to this call. `proposeAdd` runs only when this call chooses a slug. If this call does not have one, it cannot point Yes at the shirt from the previous turn.

Yes still works when a proposal is returned, because the button posts `productId` and `quantity` from that proposal into `addToCart`. The proposal comes from the current call's tool result, not from an earlier bubble.

## The product API matches one word, not a phrase

The search page puts the shopper's text into one query parameter. `productQuery` in `app/search/page.tsx` builds `limit=5`, then `search=` when there is a word, then `category=` when a category is selected. It does not split the text. It does not send the product description. The result type on that page is id, slug, name, price, and images.

Checked 5 Oct 2026 against `GET /api/products`:

- `search=black shirt` matched nothing. The shirt is named "Black Crewneck T-Shirt", and the API does not treat those two words as a phrase.
- `search=shirt` returned that shirt at $30.00.
- `search=black` returned five black drink items. The call is `limit=5`, so the shirt was not in that response.

The assistant does not change the API. `searchProducts` in `app/assistant/search-products.ts` splits the sentence on characters that are not letters, digits, or hyphens, drops words shorter than 3 characters and a fixed filler list, keeps at most three words, and calls `search=<that one word>` for each. The calls run with `Promise.all`. Rows are deduped by path. The model is told to pick the rows that fit the color and the price. A color word can still fill all five slots with other products, which is what `black` did.

So a phrase works in the assistant only when one of those single-word calls happens to return the product. The search page still sends the phrase as one string. Neither path is a full-text search of the name and the description. This repository has no other search parameter to send. That match would have to be on the API.

## The catalog calls are slow, and this app does not own that API

Every product, category, promo, stock, and cart read is a `fetch` to `https://vercel-swag-store-api.vercel.app/api`. This repository does not contain that service.

On 2 Oct 2026, from `npm run dev` on this machine, those calls were often 1.5–3 seconds. Promo was about 2.4–3.1 seconds on every homepage visit. A search's product call stayed about 1.8–2.1 seconds on every visit, including after categories were cached. A product-page stock call was 2.2 seconds on one visit and 2.9 seconds on the next. The tables are in [Measurements](measurements.md).

`"use cache"` skips a repeat of featured products, one product's details, and the category list. It does not run for promo, stock, search matches, or the cart, so those still wait on the API every time. The assistant can issue up to three of those product searches in one turn, and the model calls sit on top of them. One recorded assistant visit was 4.5 seconds: two model calls and one catalog call.

On 5 Oct 2026 a catalog response included `x-vercel-id: lhr1::iad1::...`. From this machine that was the London edge in front of a function in Washington, D.C. `npm run dev` calls that host directly. The store's own region is a Vercel project setting and is not set in this repo. Shortening those waits is a change to the API. Caching three reads in this app does not make the host answer faster.
