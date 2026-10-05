import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCart } from "../../cart/get-cart";

async function CartAfterPayment() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return <p className="mt-4 text-zinc-600">Your cart is empty.</p>;
  }

  return (
    <p className="mt-4 text-zinc-600">
      The cart still has items.{" "}
      <Link href="/cart" className="text-zinc-950 underline">
        Open the cart
      </Link>
    </p>
  );
}

export const metadata: Metadata = {
  title: "Payment successful",
};

export default function ThanksPage() {
  return (
    <main>
      <h1 className="text-3xl font-semibold">Payment successful</h1>
      <p className="mt-4 text-zinc-500">
        Practice checkout. Nothing was charged.
      </p>
      <Suspense fallback={<p className="mt-4 text-sm text-zinc-500">Checking the cart…</p>}>
        <CartAfterPayment />
      </Suspense>
      <p className="mt-6 flex gap-4 text-sm">
        <Link href="/cart" className="underline">
          View cart
        </Link>
        <Link href="/" className="underline">
          Keep shopping
        </Link>
      </p>
    </main>
  );
}
