import "dotenv/config";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

if (!API_KEY || !SIGNER_UUID) {
  console.error("Missing NEYNAR_API_KEY or NEYNAR_SIGNER_UUID");
  process.exit(1);
}

const neynar = new NeynarAPIClient({ apiKey: API_KEY });

const SCORE_THRESHOLD = 0.85;

async function replyToCast(parentHash: string, text: string) {
  try {
    // First, check the parent cast author's Neynar score
    const castResponse = await neynar.fetchCast({
      identifier: parentHash,
      type: "hash",
    });
    
    const cast = castResponse.cast;
    const authorFid = cast.author.fid;
    
    // Get user details including Neynar score
    const userResponse = await neynar.fetchBulkUsers({
      fids: [authorFid],
    });
    
    const user = userResponse.users[0];
    const score = user?.experimental?.neynarScore?.score || 0;
    
    console.log(`Author: @${user.username}`);
    console.log(`Neynar Score: ${score.toFixed(2)}`);
    
    if (score < SCORE_THRESHOLD) {
      console.error(`\nError: User score ${score.toFixed(2)} is below threshold ${SCORE_THRESHOLD}`);
      console.log("Reply blocked.");
      process.exit(1);
    }
    
    console.log("\nScore threshold passed. Posting reply...\n");
    
    const res = await neynar.publishCast({
      signerUuid: SIGNER_UUID,
      text,
      parent: parentHash,
    });

    console.log("Reply posted successfully!");
    console.log("Hash:", res.cast.hash);
    console.log("URL:", `https://warpcast.com/${res.cast.author.username}/${res.cast.hash.slice(0, 10)}`);
    
  } catch (error: any) {
    console.error("Error posting reply:", error.message);
    process.exit(1);
  }
}

// CLI usage
const parentHash = process.argv[2];
const text = process.argv[3];

if (!parentHash || !text) {
  console.error("Usage: npx tsx reply.ts <parent-cast-hash> 'your reply text'");
  process.exit(1);
}

if (text.length > 320) {
  console.error("Error: Reply exceeds 320 character limit");
  process.exit(1);
}

replyToCast(parentHash, text);
