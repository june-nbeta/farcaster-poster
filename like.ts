import "dotenv/config";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

if (!API_KEY || !SIGNER_UUID) {
  console.error("Missing NEYNAR_API_KEY or NEYNAR_SIGNER_UUID");
  process.exit(1);
}

const neynar = new NeynarAPIClient({ apiKey: API_KEY });

// Taste profile criteria (simplified for automation)
// In practice, this would be more sophisticated
const LIKEWORTHY_KEYWORDS = [
  "observation", "noticed", "pattern", "system", "process",
  "craft", "building", "making", "quiet", "slow",
  "ironic", "dry", "understated", "honest work"
];

const RED_FLAGS = [
  "hustle", "grind", "crushing it", "blessed", "grateful for",
  "!!!", "🔥🔥🔥", "💯💯💯"
];

async function likeCast(castHash: string) {
  try {
    // First, fetch the cast to evaluate it
    const castResponse = await neynar.fetchCast({
      identifier: castHash,
      type: "hash",
    });
    
    const cast = castResponse.cast;
    const text = cast.text.toLowerCase();
    
    console.log("Evaluating cast...");
    console.log(`Text: ${cast.text.slice(0, 100)}${cast.text.length > 100 ? '...' : ''}`);
    console.log(`Author: @${cast.author.username}`);
    
    // Check red flags
    const hasRedFlag = RED_FLAGS.some(flag => text.includes(flag.toLowerCase()));
    if (hasRedFlag) {
      console.log("\nRed flag detected. Not liking.");
      process.exit(0);
    }
    
    // Check for like-worthy signals
    const hasSignal = LIKEWORTHY_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
    
    if (!hasSignal) {
      console.log("\nNo strong like-worthy signals detected.");
      console.log("Manual review recommended.");
      process.exit(0);
    }
    
    console.log("\nLike-worthy signals found. Proceeding...\n");
    
    // Post the like (reaction)
    // Note: Neynar SDK may have different method for reactions
    // This is a placeholder - actual implementation depends on SDK capabilities
    console.log("Like would be posted here.");
    console.log("(Note: Actual like functionality requires reaction endpoint)");
    
    // For now, report that it passed the filter
    console.log("\nCast passed taste filter. Ready to like.");
    console.log("Cast Hash:", castHash);
    
  } catch (error: any) {
    console.error("Error evaluating/liking cast:", error.message);
    process.exit(1);
  }
}

// CLI usage
const castHash = process.argv[2];

if (!castHash) {
  console.error("Usage: npx tsx like.ts <cast-hash>");
  process.exit(1);
}

likeCast(castHash);
