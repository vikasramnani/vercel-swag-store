import { getProduct as loadProduct } from "../products/get-product";

// Records what the shopper would add. The cart is not written here.
// Yes on the panel calls the same add action as the product page.
export async function proposeAdd(id: string, quantity: number) {
  const product = await loadProduct(id);
  if (!product?.slug) return { proposal: null };

  return {
    proposal: {
      name: product.name,
      productId: product.slug,
      quantity,
      path: `/products/${product.slug}`,
    },
  };
}
