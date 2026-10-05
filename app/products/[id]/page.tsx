import type { Metadata } from "next";
import { Suspense } from "react";
import { AddToCartForm } from "../../components/add-to-cart-form";
import { getProduct } from "../get-product";
import { getStock } from "../get-stock";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  const name = product?.name ?? "Product";
  return {
    title: name,
    openGraph: {
      title: name,
      description: product?.description || "Official Vercel merchandise.",
    },
  };
}

async function StockLine({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stock = await getStock(id);

  return <AddToCartForm productId={id} stock={stock.stock} />;
}

async function ProductPhoto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <img
      src={product.images[0]}
      alt={product.name}
      className="aspect-square w-full rounded-lg object-contain"
    />
  );
}

async function ProductInfo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
      <p className="mt-2 text-lg text-zinc-500">
        ${(product.price / 100).toFixed(2)}
      </p>
      <p className="mt-4 text-zinc-600">{product.description}</p>
    </>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="grid items-start gap-10 md:grid-cols-2">
      <Suspense
        fallback={<p className="text-sm text-zinc-500">Loading product…</p>}
      >
        <ProductPhoto params={params} />
      </Suspense>
      <div>
        <Suspense
          fallback={<p className="text-sm text-zinc-500">Loading product…</p>}
        >
          <ProductInfo params={params} />
        </Suspense>
        <Suspense
          fallback={<p className="mt-4 text-sm text-zinc-500">Checking stock…</p>}
        >
          <StockLine params={params} />
        </Suspense>
      </div>
    </main>
  );
}
