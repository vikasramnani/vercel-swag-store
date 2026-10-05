import { cookies } from "next/headers";
import { swagApi, swagHeaders } from "./swag";

export type CartLine = {
  productId: string;
  quantity: number;
  lineTotal: number;
  name: string;
  slug: string;
  unitPrice: number;
  image: string;
};

export type CartView = {
  lines: CartLine[];
  subtotal: number;
  unitCount: number;
};

function emptyCart(): CartView {
  return { lines: [], subtotal: 0, unitCount: 0 };
}

export async function getCart(): Promise<CartView> {
  const jar = await cookies();
  const token = jar.get("cart-token")?.value;
  if (!token) return emptyCart();

  const response = await fetch(`${swagApi}/cart`, {
    headers: swagHeaders(token),
    cache: "no-store",
  });
  if (!response.ok) return emptyCart();

  const body = await response.json();
  const items = body.data?.items ?? [];
  const lines: CartLine[] = items.map(
    (item: {
      productId: string;
      quantity: number;
      lineTotal: number;
      product: { name: string; slug: string; price: number; images: string[] };
    }) => ({
      productId: item.productId,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      name: item.product.name,
      slug: item.product.slug,
      unitPrice: item.product.price,
      image: item.product.images[0] ?? "",
    }),
  );
  const unitCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return {
    lines,
    subtotal: Number(body.data?.subtotal ?? 0),
    unitCount,
  };
}

export function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
