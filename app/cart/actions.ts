"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { swagApi, swagHeaders } from "./swag";

export type AddToCartState = { message: string } | null;

function rememberCart(
  jar: Awaited<ReturnType<typeof cookies>>,
  token: string,
) {
  jar.set("cart-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });
}

async function errorMessage(response: Response) {
  try {
    const body = await response.json();
    const message = body?.error?.message;
    return typeof message === "string" ? message : undefined;
  } catch {
    return undefined;
  }
}

export async function addToCart(
  _previous: AddToCartState,
  formData: FormData,
): Promise<AddToCartState> {
  const productKey = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity"));
  if (!productKey || !Number.isInteger(quantity) || quantity < 1) {
    return { message: "Choose a quantity of at least 1." };
  }

  const stockResponse = await fetch(`${swagApi}/products/${productKey}/stock`, {
    headers: swagHeaders(),
    cache: "no-store",
  });
  const stockBody = await stockResponse.json();
  const available = Number(stockBody.data?.stock ?? 0);
  const productId = String(stockBody.data?.productId ?? productKey);
  if (quantity > available) {
    return {
      message:
        available === 0
          ? "None left in stock."
          : `Only ${available} in stock.`,
    };
  }

  const jar = await cookies();
  let token = jar.get("cart-token")?.value;
  if (!token) {
    const created = await fetch(`${swagApi}/cart/create`, {
      method: "POST",
      headers: swagHeaders(),
      cache: "no-store",
    });
    token = created.headers.get("x-cart-token") ?? "";
    if (!created.ok || !token) {
      return { message: "Could not start a cart." };
    }
  }
  rememberCart(jar, token);

  const added = await fetch(`${swagApi}/cart`, {
    method: "POST",
    headers: {
      ...swagHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
    cache: "no-store",
  });
  if (!added.ok) {
    return { message: (await errorMessage(added)) ?? "Could not add this product." };
  }

  revalidatePath("/", "layout");
  return { message: "Added to cart." };
}

export async function updateCartQuantity(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity"));
  if (!productId || !Number.isInteger(quantity) || quantity < 1) return;

  const jar = await cookies();
  const token = jar.get("cart-token")?.value;
  if (!token) return;

  const response = await fetch(`${swagApi}/cart/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: {
      ...swagHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
    cache: "no-store",
  });
  if (!response.ok) return;

  rememberCart(jar, token);
  revalidatePath("/", "layout");
}

export async function removeCartItem(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  const jar = await cookies();
  const token = jar.get("cart-token")?.value;
  if (!token) return;

  const response = await fetch(`${swagApi}/cart/${encodeURIComponent(productId)}`, {
    method: "DELETE",
    headers: swagHeaders(token),
    cache: "no-store",
  });
  if (!response.ok) return;

  rememberCart(jar, token);
  revalidatePath("/", "layout");
}
