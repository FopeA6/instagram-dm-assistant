import type { ScoredChunk } from "./retrieval.js";

export interface ReplyClient {
  generateReply(question: string, context: ScoredChunk[]): Promise<string>;
}

/**
 * Deterministic mock: stitches the top retrieved chunk(s) into a reply
 * template. No model call — this is what proves the retrieval + grounding
 * pipeline works correctly, independent of any LLM's behaviour.
 */
export class MockReplyClient implements ReplyClient {
  async generateReply(question: string, context: ScoredChunk[]): Promise<string> {
    if (context.length === 0) {
      return (
        "Thanks for your message! I couldn't find a specific answer to that in " +
        "our shop info — our team will follow up directly. In the meantime you " +
        "can always reach us at info@byadunni.com."
      );
    }

    const top = context[0];
    return `Hi! ${top.text} Let us know if you have any other questions 💛`;
  }
}

/**
 * Real backend. Requires `npm install @anthropic-ai/sdk` and
 * ANTHROPIC_API_KEY set in the environment.
 */
export class AnthropicReplyClient implements ReplyClient {
  private model: string;

  constructor(model = "claude-3-5-haiku-latest") {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Export it, or use the mock backend."
      );
    }
    this.model = model;
  }

  async generateReply(question: string, context: ScoredChunk[]): Promise<string> {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const contextText = context.length
      ? context.map((c) => `[${c.title}] ${c.text}`).join("\n\n")
      : "No matching shop info was found for this question.";

    const systemPrompt =
      "You are a friendly Instagram DM assistant for byAdunni, a handmade beaded " +
      "bag brand. Answer the customer's question using ONLY the shop info " +
      "provided below — never invent prices, stock levels, or policies that " +
      "aren't in it. If the info provided doesn't answer the question, say you'll " +
      "get a team member to follow up rather than guessing. Keep the tone warm " +
      "and brief, like a real Instagram DM reply, not a formal email.\n\n" +
      `Shop info:\n${contextText}`;

    const response = await client.messages.create({
      model: this.model,
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
    });

    return response.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("");
  }
}

export function getReplyClient(backend: string): ReplyClient {
  if (backend === "mock") return new MockReplyClient();
  if (backend === "anthropic") return new AnthropicReplyClient();
  throw new Error(`Unknown backend '${backend}'. Use 'mock' or 'anthropic'.`);
}
