# Problems and corrections

[Index](README.md) · [Assistant](assistant.md) · [Measurements](measurements.md) · [Future improvements](future-improvements.md)

Each item is something we saw in this project. The correction is the code that is in the repo now.

## The stock sentence changed when an item was added

One click with quantity 1 stored 1 in the cart. The product page had said 14 in stock and then said 12. A second click with quantity 1 made the cart quantity 2, and the stock line said 28. Two reads of the water bottle with no cart change in between came back 21, then 4. Checked 5 Oct 2026.

This was not a double submit. `POST /api/cart` adds onto an existing line, so the cart quantity going from 1 to 2 was the API doing what it does. The stock sentence changed because `revalidatePath("/", "layout")` refetches the uncached `GET /products/{id}/stock`, and that endpoint returned a different number on every read.

We did not cache stock. `addToCart` still refuses the add when the chosen quantity is greater than the count it just read ("Only N in stock." or "None left in stock.").

A second browser cannot take the last unit from this API. There is no shared warehouse count to decrement. The second stock read inside `addToCart` is the only stand-in, and it is a new random count, not another shopper. The disabled button at 0 appears when a refresh happens to return 0. We did not build a fake shared stock.

## "black shirt" found nothing

The assistant searched `black shirt` and said the store had no black shirts. The same day, `shirt` returned the Black Crewneck T-Shirt at $30.00, and `black` returned five drink items. The catalog matches one word inside the name.

`searchProducts` now splits the phrase, skips filler words, and searches at most three words in parallel. The system prompt tells the model to pick the returned products that fit the color and the price, and to copy each recommended path on its own line.

A following reply used an absolute `https://vercel.com/products/...` URL, which the page does not turn into a card. The prompt now says to copy the path the tool returned. The panel strips markdown images and `**` bold, because replies included those. A card is drawn only when the reply contains that product's `/products/...` path.

## The model key was set, and the gateway still returned 403

The first Send, before the key existed, said to add `AI_GATEWAY_API_KEY`. After the key was added, `generateText` threw a 403: AI Gateway requires a valid credit card on the team to unlock free credits. The panel was matching that as a generic failure and blaming the key. The catch now looks for "credit card" and says the key is set and a card is required. Adding the card made the model answer.

## Product photos were cropped

The product page used `object-cover` in a short wide box (`h-80 w-full`). Portrait photos, such as the tote handles, were cut off. Search thumbnails used the same fit. Photos now use `object-contain` in a square. The product page puts the photo beside the name from the `md` breakpoint, and stacks them on a narrow window.

## The pages did not match

The first pass forced a dark page because a light browser and a dark window made the search box black on black. Inputs set their own text color. The homepage was later rebuilt as a light page: black promo bar, large headline, black button, featured products in a grid. Search, the product page, the cart, checkout, and the assistant panel stayed dark, so white buttons and dark inputs disappeared on a white page or the reverse.

Those pages now use a white background, dark text, black buttons, and white inputs with a zinc border. The header stays dark. Checked at 390px wide on 5 Oct 2026: Home, the tote page, Search, and the cart did not scroll sideways. Grids were one column. The header puts the store name on one line and the links on the next.

## Search waited, then searched

This is still true. `app/search/page.tsx` awaits `getCategories()` before it returns the Suspense hole for results. A cold visit waits for the category call to finish, then calls products. The category list is cached, so later visits only wait for the matches. We left the order as it is. The timings are in [Measurements](measurements.md).

## A page export was not a function

An early search page failed because the default export was not a function. A route file has to `export default` a function. That file does.

## The product page showed "Loading product…" on every refresh

Two commits on 2 Oct 2026 explain the wrappers. `ae3dc43` put Suspense only around stock. The photo and the name were read in the page, and `getProduct` was not cached. `8ec75eb` turned on `"use cache"` and, in the same change, moved the product into Suspense. The commit message is "fixed all cache errors by choosing suspense vs cache." Cache Components rejected `await params` in the page, because the id in the URL was not known when the shell was built. `"use cache"` saves `getProduct(id)`. It does not cover reading that id. The light-theme commit on 5 Oct split that one product hole into the photo and the name. Both still call the same cached function. Stock stayed its own hole because `getStock` is not cached.

Reading the id is instant. The catalog call is the slow part. On a refresh the first HTML is the header, the footer, "Loading product…", and "Checking stock…". Then `getProduct` and `getStock` run side by side.

Timed on `npm run dev`, 5 Oct 2026, `/products/black-crewneck-t-shirt`:

| | Both sentences in the HTML | Shirt name in the response | "in stock" in the response |
|---|---|---|---|
| First request of that session | 0.90s | 3.44s | 4.53s |
| Next request | 0.09s | 0.12s | 2.17s |

On the second request the product was already saved, so the name followed the shell by a few hundredths of a second. The two seconds after that were the stock call. "Loading product…" is only the first HTML. It leaves when the saved product arrives. Stock stays up until the API answers. A refresh where both sentences stay up for the whole wait is a visit that is still calling `GET /products/{id}`.

`generateStaticParams` in `app/products/[id]/page.tsx` asks `GET /api/products?limit=100` and returns each slug. On 5 Oct 2026 that list was 28 products, one page. The build saves a page per slug with the photo, name, price, and description already in the HTML. "Checking stock…" is still in that file. The number is not.

The saved crewneck file from that build contains "Black Crewneck" and "Checking stock…". It does not contain "Loading product…". The generic `/products/[id]` shell still contains both sentences, for a slug that was not in the list. The build that produced this wrote 38 pages. Each concrete product path was a partial prerender, revalidate 15 minutes, expire 1 year. The earlier build the same day, before this function, had generated 9 pages and left every product URL on the generic shell. See [Measurements](measurements.md).

`npm start` on port 3001, same evening, sent the crewneck name and "Checking stock…" at 0.07s. The stock number arrived at 3.2s. `npm run dev` does not serve that saved page, so a refresh there still flashes "Loading product…".

## Dev fetch log versus production

`logging.fetches.fullUrl` made the dev terminal the place we counted API calls. Those lines are not what a `*.vercel.app` log shows. Production shows the page request. It does not show each catalog URL. The before-and-after cache counts in [Measurements](measurements.md) are from `npm run dev` on 2 Oct 2026.
