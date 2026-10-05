# Shopping assistant

[Index](README.md) · [Architecture](architecture.md) · [Problems](problems.md)

The panel is `app/components/assistant-panel.tsx`. It is a client component. It does not call the catalog and it does not see `AI_GATEWAY_API_KEY`. It calls the Server Action `askAssistant` in `app/assistant/ask.ts`.

## The loop

`askAssistant` uses `generateText` from the `ai` package.

- Model string: `openai/gpt-4o-mini`. The AI SDK sends that to the Vercel AI Gateway. The gateway reads `AI_GATEWAY_API_KEY`.
- `stopWhen: isStepCount(5)`. The model may take up to five steps, then it must answer.
- Tools are declared with `tool()` and a Zod `inputSchema`. The model chooses a name and arguments. Our server runs `execute`.

If the sentence is empty, the function returns "Type a question about the store." If the key is missing, it says to add `AI_GATEWAY_API_KEY` to `.env.local`. If the gateway error text contains "credit card", the panel says the key is set and the team needs a card under AI Gateway. Other errors return "The assistant could not answer."

On 5 Oct 2026 the key was present and the gateway still returned 403 until a card was on the team. After the card, the model answered.

## Tools

Each tool's work is in its own file. `ask.ts` only registers the description, the inputs, and `execute`.

| Tool | File | What it does |
|---|---|---|
| `searchProducts` | `app/assistant/search-products.ts` | Searches the catalog |
| `getProduct` | `app/assistant/get-product.ts` | Shapes one cached product for the model |
| `getStock` | `app/assistant/get-stock.ts` | Reads the live count |
| `proposeAdd` | `app/assistant/propose-add.ts` | Records a name, slug, quantity, and path. It does not write the cart |

The product page's `getProduct` returns the API object and is cached. The assistant file calls that function and returns name, path, dollar price, image, and description.

### Search words

The catalog matches one word inside the product name. `search=black shirt` matches nothing, because the shirt is named "Black Crewneck T-Shirt". `search=shirt` matches it. Checked 5 Oct 2026: `black` returned five black drink items and not that shirt, because the call is `limit=5`.

`searchProducts` splits the phrase on characters that are not letters, digits, or hyphens. It drops words shorter than 3 characters and a fixed filler list (`the`, `and`, `under`, and the rest in that file). It keeps at most three words and requests them with `Promise.all`. The wait is the slowest call, not the sum. Results are deduped by path. Each call is `cache: "no-store"` and `limit=5`.

A visit that took 4.5 seconds was two model calls plus one catalog call, not three catalog calls added together.

## What the panel draws

The reply is plain text. The panel removes markdown images (`![...](...)`) and `**` bold. A `/products/{slug}` path in the sentence becomes a link. A product card (photo, name, price, link) is drawn only when the reply text contains that product's path. Under the sentence, the panel prints `Tools:` and the tool names from that turn.

`proposeAdd` does not call the cart API. The panel shows "Add N {name}?" and a Yes button. Yes submits `addToCart` with the slug and the quantity, the same action as the product page. Checked 5 Oct 2026: after the proposal the badge was still 0. After Yes it was 1, and the button read Added. Skipping Yes leaves the cart unchanged. The stock check inside `addToCart` still runs at that click.

The system prompt tells the model to copy each recommended path on its own line, and not to say the item is already in the cart. The tool returns paths that start with `/products/`. The panel turns that shape into a link.
