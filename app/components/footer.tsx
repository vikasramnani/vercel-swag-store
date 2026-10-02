import { Suspense } from "react";
import { connection } from "next/server";

async function CopyrightYear() {
  await connection();
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800 px-6 py-4 text-sm text-zinc-400">
      <p>
        ©{" "}
        <Suspense fallback={null}>
          <CopyrightYear />
        </Suspense>{" "}
        Vercel Swag Store
      </p>
    </footer>
  );
}
