#!/usr/bin/env -S npx tsx
/**
 * Read replies to a cast on Farcaster
 * Usage: tsx read-replies.ts <cast-hash> [--limit <n>]
 * 
 * API: GET /v1/castsByParent
 * Cost: 200 credits per request
 */

import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;

if (!API_KEY) {
  console.error("Error: Missing NEYNAR_API_KEY");
  process.exit(1);
}

interface Reply {
  hash: string;
  text: string;
  author: {
    username: string;
    display_name: string;
    fid: number;
  };
  timestamp: string;
  replies_count: number;
  reactions_count: number;
}

async function readReplies(castHash: string, limit: number = 20): Promise<Reply[]> {
  const url = new URL("https://api.neynar.com/v1/castsByParent");
  url.searchParams.append("parentHash", castHash);
  url.searchParams.append("limit", limit.toString());

  const response = await fetch(url.toString(), {
    headers: {
      "accept": "application/json",
      "api_key": API_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  
  return (data.casts || []).map((cast: any) => ({
    hash: cast.hash,
    text: cast.text,
    author: {
      username: cast.author?.username,
      display_name: cast.author?.display_name,
      fid: cast.author?.fid,
    },
    timestamp: cast.timestamp,
    replies_count: cast.replies?.count || 0,
    reactions_count: cast.reactions?.count || 0,
  }));
}

// CLI usage
if (import.meta.main) {
  const castHash = process.argv[2];
  const limitFlag = process.argv.indexOf("--limit");
  const limit = limitFlag > -1 ? parseInt(process.argv[limitFlag + 1]) || 20 : 20;
  
  if (!castHash || castHash.startsWith("--")) {
    console.error("Usage: tsx read-replies.ts <cast-hash> [--limit <n>]");
    console.error("Example: tsx read-replies.ts 0xd68ff2d1ed2ea0bff1a8f05a0c9b566af41a9350 --limit 10");
    process.exit(1);
  }

  try {
    const replies = await readReplies(castHash, limit);
    
    if (replies.length === 0) {
      console.log("No replies found.");
      process.exit(0);
    }

    console.log(`\n${replies.length} replies:\n`);
    
    replies.forEach((reply, i) => {
      console.log(`${i + 1}. @${reply.author.username} (${reply.author.display_name})`);
      console.log(`   ${reply.text.slice(0, 100)}${reply.text.length > 100 ? "..." : ""}`);
      console.log(`   ❤️ ${reply.reactions_count}  💬 ${reply.replies_count}  ${reply.timestamp}`);
      console.log(`   Hash: ${reply.hash}`);
      console.log();
    });
  } catch (error: any) {
    console.error("Error reading replies:", error.message);
    process.exit(1);
  }
}

export { readReplies };
