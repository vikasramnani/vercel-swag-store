import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const query = search
    ? `search=${encodeURIComponent(search)}&limit=5`
    : "limit=5";

  const response = await fetch(
    `https://vercel-swag-store-api.vercel.app/api/products?${query}`,
    {
      headers: {
        "x-vercel-protection-bypass":
          process.env.VERCEL_PROTECTION_BYPASS ?? "",
      },
    },
  );
  const body = await response.json();
  const products = body.data;

  return (
    <main>
      <h1 className="text-3xl font-semibold">Search</h1>
      <p className="mt-2 text-zinc-400">Find products by name.</p>
      <form action="/search" className="mt-6 flex gap-2">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search products"
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          Search
        </button>
      </form>
      {products.length > 0 ? (
          <ul className="mt-8 divide-y divide-zinc-800">
            {products.map((product) => (
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
        ) : (
          <p className="mt-4 text-zinc-400">No products found.</p>
        )}
    </main>
  );
}