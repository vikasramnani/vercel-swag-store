import { getStock as loadStock } from "../products/get-stock";

// Live count for the model. The page's getStock stays uncached, so this call
// can return a different number every time.
export async function getStock(id: string) {
  const stock = await loadStock(id);
  return {
    stock: Number(stock?.stock ?? 0),
    inStock: Boolean(stock?.inStock),
  };
}
