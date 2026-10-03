# Instagram DM Assistant (byAdunni)

A retrieval-grounded auto-reply system: it answers incoming Instagram DM questions using real content pulled from [byadunni.com](https://byadunni.com) — prices, stock, shipping rates, FAQ answers — rather than letting a model guess or hallucinate.

## What's real here, and what isn't

I want to be precise about this rather than imply more than what's actually built:

**Real:**
- The knowledge base (`src/knowledgeBase.ts`) is content I fetched directly from byadunni.com's live FAQ, shipping policy, and product pages on 2026-10-02 — not invented. Prices, stock levels, shipping rates, and policy wording are accurate as of that date.
- The retrieval logic, reply generation, and webhook handler are fully real, tested code — not stubs.
- The webhook endpoints (`GET /webhook` for verification, `POST /webhook` for incoming messages) are built to **Meta's actual documented payload format** for Instagram Messaging — the same `hub.mode`/`hub.verify_token`/`hub.challenge` handshake and `object`/`entry[].messaging[]` structure a real Meta webhook would use.

**Simulated, and clearly marked as such in the code:**
- There is no live Instagram connection. A real integration needs a Meta Business/Developer account, app review, and a Page Access Token — none of which this project has. The tests send **simulated** webhook payloads shaped exactly like Meta's real ones, rather than receiving live DMs.
- Outgoing replies are **not** actually sent to Instagram. `src/sendApi.ts` contains a real, correct implementation of Meta's Send API call, but it only runs if a `PAGE_ACCESS_TOKEN` is set. Without one (the default), replies are recorded in-memory and logged instead — a "dry-run" mode, visible via `GET /debug/sent-replies`.
- The knowledge base is a static snapshot, not a live scrape on every request (see "Next steps" below for why, and what a production version would do differently).

The goal of this split: the parts that are hard to fake convincingly — the retrieval, the grounding, the webhook shape — are fully real and tested. The parts that genuinely require infrastructure I don't have access to are stubbed in an honest, clearly-labeled way rather than pretended away.

## How it works

1. A message comes in via `POST /webhook`, shaped like Meta's real Instagram Messaging payload.
2. The message text is run through `retrieve()` (`src/retrieval.ts`) — a simple keyword-overlap search (with lightweight stemming) over the knowledge base, returning the most relevant chunk(s).
3. The matched chunk(s) are passed to a reply client (`src/modelClient.ts`) which generates the actual reply:
   - **Mock backend** (default): stitches the top chunk into a template reply. No model call — proves the retrieval + grounding pipeline itself is correct.
   - **Anthropic backend**: sends the retrieved chunks to Claude with an explicit instruction to answer *only* from the provided shop info, and to defer to a human rather than guess if the info doesn't cover the question.
4. The reply is "sent" via `sendReply()` — dry-run (logged) by default, or a real Send API call if `PAGE_ACCESS_TOKEN` is set.

## Running it

```bash
cd backend
npm install
npm run dev          # http://localhost:4100, mock backend, dry-run sending
```

Test it directly without a webhook envelope:
```bash
curl -X POST http://localhost:4100/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How much is the Coffee bag?"}'
```

Simulate an incoming Instagram DM:
```bash
curl -X POST http://localhost:4100/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "id": "page123",
      "time": 1234567890,
      "messaging": [{
        "sender": {"id": "user_abc"},
        "recipient": {"id": "page123"},
        "timestamp": 1234567890,
        "message": {"mid": "m1", "text": "is the platinum barrel still in stock"}
      }]
    }]
  }'

# See what would have been sent back:
curl http://localhost:4100/debug/sent-replies
```

To use a real model instead of the mock:
```bash
export ANTHROPIC_API_KEY=sk-...
npm install @anthropic-ai/sdk
MODEL_BACKEND=anthropic npm run dev
```

## Testing

```bash
npm test     # 13 tests: retrieval accuracy, webhook verification, simulated DM handling, direct Q&A
```

Includes tests that assert specific real facts appear in generated replies (e.g. the Coffee bag's actual £95 price, the UK shipping rate of £4.99), not just that *a* reply was generated — so the tests would actually fail if the knowledge base or retrieval logic silently broke.

## Project structure

```
backend/
  src/
    knowledgeBase.ts   — real content scraped from byadunni.com
    retrieval.ts         — keyword-overlap search with lightweight stemming
    modelClient.ts        — pluggable mock / Anthropic reply generation
    sendApi.ts             — Meta Send API wrapper (dry-run by default)
    server.ts               — Express app: webhook verification + message handling
  test/
    server.test.ts         — retrieval, webhook, and simulated-DM tests
```

## Next steps (if this went further)

- **Live scraping instead of a static snapshot**: a scheduled job re-fetching the FAQ/shipping/product pages periodically (or a Shopify Admin API integration instead of scraping rendered HTML at all, which would be more reliable and give structured data directly).
- **Real retrieval instead of keyword overlap**: embeddings + a vector store (even a small one — this knowledge base is tiny) would catch semantically related questions that share no keywords, which the current approach misses by design.
- **Live Instagram connection**: registering a Meta app, completing review, and wiring up a real Page Access Token — the `sendApi.ts` code for this already exists, it's just never been exercised against Meta's real servers.

## Author

Fopefoluwa Ayo — [fopeayo@hotmail.com](mailto:fopeayo@hotmail.com)
