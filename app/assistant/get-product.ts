import { getProduct as loadProduct } from "../products/get-product";

// The product page's getProduct returns the API object. The model gets the
// same shape search returns: name, path, dollar price, and photo, plus the description.
export async function getProduct(id: string) {
  const product = await loadProduct(id);
  if (!product?.name) return { product: null };

  return {
    product: {
      name: product.name,
      path: `/products/${product.slug}`,
      price: `$${(product.price / 100).toFixed(2)}`,
      image: product.images?.[0] ?? "",
      description: product.description,
    },
  };
}
