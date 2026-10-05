import Link from "next/link";
import { Suspense } from "react";
import { AssistantPanel } from "./assistant-panel";
import { CartBadge, CartLink } from "./cart-badge";

export function Header() {
  return (
    <header className="flex items-center justify-between bg-zinc-950 px-6 py-4 text-white">
      <Link href="/" className="text-lg font-semibold">
        Vercel Swag Store
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/search" className="hover:underline">
          Search
        </Link>
        <AssistantPanel />
        <Suspense fallback={<CartLink count={null} />}>
          <CartBadge />
        </Suspense>
      </nav>
    </header>
  );
}