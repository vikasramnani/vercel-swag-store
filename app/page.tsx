import Link from "next/link";

export default async function Home() {
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
    <main>
      <h1 className="text-3xl font-semibold">Vercel Swag Store</h1>
      <p className="mt-2 text-zinc-400">Official Vercel merchandise.</p>
      <p className="mt-6 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm">
        <span className="font-semibold">{promo.title}.</span> {promo.description}{" "}
        Code <span className="font-semibold">{promo.code}</span>
      </p>
      <ul className="mt-8 divide-y divide-zinc-800">
        {body.data.map((product) => (
          <li key={product.id}>
            <Link
              href={`/products/${product.slug}`}
              className="flex items-center gap-4 py-3 hover:text-zinc-300"
            >
              <img
                src={product.images[0]}
                alt=""
                className="h-14 w-14 rounded-md object-cover"
              />
              <span className="flex-1">{product.name}</span>
              <span>${(product.price / 100).toFixed(2)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}