"use client";

// Runs in the browser. When the shopper picks a category, the address updates.
// It does not fetch. The word already in the box is kept when it is 3 characters or more.

import { useRouter } from "next/navigation";
import { buildSearchAddress } from "./search-box";

export function CategorySelect({
  categories,
  selectedCategory,
}: {
  categories: { slug: string; name: string }[];
  selectedCategory: string;
}) {
  const router = useRouter();

  function whenCategoryChanges(event: React.ChangeEvent<HTMLSelectElement>) {
    const formAroundThisDropdown = event.currentTarget.form;
    const lettersInTheBox = formAroundThisDropdown
      ? String(new FormData(formAroundThisDropdown).get("search") ?? "")
      : "";
    router.replace(buildSearchAddress(lettersInTheBox, formAroundThisDropdown));
  }

  return (
    <select
      key={selectedCategory}
      name="category"
      defaultValue={selectedCategory}
      onChange={whenCategoryChanges}
      className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
    >
      <option value="">All categories</option>
      {categories.map((item) => (
        <option key={item.slug} value={item.slug}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
