import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CategorySelect } from "../components/category-select";
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
      <CategorySelect
        categories={categories}
        selectedCategory={category ?? ""}
      />
      <button
        type="submit"
        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
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
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 placeholder:text-zinc-400 sm:w-auto sm:flex-1"
      />
      <select
        name="category"
        defaultValue=""
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950"
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
        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
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
    return <p className="mt-4 text-zinc-500">No products found.</p>;
  }

  return (
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
  );
}

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const categories = await getCategories();

  return (
    <main>
      <h1 className="text-3xl font-semibold">Search</h1>
      <p className="mt-2 text-zinc-500">Find products by name.</p>
      <Suspense fallback={<SearchFormFallback categories={categories} />}>
        <SearchForm searchParams={searchParams} categories={categories} />
      </Suspense>
      <Suspense
        fallback={<p className="mt-8 text-sm text-zinc-500">Searching…</p>}
      >
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
