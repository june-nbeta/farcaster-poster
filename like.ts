import "dotenv/config";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

if (!API_KEY || !SIGNER_UUID) {
  console.error("Missing NEYNAR_API_KEY or NEYNAR_SIGNER_UUID");
  process.exit(1);
}

const neynar = new NeynarAPIClient({ apiKey: API_KEY });

async function likeCast(castHash: string) {
  try {
    console.log(`Attempting to like cast: ${castHash}`);
    
    // Try to fetch cast info first
    try {
      const castResponse = await neynar.lookUpCastByHash({
        hash: castHash,
        type: "hash",
      });
      
      const cast = castResponse.cast;
      console.log(`Found cast by @${cast.author.username}: ${cast.text.slice(0, 80)}...`);
    } catch (e: any) {
      console.log(`Could not fetch cast details: ${e.message}`);
      console.log("Proceeding with like anyway...");
    }
    
    // Post the like
    console.log("Posting like...");
    const result = await neynar.publishReactionToCast({
      signerUuid: SIGNER_UUID,
      reactionType: "like",
      castHash: castHash,
    });
    
    console.log("Like posted successfully!");
    console.log(`Result: ${JSON.stringify(result, null, 2)}`);
    
  } catch (error: any) {
    console.error("Error liking cast:", error.message);
    if (error.response) {
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    }
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
