import { swagApi, swagHeaders } from "../cart/swag";

const wordsThatAreNotProducts = new Set([
  "the",
  "and",
  "for",
  "under",
  "over",
  "with",
  "than",
  "less",
  "more",
  "below",
  "above",
  "from",
  "that",
  "this",
  "have",
  "want",
  "some",
  "any",
  "cheap",
]);

type FoundProduct = {
  name: string;
  path: string;
  price: string;
  image: string;
};

// The catalog matches one word inside the name. "black shirt" matches nothing,
// because the shirt is named "Black Crewneck T-Shirt". "shirt" matches it.
async function searchOneWord(word: string): Promise<FoundProduct[]> {
  const query = new URLSearchParams({ limit: "5", search: word });
  const response = await fetch(`${swagApi}/products?${query}`, {
    headers: swagHeaders(),
    cache: "no-store",
  });
  if (!response.ok) return [];

  const body = await response.json();
  const items = body.data ?? [];
  return items.map(
    (item: { name: string; slug: string; price: number; images: string[] }) => ({
      name: item.name,
      path: `/products/${item.slug}`,
      price: `$${(item.price / 100).toFixed(2)}`,
      image: item.images[0] ?? "",
    }),
  );
}

export async function searchProducts(word: string) {
  const wordsToSearch = [
    ...new Set(
      word
        .toLowerCase()
        .split(/[^a-z0-9-]+/)
        .filter((part) => part.length >= 3 && !wordsThatAreNotProducts.has(part)),
    ),
  ].slice(0, 3);

  if (wordsToSearch.length === 0) return { products: [] };

  const lists = await Promise.all(wordsToSearch.map((part) => searchOneWord(part)));
  const seen = new Set<string>();
  const products: FoundProduct[] = [];
  for (const list of lists) {
    for (const product of list) {
      if (seen.has(product.path)) continue;
      seen.add(product.path);
      products.push(product);
    }
  }

  return { products };
}
