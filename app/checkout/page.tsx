import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { placeOrder } from "../cart/actions";
import { dollars, getCart } from "../cart/get-cart";

function PaymentForm() {
  return (
    <form action={placeOrder} className="mt-8 flex max-w-sm flex-col gap-4">
      <p className="text-sm text-zinc-400">
        Practice payment. Nothing is charged, and this always succeeds.
      </p>
      <label className="flex flex-col gap-1 text-sm">
        Name on card
        <input
          autoComplete="off"
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Card number
        <input
          inputMode="numeric"
          autoComplete="off"
          placeholder="4242 4242 4242 4242"
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
      </label>
      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Expiry
          <input
            autoComplete="off"
            placeholder="12/28"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          CVC
          <input
            autoComplete="off"
            placeholder="123"
            className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />
        </label>
      </div>
      <button
        type="submit"
        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
      >
        Pay
      </button>
    </form>
  );
}

async function CheckoutScreen() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <p className="mt-6 text-zinc-400">
        Your cart is empty.{" "}
        <Link href="/" className="text-white underline">
          Keep shopping
        </Link>
      </p>
    );
  }

  return (
    <>
      <ul className="mt-6 flex flex-col gap-2">
        {cart.lines.map((line) => (
          <li key={line.productId} className="flex justify-between gap-4">
            <span>
              {line.name} × {line.quantity}
            </span>
            <span>{dollars(line.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-lg">Subtotal {dollars(cart.subtotal)}</p>
      <PaymentForm />
    </>
  );
}

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <main>
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <Suspense fallback={<p className="mt-6 text-sm text-zinc-400">Loading checkout…</p>}>
        <CheckoutScreen />
      </Suspense>
    </main>
  );
}
