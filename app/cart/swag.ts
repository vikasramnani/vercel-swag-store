export const swagApi = "https://vercel-swag-store-api.vercel.app/api";

export function swagHeaders(cartToken?: string) {
  const headers: Record<string, string> = {
    "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS ?? "",
  };
  if (cartToken) headers["x-cart-token"] = cartToken;
  return headers;
}
