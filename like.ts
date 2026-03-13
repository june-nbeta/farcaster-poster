#!/usr/bin/env -S npx tsx
/**
 * Like a cast on Farcaster
 * Usage: tsx like.ts <cast-hash>
 * 
 * API: POST /v2/farcaster/reaction
 * Cost: Check Neynar dashboard (reaction endpoints typically 50-100 credits)
 */

import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

if (!API_KEY || !SIGNER_UUID) {
  console.error("Error: Missing NEYNAR_API_KEY or NEYNAR_SIGNER_UUID");
  process.exit(1);
}

async function likeCast(castHash: string) {
  const url = "https://api.neynar.com/v2/farcaster/reaction";
  
  const body = {
    reaction_type: "like",
    cast_hash: castHash,
    signer_uuid: SIGNER_UUID,
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
    success: true,
    castHash: data.cast?.hash || castHash,
    reactionType: data.reaction?.type || "like",
  };
}

// CLI usage
if (import.meta.main) {
  const castHash = process.argv[2];
  
  if (!castHash) {
    console.error("Usage: tsx like.ts <cast-hash>");
    console.error("Example: tsx like.ts 0xd68ff2d1ed2ea0bff1a8f05a0c9b566af41a9350");
    process.exit(1);
  }

  try {
    const result = await likeCast(castHash);
    console.log("✓ Liked cast successfully!");
    console.log("Cast Hash:", result.castHash);
  } catch (error: any) {
    console.error("Error liking cast:", error.message);
    process.exit(1);
  }
}

export { likeCast };
