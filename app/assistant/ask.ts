"use server";

import { generateText, isStepCount, tool } from "ai";
import { z } from "zod";
import { getProduct } from "../products/get-product";
import { getStock } from "../products/get-stock";
import { searchProducts } from "./search-products";

export type AssistantProduct = {
  name: string;
  path: string;
  price: string;
  image: string;
};

export type AddProposal = {
  name: string;
  productId: string;
  quantity: number;
  path: string;
};

export type AssistantReply = {
  reply: string;
  toolNames: string[];
  products: AssistantProduct[];
  proposals: AddProposal[];
};

const assistantModel = "openai/gpt-4o-mini";

// The browser sends the sentence. This function sends it to the model,
// runs searchProducts when the model picks that name, then returns the reply.
function productsFromTheSearch(steps: { toolResults: { output: unknown }[] }[]) {
  const found: AssistantProduct[] = [];
  for (const step of steps) {
    for (const toolResult of step.toolResults) {
      const output = toolResult.output as {
        products?: AssistantProduct[];
        product?: AssistantProduct | null;
      };
      const listed = [...(output.products ?? []), output.product].filter(
        (product): product is AssistantProduct => Boolean(product?.path),
      );
      for (const product of listed) {
        if (!product?.path || found.some((item) => item.path === product.path)) continue;
        found.push(product);
      }
    }
  }
  return found;
}

function proposalsFromTheSteps(steps: { toolResults: { output: unknown }[] }[]) {
  const proposals: AddProposal[] = [];
  for (const step of steps) {
    for (const toolResult of step.toolResults) {
      const output = toolResult.output as { proposal?: AddProposal | null };
      const proposal = output.proposal;
      if (!proposal?.productId || proposal.quantity < 1) continue;
      proposals.push(proposal);
    }
  }
  return proposals;
}

export async function askAssistant(sentence: string): Promise<AssistantReply> {
  const question = sentence.trim();
  if (!question) {
    return {
      reply: "Type a question about the store.",
      toolNames: [],
      products: [],
      proposals: [],
    };
  }
  if (!process.env.AI_GATEWAY_API_KEY) {
    return {
      reply: "The model key is not set. Add AI_GATEWAY_API_KEY to .env.local.",
      toolNames: [],
      products: [],
      proposals: [],
    };
  }

  try {
    const result = await generateText({
      model: assistantModel,
      stopWhen: isStepCount(5),
      system: [
        "You are the shop assistant for the Vercel Swag Store.",
        "Use searchProducts. The catalog matches a word inside the product name, so pass the kind of product, such as shirt.",
        "A phrase is searched as each word. Pick the returned products that fit the color and the price in the question.",
        "Write a short sentence in plain text. On its own line, copy the path of each product you recommend.",
        "The page draws a photo card for each path. A product without its path is not shown.",
        "If none of the returned products fit, say the store does not have that.",
        "Use getProduct with the slug when the shopper wants the description of one product.",
        "Use getStock with the slug for how many are available. The count can change on every call. Say the number.",
        "When the shopper asks to add a product, call proposeAdd with the slug and the quantity.",
        "Then ask them to click Yes. Do not say the item is in the cart. You cannot add it yourself.",
      ].join(" "),
      prompt: question,
      tools: {
        searchProducts: tool({
          description:
            "Search the store by a product word such as shirt or bottle. A phrase is searched as each word. Each word returns at most 5 products whose name contains that word.",
          inputSchema: z.object({
            word: z.string().describe("Product word, such as shirt"),
          }),
          execute: async ({ word }) => searchProducts(word),
        }),
        getProduct: tool({
          description:
            "Open one product by its slug, such as black-crewneck-t-shirt. Returns the name, dollar price, description, and path.",
          inputSchema: z.object({
            id: z.string().describe("Product slug or id"),
          }),
          execute: async ({ id }) => {
            const product = await getProduct(id);
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
          },
        }),
        getStock: tool({
          description:
            "Read the live stock count for one product slug. The number can change on every call.",
          inputSchema: z.object({
            id: z.string().describe("Product slug or id"),
          }),
          execute: async ({ id }) => {
            const stock = await getStock(id);
            return {
              stock: Number(stock?.stock ?? 0),
              inStock: Boolean(stock?.inStock),
            };
          },
        }),
        proposeAdd: tool({
          description:
            "Ask the shopper to confirm adding one product. Does not change the cart. Pass the product slug and a quantity of at least 1.",
          inputSchema: z.object({
            id: z.string().describe("Product slug or id"),
            quantity: z.number().int().min(1).describe("How many to add"),
          }),
          execute: async ({ id, quantity }) => {
            const product = await getProduct(id);
            if (!product?.slug) return { proposal: null };
            return {
              proposal: {
                name: product.name,
                productId: product.slug,
                quantity,
                path: `/products/${product.slug}`,
              },
            };
          },
        }),
      },
    });

    const toolNames = result.steps.flatMap((step) =>
      step.toolCalls.map((call) => call.toolName),
    );
    const reply = result.text || "No reply.";
    const found = productsFromTheSearch(result.steps);
    const products = found.filter((product) => reply.includes(product.path));
    const proposals = proposalsFromTheSteps(result.steps);

    return { reply, toolNames, products, proposals };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("credit card")) {
      return {
        reply:
          "The model key is set. AI Gateway needs a credit card on the Vercel team before it will answer. Add the card under AI Gateway, then send again.",
        toolNames: [],
        products: [],
        proposals: [],
      };
    }
    return {
      reply: "The assistant could not answer.",
      toolNames: [],
      products: [],
      proposals: [],
    };
  }
}
