import Link from "next/link";

export default async function Home() {
  const response = await fetch(
    "https://vercel-swag-store-api.vercel.app/api/products?featured=true",
    {
      headers: {
        "x-vercel-protection-bypass":
          process.env.VERCEL_PROTECTION_BYPASS ?? "",
      },
    },
  );

  const body = await response.json();

  const promoResponse = await fetch(
    "https://vercel-swag-store-api.vercel.app/api/promotions",
    {
      headers: {
        "x-vercel-protection-bypass":
          process.env.VERCEL_PROTECTION_BYPASS ?? "",
      },
    },
  );
  
  const promoBody = await promoResponse.json();
  const promo = promoBody.data;

  return (
    <main>
      <h1>Vercel Swag Store</h1>
      <p>Official Vercel merchandise.</p>
      <p>
  {promo.title}: {promo.description} Code {promo.code}
</p>
      <ul>
        {body.data.map((product) => (
         <li key={product.id}>
         <Link href={`/products/${product.slug}`}>
           {product.name} — ${(product.price / 100).toFixed(2)}
         </Link>
       </li>
          
        ))}
      </ul>
    </main>
  );
}