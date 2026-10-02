export default async function ProductPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    const { id } = await params;
  
    const response = await fetch(
      `https://vercel-swag-store-api.vercel.app/api/products/${id}`,
      {
        headers: {
          "x-vercel-protection-bypass":
            process.env.VERCEL_PROTECTION_BYPASS ?? "",
        },
      },
    );
  
    const body = await response.json();
    const product = body.data;
  
    const stockResponse = await fetch(
        `https://vercel-swag-store-api.vercel.app/api/products/${id}/stock`,
        {
          headers: {
            "x-vercel-protection-bypass":
              process.env.VERCEL_PROTECTION_BYPASS ?? "",
          },
        },
      );
      
      const stockBody = await stockResponse.json();
      const stock = stockBody.data;
    return (
      <main>
        <img src={product.images[0]} alt={product.name} width={400} />
        <h1>{product.name}</h1>
        <p>${(product.price / 100).toFixed(2)}</p>
        <p>{product.description}</p>
        <p>{stock.stock} in stock</p>
      </main>
    );
  }