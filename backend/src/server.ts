import express from "express";
import { retrieve } from "./retrieval.js";
import { getReplyClient } from "./modelClient.js";
import { sendReply, getSentReplies, clearSentReplies } from "./sendApi.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4100;
const BACKEND = process.env.MODEL_BACKEND || "mock";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "dev-verify-token";

/**
 * Meta's webhook verification handshake. When you register a webhook URL
 * in the Meta App Dashboard, Meta sends this GET request once to confirm
 * you control the endpoint. This is real, standard behaviour — not
 * simulated — and is exactly what Meta's servers would send.
 */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

interface InstagramMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: { mid: string; text?: string };
}

interface InstagramWebhookPayload {
  object: string;
  entry: {
    id: string;
    time: number;
    messaging: InstagramMessagingEvent[];
  }[];
}

/**
 * Incoming message handler, matching Meta's actual Instagram Messaging
 * webhook payload shape (the same `object` / `entry[].messaging[]`
 * structure used by the Messenger Platform). Meta requires a fast 200
 * response, so the reply is generated and "sent" after acknowledging
 * receipt, matching real production behaviour.
 */
app.post("/webhook", async (req, res) => {
  const payload = req.body as InstagramWebhookPayload;

  if (payload.object !== "instagram") {
    return res.sendStatus(404);
  }

  res.status(200).send("EVENT_RECEIVED");

  const client = getReplyClient(BACKEND);

  for (const entry of payload.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const text = event.message?.text;
      if (!text) continue;

      const context = retrieve(text);
      const replyText = await client.generateReply(text, context);
      await sendReply(event.sender.id, replyText);
    }
  }
});

/**
 * Test/debug endpoints — not part of the real Instagram integration, but
 * how the test suite (and you, manually) can see what the pipeline would
 * have sent without needing live Meta credentials.
 */
app.get("/debug/sent-replies", (_req, res) => {
  res.json(getSentReplies());
});

app.post("/debug/clear-sent-replies", (_req, res) => {
  clearSentReplies();
  res.sendStatus(204);
});

/**
 * Direct Q&A endpoint — useful for testing retrieval + reply generation
 * synchronously without going through the async webhook flow at all.
 */
app.post("/api/ask", async (req, res) => {
  const { question } = req.body as { question?: string };
  if (!question) {
    return res.status(400).json({ error: "question is required" });
  }
  const context = retrieve(question);
  const client = getReplyClient(BACKEND);
  const reply = await client.generateReply(question, context);
  res.json({ question, reply, matchedChunks: context.map((c) => c.id) });
});

const isMain =
  (process.argv[1] && process.argv[1].endsWith("server.ts")) ||
  process.argv[1]?.endsWith("server.js");
if (isMain) {
  app.listen(PORT, () => {
    console.log(
      `Instagram DM assistant listening on http://localhost:${PORT} (backend: ${BACKEND})`
    );
  });
}

export { app };
