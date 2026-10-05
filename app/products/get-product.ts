import { swagApi, swagHeaders } from "../cart/swag";

// The product page and the assistant both call this. "use cache" saves one
// result per id, so a second look at the same product can skip the API.
export async function getProduct(id: string) {
  "use cache";
  const response = await fetch(`${swagApi}/products/${id}`, {
    headers: swagHeaders(),
  });
  const body = await response.json();
  return body.data;
}
