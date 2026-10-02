import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center justify-between bg-zinc-950 px-6 py-4 text-white">
      <Link href="/" className="text-lg font-semibold">
        Vercel Swag Store
      </Link>
      <nav className="flex gap-4 text-sm">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/search" className="hover:underline">
          Search
        </Link>
      </nav>
    </header>
  );
}