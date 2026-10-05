import Link from "next/link";
import { Suspense } from "react";
import { removeCartItem, updateCartQuantity } from "./actions";
import { dollars, getCart, type CartLine } from "./get-cart";

function QuantityControls({ line }: { line: CartLine }) {
  return (
    <div className="flex items-center gap-2">
      <form action={updateCartQuantity}>
        <input type="hidden" name="productId" value={line.productId} />
        <input type="hidden" name="quantity" value={line.quantity - 1} />
        <button
          type="submit"
          disabled={line.quantity <= 1}
          aria-label={`Decrease ${line.name}`}
          className="h-8 w-8 rounded-md border border-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-600"
        >
          −
        </button>
      </form>
      <span className="w-6 text-center">{line.quantity}</span>
      <form action={updateCartQuantity}>
        <input type="hidden" name="productId" value={line.productId} />
        <input type="hidden" name="quantity" value={line.quantity + 1} />
        <button
          type="submit"
          aria-label={`Increase ${line.name}`}
          className="h-8 w-8 rounded-md border border-zinc-700"
        >
          +
        </button>
      </form>
    </div>
  );
}

function CartRow({ line }: { line: CartLine }) {
  return (
    <li className="flex gap-4 rounded-lg border border-zinc-800 p-3">
      <Link href={`/products/${line.slug}`} className="shrink-0">
        <img
          src={line.image}
          alt=""
          className="h-24 w-24 rounded-md object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2">
        <Link href={`/products/${line.slug}`} className="hover:text-zinc-300">
          {line.name}
        </Link>
        <p className="text-sm text-zinc-400">{dollars(line.unitPrice)} each</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <QuantityControls line={line} />
          <p>{dollars(line.lineTotal)}</p>
        </div>
        <form action={removeCartItem}>
          <input type="hidden" name="productId" value={line.productId} />
          <button type="submit" className="text-sm text-zinc-400 hover:text-white">
            Remove
          </button>
        </form>
      </div>
    </li>
  );
}

async function CartContents() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return <p className="mt-6 text-zinc-400">Your cart is empty.</p>;
  }

  return (
    <>
      <ul className="mt-6 flex flex-col gap-4">
        {cart.lines.map((line) => (
          <CartRow key={line.productId} line={line} />
        ))}
      </ul>
      <p className="mt-6 text-lg">Subtotal {dollars(cart.subtotal)}</p>
      <Link
        href="/checkout"
        className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
      >
        Checkout
      </Link>
    </>
  );
}

export default function CartPage() {
  return (
    <main>
      <h1 className="text-3xl font-semibold">Cart</h1>
      <Suspense fallback={<p className="mt-6 text-sm text-zinc-400">Loading cart…</p>}>
        <CartContents />
      </Suspense>
    </main>
  );
}
