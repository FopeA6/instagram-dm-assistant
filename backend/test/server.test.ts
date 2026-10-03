import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/server.js";
import { retrieve } from "../src/retrieval.js";
import { clearSentReplies, getSentReplies } from "../src/sendApi.js";

beforeEach(() => {
  clearSentReplies();
});

describe("retrieval", () => {
  it("surfaces the Platinum Barrel chunk for a price question", () => {
    const results = retrieve("How much is the Platinum Barrel?");
    expect(results.some((r) => r.id === "product_platinum_barrel")).toBe(true);
  });

  it("surfaces UK shipping info for a UK delivery question", () => {
    const results = retrieve("How much is UK shipping?");
    expect(results.some((r) => r.id === "shipping_uk")).toBe(true);
  });

  it("surfaces the returns policy for a refund question", () => {
    const results = retrieve("Can I return my bag?");
    expect(results.some((r) => r.id === "faq_final_sale")).toBe(true);
  });

  it("returns nothing for a completely unrelated question", () => {
    const results = retrieve("xyz qwerty nonsense gibberish");
    expect(results).toHaveLength(0);
  });
});

describe("GET /webhook (Meta verification handshake)", () => {
  it("echoes the challenge when mode and token are correct", async () => {
    const res = await request(app).get("/webhook").query({
      "hub.mode": "subscribe",
      "hub.verify_token": "dev-verify-token",
      "hub.challenge": "12345",
    });
    expect(res.status).toBe(200);
    expect(res.text).toBe("12345");
  });

  it("rejects an incorrect verify token", async () => {
    const res = await request(app).get("/webhook").query({
      "hub.mode": "subscribe",
      "hub.verify_token": "wrong-token",
      "hub.challenge": "12345",
    });
    expect(res.status).toBe(403);
  });
});

describe("POST /webhook (simulated incoming Instagram DMs)", () => {
  it("acks immediately with 200 EVENT_RECEIVED", async () => {
    const res = await request(app)
      .post("/webhook")
      .send({
        object: "instagram",
        entry: [
          {
            id: "page123",
            time: Date.now(),
            messaging: [
              {
                sender: { id: "user_abc" },
                recipient: { id: "page123" },
                timestamp: Date.now(),
                message: { mid: "m1", text: "Do you ship to the US?" },
              },
            ],
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.text).toBe("EVENT_RECEIVED");
  });

  it("rejects payloads that aren't the instagram object type", async () => {
    const res = await request(app)
      .post("/webhook")
      .send({ object: "page", entry: [] });
    expect(res.status).toBe(404);
  });

  it("generates and records a grounded reply for a real product question", async () => {
    await request(app)
      .post("/webhook")
      .send({
        object: "instagram",
        entry: [
          {
            id: "page123",
            time: Date.now(),
            messaging: [
              {
                sender: { id: "user_price_check" },
                recipient: { id: "page123" },
                timestamp: Date.now(),
                message: { mid: "m2", text: "how much is the Coffee bag" },
              },
            ],
          },
        ],
      });

    // The async reply generation runs after the 200 is sent, so give it a tick.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const sent = getSentReplies();
    expect(sent).toHaveLength(1);
    expect(sent[0].recipientId).toBe("user_price_check");
    expect(sent[0].text).toContain("£95");
    expect(sent[0].mode).toBe("dry-run");
  });

  it("handles multiple messages across entries", async () => {
    await request(app)
      .post("/webhook")
      .send({
        object: "instagram",
        entry: [
          {
            id: "page123",
            time: Date.now(),
            messaging: [
              {
                sender: { id: "user_1" },
                recipient: { id: "page123" },
                timestamp: Date.now(),
                message: { mid: "m3", text: "do you accept returns" },
              },
            ],
          },
          {
            id: "page123",
            time: Date.now(),
            messaging: [
              {
                sender: { id: "user_2" },
                recipient: { id: "page123" },
                timestamp: Date.now(),
                message: { mid: "m4", text: "how much is UK shipping" },
              },
            ],
          },
        ],
      });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const sent = getSentReplies();
    expect(sent).toHaveLength(2);
    expect(sent.find((s) => s.recipientId === "user_1")?.text).toContain("handmade");
    expect(sent.find((s) => s.recipientId === "user_2")?.text).toContain("£4.99");
  });

  it("ignores non-text events (e.g. a read receipt) without crashing", async () => {
    const res = await request(app)
      .post("/webhook")
      .send({
        object: "instagram",
        entry: [
          {
            id: "page123",
            time: Date.now(),
            messaging: [
              {
                sender: { id: "user_x" },
                recipient: { id: "page123" },
                timestamp: Date.now(),
                // no `message` field — simulates a delivery/read receipt event
              },
            ],
          },
        ],
      });
    expect(res.status).toBe(200);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(getSentReplies()).toHaveLength(0);
  });
});

describe("POST /api/ask (synchronous Q&A, no webhook envelope)", () => {
  it("answers a real question grounded in scraped shop data", async () => {
    const res = await request(app)
      .post("/api/ask")
      .send({ question: "What fits inside the Platinum Barrel?" });
    expect(res.status).toBe(200);
    expect(res.body.reply).toContain("lip gloss");
    expect(res.body.matchedChunks).toContain("product_platinum_barrel");
  });

  it("returns 400 when question is missing", async () => {
    const res = await request(app).post("/api/ask").send({});
    expect(res.status).toBe(400);
  });
});
