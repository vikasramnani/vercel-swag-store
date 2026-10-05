import { swagApi, swagHeaders } from "../cart/swag";

// Live count. A new call can return a different number. Do not cache this.
export async function getStock(id: string) {
  const response = await fetch(`${swagApi}/products/${id}/stock`, {
    headers: swagHeaders(),
    cache: "no-store",
  });
  const body = await response.json();
  return body.data;
}
