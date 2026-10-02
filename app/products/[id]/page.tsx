import { Suspense } from "react";

async function StockLine({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const stockResponse = await fetch(
    `https://vercel-swag-store-api.vercel.app/api/products/${id}/stock`,
    {
      headers: {
        "x-vercel-protection-bypass":
          process.env.VERCEL_PROTECTION_BYPASS ?? "",
      },
    },
  );

  const stockBody = await stockResponse.json();
  const stock = stockBody.data;

  return <p className="mt-4 text-sm text-zinc-400">{stock.stock} in stock</p>;
}

async function getProduct(id: string) {
  "use cache";
  const response = await fetch(
    `https://vercel-swag-store-api.vercel.app/api/products/${id}`,
    {
      headers: {
        "x-vercel-protection-bypass":
          process.env.VERCEL_PROTECTION_BYPASS ?? "",
      },
    },
  );

  const body = await response.json();
  return body.data;
}

async function ProductDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <>
      <img
        src={product.images[0]}
        alt={product.name}
        className="h-80 w-full rounded-lg object-cover"
      />
      <h1 className="mt-6 text-3xl font-semibold">{product.name}</h1>
      <p className="mt-2 text-lg">${(product.price / 100).toFixed(2)}</p>
      <p className="mt-4 text-zinc-300">{product.description}</p>
    </>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main>
      <Suspense
        fallback={
          <p className="mt-6 text-sm text-zinc-400">Loading product…</p>
        }
      >
        <ProductDetails params={params} />
      </Suspense>
      <Suspense
        fallback={
          <p className="mt-4 text-sm text-zinc-400">Checking stock…</p>
        }
      >
        <StockLine params={params} />
      </Suspense>
    </main>
  );
}
