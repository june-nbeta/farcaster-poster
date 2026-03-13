#!/usr/bin/env -S npx tsx
/**
 * Get user's feed (their casts) from Farcaster
 * Usage: tsx get-feed.ts [--username <username>] [--fid <fid>] [--limit <n>] [--cursor <cursor>]
 * 
 * API: GET /v2/farcaster/feed/user/casts
 * Cost: 4 credits
 * 
 * Defaults to June's feed if no username or fid provided.
 */

import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;
const DEFAULT_FID = 2668384; // June's FID

if (!API_KEY) {
  console.error("Error: Missing NEYNAR_API_KEY");
  process.exit(1);
}

async function getFidFromUsername(username: string): Promise<number | null> {
  const url = new URL("https://api.neynar.com/v2/farcaster/user/by_username");
  url.searchParams.append("username", username);

  const response = await fetch(url.toString(), {
    headers: {
      "accept": "application/json",
      "api_key": API_KEY,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user?.fid || null;
}

interface Cast {
  hash: string;
  text: string;
  timestamp: string;
  replies_count: number;
  reactions_count: number;
  recasts_count: number;
  watches_count: number;
}

async function getFeed(fid: number, limit: number = 20, cursor?: string): Promise<{ casts: Cast[], nextCursor?: string }> {
  const url = new URL("https://api.neynar.com/v2/farcaster/feed/user/casts");
  url.searchParams.append("fid", fid.toString());
  url.searchParams.append("limit", limit.toString());
  if (cursor) {
    url.searchParams.append("cursor", cursor);
  }

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
  
  const casts: Cast[] = (data.casts || []).map((cast: any) => ({
    hash: cast.hash,
    text: cast.text,
    timestamp: cast.timestamp,
    replies_count: cast.replies?.count || 0,
    reactions_count: cast.reactions?.count || 0,
    recasts_count: cast.recasts?.count || 0,
    watches_count: cast.watches?.count || 0,
  }));

  return {
    casts,
    nextCursor: data.next?.cursor,
  };
}

// CLI usage
if (import.meta.main) {
  const usernameFlag = process.argv.indexOf("--username");
  const username = usernameFlag > -1 ? process.argv[usernameFlag + 1] : undefined;
  
  const fidFlag = process.argv.indexOf("--fid");
  const fidArg = fidFlag > -1 ? parseInt(process.argv[fidFlag + 1]) : undefined;
  
  const limitFlag = process.argv.indexOf("--limit");
  const limit = limitFlag > -1 ? parseInt(process.argv[limitFlag + 1]) || 10 : 10;
  
  const cursorFlag = process.argv.indexOf("--cursor");
  const cursor = cursorFlag > -1 ? process.argv[cursorFlag + 1] : undefined;

  async function main() {
    let fid = DEFAULT_FID;
    let targetName = "june---nbeta";

    if (username) {
      const lookedUpFid = await getFidFromUsername(username);
      if (!lookedUpFid) {
        console.error(`Error: Could not find user @${username}`);
        process.exit(1);
      }
      fid = lookedUpFid;
      targetName = username;
    } else if (fidArg) {
      fid = fidArg;
      targetName = `fid:${fid}`;
    }

    try {
      const result = await getFeed(fid, limit, cursor);
      
      if (result.casts.length === 0) {
        console.log(`No casts found for @${targetName}.`);
        process.exit(0);
      }

      console.log(`\n@${targetName} — ${result.casts.length} casts:\n`);
      
      result.casts.forEach((cast, i) => {
        console.log(`${i + 1}. ${cast.text.slice(0, 80)}${cast.text.length > 80 ? "..." : ""}`);
        console.log(`   ❤️ ${cast.reactions_count}  💬 ${cast.replies_count}  🔄 ${cast.recasts_count}  👁️ ${cast.watches_count}`);
        console.log(`   ${cast.timestamp}`);
        console.log(`   Hash: ${cast.hash}`);
        console.log();
      });

      if (result.nextCursor) {
        console.log(`Next page cursor: ${result.nextCursor}`);
        console.log(`Run again with: --cursor ${result.nextCursor}`);
      }
    } catch (error: any) {
      console.error("Error getting feed:", error.message);
      process.exit(1);
    }
  }

  main();
}

export { getFeed, getFidFromUsername };
