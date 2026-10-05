"use client";

import { useActionState } from "react";
import { addToCart } from "../cart/actions";
import { QuantitySelector } from "./quantity-selector";

export function AddToCartForm({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [state, submitAddToCart, pending] = useActionState(addToCart, null);
  const outOfStock = stock === 0;

  return (
    <form action={submitAddToCart} className="mt-4 flex flex-wrap items-center gap-4">
      <p className="text-sm text-zinc-500">{stock} in stock</p>
      <QuantitySelector stock={stock} />
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={outOfStock || pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
      >
        Add to Cart
      </button>
      {state?.message ? (
        <p className="text-sm text-zinc-600">{state.message}</p>
      ) : null}
    </form>
  );
}
