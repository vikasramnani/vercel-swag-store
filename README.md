# Vercel Swag Store

A Next.js 16 storefront for the [Vercel Swag Store API](https://vercel-swag-store-api.vercel.app/api/docs). It shows a catalog, search, a cart stored in an httpOnly cookie, a practice checkout, and a shopping assistant.

The write-up for review is in [`docs/`](docs/README.md).

| Doc | What it covers |
|---|---|
| [What we built](docs/what-we-built.md) | Routes, what is included, what is not a real payment |
| [Architecture](docs/architecture.md) | Where work runs, the two keys, the cart cookie, why there is no MCP server |
| [Next.js 16](docs/next-16.md) | Server Components, Cache Components, Suspense, Server Actions, metadata |
| [Assistant](docs/assistant.md) | The model loop, the four tools, and the Yes button |
| [Problems](docs/problems.md) | What broke, and the change that fixed it |
| [Measurements](docs/measurements.md) | Dev-server timings from 2 Oct 2026, and the 5 Oct 2026 production build |

## Stack

- Next.js 16.3.8, React 19, Tailwind CSS 4
- Cache Components (`cacheComponents: true` in `next.config.ts`)
- Vercel AI SDK 7 (`ai`) and Zod, model `openai/gpt-4o-mini` through the AI Gateway
- `@vercel/speed-insights` and `@vercel/analytics` in the root layout

Prices from the API are cents. `3000` is shown as `$30.00`.

## Run it

```bash
npm install
```

Create `.env.local` (git ignores `.env*`):

```bash
VERCEL_PROTECTION_BYPASS=
AI_GATEWAY_API_KEY=
```

`VERCEL_PROTECTION_BYPASS` is sent as `x-vercel-protection-bypass` on catalog and cart requests. `AI_GATEWAY_API_KEY` is read by the assistant. Neither name starts with `NEXT_PUBLIC_`, so neither is bundled for the browser. On 5 Oct 2026 a catalog `GET` succeeded both with and without the bypass header. The app still sends the header when the variable is set.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run build` compiles the production app. It succeeded on 5 Oct 2026 with the analytics packages included. `npm run dev` is a separate process and is the one that prints catalog fetch URLs.

## Deploy

`.env.local` is not deployed. The same two variable names belong in the Vercel project's Environment Variables for Production and Preview. A deployment that already finished does not pick up a variable added later.

Speed Insights and Web Analytics report from the deployed site. The debug scripts load on localhost. They do not fill the dashboard.
