import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

if (!API_KEY || !SIGNER_UUID) {
  console.error("Missing NEYNAR_API_KEY or NEYNAR_SIGNER_UUID");
  process.exit(1);
}

async function replyToCast(parentHash: string, text: string) {
  if (text.length > 320) {
    console.error("Error: Reply exceeds 320 character limit");
    process.exit(1);
  }

  const url = "https://api.neynar.com/v2/farcaster/cast";
  
  const body = {
    text: text.trim(),
    signer_uuid: SIGNER_UUID,
    parent: parentHash,
  };

  try {
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
      console.error("Error posting reply:", JSON.stringify(error, null, 2));
      process.exit(1);
    }

    const data = await response.json();
    
    console.log("Reply posted successfully!");
    console.log("Hash:", data.cast.hash);
    console.log("URL:", `https://farcaster.xyz/${data.cast.author.username}/${data.cast.hash.slice(0, 10)}`);
    
  } catch (error: any) {
    console.error("Error posting reply:", error.message);
    process.exit(1);
  }
}

// CLI usage
const parentHash = process.argv[2];
const text = process.argv.slice(3).join(" ");

if (!parentHash || !text) {
  console.error("Usage: npx tsx reply.ts <parent-cast-hash> \"Your reply text\"");
  console.error("Note: Use the full hash from Warpcast, not the shortened URL version");
  process.exit(1);
}

replyToCast(parentHash, text);
