"use client";

import Link from "next/link";
import { useActionState, useState, useTransition, type FormEvent } from "react";
import {
  askAssistant,
  type AddProposal,
  type AssistantProduct,
} from "../assistant/ask";
import { addToCart } from "../cart/actions";

type ChatLine = {
  who: "shopper" | "assistant";
  text: string;
  products: AssistantProduct[];
  toolNames: string[];
  proposals: AddProposal[];
};

// This file draws the chat. It does not call the swag API and it does not see a key.
export function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [pending, startSend] = useTransition();

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const sentence = String(new FormData(form).get("sentence") ?? "").trim();
    if (!sentence || pending) return;
    form.reset();
    setLines((current) => [
      ...current,
      { who: "shopper", text: sentence, products: [], toolNames: [], proposals: [] },
    ]);
    startSend(async () => {
      const answer = await askAssistant(sentence);
      setLines((current) => [
        ...current,
        {
          who: "assistant",
          text: answer.reply,
          products: answer.products,
          toolNames: answer.toolNames,
          proposals: answer.proposals,
        },
      ]);
    });
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="hover:underline"
      >
        Assistant
      </button>
      {open ? (
        <section className="fixed top-16 right-4 z-20 flex w-[min(24rem,calc(100vw-2rem))] flex-col rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-lg">
          <div className="flex max-h-96 flex-col gap-3 overflow-y-auto p-4">
            {lines.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Ask for a product. Matches show up as cards you can open.
              </p>
            ) : null}
            {lines.map((line, index) => (
              <ChatBubble key={index} line={line} />
            ))}
            {pending ? <p className="text-sm text-zinc-500">Looking…</p> : null}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-zinc-200 p-3">
            <input
              name="sentence"
              aria-label="Ask the shop"
              placeholder="a black shirt under $40"
              className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
            >
              Send
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}

function ChatBubble({ line }: { line: ChatLine }) {
  const mine = line.who === "shopper";
  return (
    <div className={mine ? "self-end" : "self-start"}>
      <div
        className={
          mine
            ? "rounded-lg bg-zinc-950 px-3 py-2 text-sm text-white"
            : "rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-950"
        }
      >
        <ReplyText text={line.text} />
      </div>
      {line.toolNames.length > 0 ? (
        <p className="mt-1 text-sm text-zinc-500">Tools: {line.toolNames.join(", ")}</p>
      ) : null}
      {line.products.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-2">
          {line.products.map((product) => (
            <li key={product.path}>
              <Link
                href={product.path}
                className="flex items-center gap-3 rounded-md border border-zinc-200 p-2 hover:border-zinc-400"
              >
                <img
                  src={product.image}
                  alt=""
                  className="h-16 w-16 rounded object-contain"
                />
                <span>
                  <span className="block text-sm">{product.name}</span>
                  <span className="block text-sm text-zinc-500">{product.price}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {line.proposals.map((proposal) => (
        <YesButton key={`${proposal.productId}-${proposal.quantity}`} proposal={proposal} />
      ))}
    </div>
  );
}

function YesButton({ proposal }: { proposal: AddProposal }) {
  const [state, submitAdd, pending] = useActionState(addToCart, null);
  const added = state?.message === "Added to cart.";

  return (
    <form action={submitAdd} className="mt-2 flex flex-wrap items-center gap-2">
      <input type="hidden" name="productId" value={proposal.productId} />
      <input type="hidden" name="quantity" value={proposal.quantity} />
      <p className="text-sm text-zinc-700">
        Add {proposal.quantity} {proposal.name}?
      </p>
      <button
        type="submit"
        disabled={pending || added}
        className="rounded-md bg-black px-3 py-1 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
      >
        {added ? "Added" : "Yes"}
      </button>
      {state?.message ? <p className="text-sm text-zinc-600">{state.message}</p> : null}
    </form>
  );
}

function ReplyText({ text }: { text: string }) {
  const readable = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\*\*/g, "");
  const parts = readable.split(/(\/products\/[a-z0-9-]+)/g);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, index) =>
        part.startsWith("/products/") ? (
          <Link key={index} href={part} className="underline">
            {part}
          </Link>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  );
}
