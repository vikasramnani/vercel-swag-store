import Link from "next/link";
import { getCart } from "../cart/get-cart";

export function CartLink({ count }: { count: number | null }) {
  const itemWord = count === 1 ? "item" : "items";
  const label = count === null ? "Cart" : `Cart, ${count} ${itemWord}`;

  return (
    <Link
      href="/cart"
      aria-label={label}
      className="inline-flex items-center gap-1 hover:underline"
    >
      Cart
      <span className="rounded-full bg-white px-1.5 text-xs font-semibold text-black">
        {count === null ? "…" : count}
      </span>
    </Link>
  );
}

export async function CartBadge() {
  const cart = await getCart();
  return <CartLink count={cart.unitCount} />;
}
