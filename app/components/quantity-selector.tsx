"use client";

import { useState } from "react";

export function QuantitySelector({ stock }: { stock: number }) {
  const max = Math.max(0, Math.floor(stock));
  const min = max === 0 ? 0 : 1;
  const [quantity, setQuantity] = useState(min);
  const shown = max === 0 ? 0 : Math.min(max, Math.max(min, quantity));

  return (
    <label className="flex items-center gap-3 text-sm text-zinc-600">
      Quantity
      <input
        type="number"
        name="quantity"
        min={min}
        max={max}
        value={shown}
        disabled={max === 0}
        onChange={(event) => {
          if (max === 0) {
            setQuantity(0);
            return;
          }
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) {
            setQuantity(min);
            return;
          }
          setQuantity(Math.min(max, Math.max(min, next)));
        }}
        className="w-20 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 disabled:cursor-not-allowed disabled:text-zinc-400"
      />
    </label>
  );
}
