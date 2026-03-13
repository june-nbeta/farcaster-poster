#!/usr/bin/env -S npx tsx
/**
 * Reply to a cast on Farcaster
 * Usage: tsx reply.ts <parent-cast-hash> "Your reply text"
 * 
 * API: POST /v2/farcaster/cast
 * Cost: 150 credits
 */

import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

if (!API_KEY || !SIGNER_UUID) {
  console.error("Error: Missing NEYNAR_API_KEY or NEYNAR_SIGNER_UUID");
  process.exit(1);
}

async function replyToCast(parentHash: string, text: string) {
  if (text.length > 140) {
    throw new Error("Reply exceeds 140 character limit (use threads for longer content)");
  }

  const url = "https://api.neynar.com/v2/farcaster/cast";
  
  const body = {
    text: text.trim(),
    signer_uuid: SIGNER_UUID,
    parent: parentHash,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api_key": API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  
  return {
    hash: data.cast.hash,
    text: data.cast.text,
    parentHash: parentHash,
    username: data.cast.author.username,
    url: `https://farcaster.xyz/${data.cast.author.username}/${data.cast.hash.slice(0, 10)}`,
  };
}

// CLI usage
if (import.meta.main) {
  const parentHash = process.argv[2];
  const text = process.argv.slice(3).join(" ");
  
  if (!parentHash || !text) {
    console.error("Usage: tsx reply.ts <parent-cast-hash> \"Your reply text\"");
    console.error("Example: tsx reply.ts 0xd68ff2d1ed2ea0bff1a8f05a0c9b566af41a9350 \"great insight!\"");
    process.exit(1);
  }

  try {
    const result = await replyToCast(parentHash, text);
    console.log("✓ Reply posted successfully!");
    console.log("Hash:", result.hash);
    console.log("URL:", result.url);
  } catch (error: any) {
    console.error("Error posting reply:", error.message);
    process.exit(1);
  }
}

export { replyToCast };
