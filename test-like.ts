import "dotenv/config";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

if (!API_KEY || !SIGNER_UUID) {
  console.error("Missing env vars");
  process.exit(1);
}

const neynar = new NeynarAPIClient({ apiKey: API_KEY });

async function testLike() {
  const castHash = process.argv[2];
  
  try {
    console.log("Testing reaction API...");
    console.log(`Cast hash: ${castHash}`);
    console.log(`Signer UUID: ${SIGNER_UUID?.slice(0, 8)}...`);
    
    // Try to publish reaction
    const result = await neynar.publishReactionToCast({
      signerUuid: SIGNER_UUID,
      reactionType: "like",
      castHash: castHash,
    });
    
    console.log("Success!");
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error: any) {
    console.error("Error:", error.message);
    console.error("Full error:", JSON.stringify(error, null, 2));
  }
}

testLike();
