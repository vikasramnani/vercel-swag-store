import Link from "next/link";

export function Header() {
  return (
    <header>
      <strong>Vercel Swag Store</strong>{" "}
      <Link href="/">Home</Link>{" "}
      <Link href="/search">Search</Link>
    </header>
  );
}