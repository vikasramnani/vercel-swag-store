import Link from "next/link";
import { Suspense } from "react";

async function PromoBanner() {
  const promoResponse = await fetch(
    "https://vercel-swag-store-api.vercel.app/api/promotions",
    {
      headers: {
        "x-vercel-protection-bypass":
          process.env.VERCEL_PROTECTION_BYPASS ?? "",
      },
    },
  );

  const promoBody = await promoResponse.json();
  const promo = promoBody.data;

  return (
    <p className="border-t border-white/20 bg-black px-6 py-3 text-center text-sm text-white">
      <span className="font-semibold">{promo.title}.</span> {promo.description}{" "}
      Code <span className="font-semibold">{promo.code}</span>
    </p>
  );
}

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
};

async function getFeaturedProducts(): Promise<CatalogProduct[]> {
  "use cache";
  const response = await fetch(
    "https://vercel-swag-store-api.vercel.app/api/products?featured=true",
    {
      headers: {
        "x-vercel-protection-bypass":
          process.env.VERCEL_PROTECTION_BYPASS ?? "",
      },
    },
  );

  const body = await response.json();
  return body.data as CatalogProduct[];
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <main className="relative left-1/2 w-screen -translate-x-1/2 -my-8 bg-white font-sans text-zinc-950">
      <Suspense
        fallback={
          <p className="border-t border-white/20 bg-black px-6 py-3 text-center text-sm text-white">
            Loading the sale…
          </p>
        }
      >
        <PromoBanner />
      </Suspense>
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h1 className="max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl sm:leading-[1.05]">
        Merch That Deploys Instantly.
        </h1>
        <p className="mt-6 max-w-md text-lg text-zinc-500">
          High-bandwidth swag for developers who spend more time in VS Code than
          in physical stores. Ships globally without breaking the build.
        </p>
        <Link
          href="/search"
          className="mt-8 inline-block rounded-md bg-black px-5 py-3 text-sm font-medium text-white"
        >
          Browse All Products →
        </Link>
        <div className="mt-20 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Featured Products</h2>
          <Link href="/search" className="text-sm text-zinc-500 hover:text-zinc-950">
            View all
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/products/${product.slug}`} className="block">
                <img
                  src={product.images[0]}
                  alt=""
                  className="aspect-square w-full object-contain"
                />
                <span className="mt-4 block font-medium">{product.name}</span>
                <span className="mt-1 block text-zinc-500">
                  ${(product.price / 100).toFixed(2)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
