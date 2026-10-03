/**
 * Wrapper around Meta's Send API (the real endpoint Instagram/Messenger
 * use to deliver a reply back to a conversation):
 *   POST https://graph.facebook.com/v21.0/me/messages
 *     ?access_token=<PAGE_ACCESS_TOKEN>
 *   body: { recipient: { id: <psid> }, message: { text: <reply> } }
 *
 * This is real, correct code for that call — but it only runs if
 * PAGE_ACCESS_TOKEN is actually set, which requires a connected Meta
 * Business/Developer account and app review. Without it (the default
 * here), replies are recorded in-memory instead of sent, so the rest of
 * the pipeline (retrieval, grounding, reply generation) is still fully
 * real and testable without needing that access.
 */

export interface SentReply {
  recipientId: string;
  text: string;
  sentAt: string;
  mode: "dry-run" | "live";
}

const sentReplies: SentReply[] = [];

export function getSentReplies(): SentReply[] {
  return sentReplies;
}

export function clearSentReplies(): void {
  sentReplies.length = 0;
}

export async function sendReply(recipientId: string, text: string): Promise<SentReply> {
  const accessToken = process.env.PAGE_ACCESS_TOKEN;

  if (!accessToken) {
    const record: SentReply = {
      recipientId,
      text,
      sentAt: new Date().toISOString(),
      mode: "dry-run",
    };
    sentReplies.push(record);
    console.log(`[dry-run] Would send to ${recipientId}: "${text}"`);
    return record;
  }

  // Live path — real Graph API call, untestable here without a real
  // Meta Business account, Page Access Token, and app review.
  const res = await fetch(
    `https://graph.facebook.com/v21.0/me/messages?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Send API error (${res.status}): ${body}`);
  }

  const record: SentReply = {
    recipientId,
    text,
    sentAt: new Date().toISOString(),
    mode: "live",
  };
  sentReplies.push(record);
  return record;
}
