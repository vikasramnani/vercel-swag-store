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
      <p className="text-sm text-zinc-400">{stock} in stock</p>
      <QuantitySelector stock={stock} />
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={outOfStock || pending}
        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
      >
        Add to Cart
      </button>
      {state?.message ? (
        <p className="text-sm text-zinc-300">{state.message}</p>
      ) : null}
    </form>
  );
}
