import Link from "next/link";
import { Suspense } from "react";
import { SearchBox } from "../components/search-box";

type SearchParams = Promise<{ search?: string; category?: string }>;

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
};

function productQuery(search?: string, category?: string) {
  const parts = ["limit=5"];
  if (search) {
    parts.push(`search=${encodeURIComponent(search)}`);
  }
  if (category) {
    parts.push(`category=${encodeURIComponent(category)}`);
  }
  return parts.join("&");
}

async function getCategories() {
  "use cache";
  const categoriesResponse = await fetch(
    "https://vercel-swag-store-api.vercel.app/api/categories",
    {
      headers: {
        "x-vercel-protection-bypass":
          process.env.VERCEL_PROTECTION_BYPASS ?? "",
      },
    },
  );
  const categoriesBody = await categoriesResponse.json();
  return categoriesBody.data;
}

async function SearchForm({
  searchParams,
  categories,
}: {
  searchParams: SearchParams;
  categories: { slug: string; name: string }[];
}) {
  const { search, category } = await searchParams;

  return (
    <form action="/search" className="mt-6 flex flex-wrap gap-2">
      <SearchBox wordInTheAddress={search ?? ""} />
      <select
        name="category"
        defaultValue={category ?? ""}
        className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
      >
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
      >
        Search
      </button>
    </form>
  );
}

function SearchFormFallback({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  return (
    <form action="/search" className="mt-6 flex flex-wrap gap-2">
      <input
        name="search"
        placeholder="Search products"
        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder:text-zinc-400 sm:w-auto sm:flex-1"
      />
      <select
        name="category"
        defaultValue=""
        className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
      >
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
      >
        Search
      </button>
    </form>
  );
}

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const { search, category } = await searchParams;

  const response = await fetch(
    `https://vercel-swag-store-api.vercel.app/api/products?${productQuery(search, category)}`,
    {
      headers: {
        "x-vercel-protection-bypass":
          process.env.VERCEL_PROTECTION_BYPASS ?? "",
      },
    },
  );
  const body = await response.json();
  const products = body.data as CatalogProduct[];

  if (products.length === 0) {
    return <p className="mt-4 text-zinc-400">No products found.</p>;
  }

  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {products.map((product) => (
        <li key={product.id}>
          <Link
            href={`/products/${product.slug}`}
            className="flex h-full flex-col gap-3 rounded-lg border border-zinc-800 p-3 hover:text-zinc-300"
          >
            <img
              src={product.images[0]}
              alt=""
              className="h-40 w-full rounded-md object-cover"
            />
            <span>{product.name}</span>
            <span>${(product.price / 100).toFixed(2)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const categories = await getCategories();

  return (
    <main>
      <h1 className="text-3xl font-semibold">Search</h1>
      <p className="mt-2 text-zinc-400">Find products by name.</p>
      <Suspense fallback={<SearchFormFallback categories={categories} />}>
        <SearchForm searchParams={searchParams} categories={categories} />
      </Suspense>
      <Suspense
        fallback={<p className="mt-8 text-sm text-zinc-400">Searching…</p>}
      >
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
