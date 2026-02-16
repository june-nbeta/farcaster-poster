import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;

if (!API_KEY) {
  console.error("Missing NEYNAR_API_KEY");
  process.exit(1);
}

const CAST_HASH = process.argv[2];

if (!CAST_HASH) {
  console.error("Usage: npx tsx fetch-cast.ts <cast-hash>");
  console.error("Note: Use the full hash from Warpcast, not the shortened URL version");
  process.exit(1);
}

async function fetchCast(castHash: string) {
  // Use v2 endpoint - requires full hash
  const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash`;
  
  console.log(`Fetching cast: ${castHash}`);
  
  const response = await fetch(url, {
    headers: {
      "accept": "application/json",
      "api_key": API_KEY,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error("Error:", response.status);
    console.error(JSON.stringify(data, null, 2));
    
    if (data.message?.includes("not found")) {
      console.error("\nTip: Warpcast URLs often truncate hashes.");
      console.error("Open the cast in Warpcast → Share → Copy Link to get the full hash.");
    }
    
    process.exit(1);
  }
  
  console.log("\nCast found:");
  console.log(`Author: @${data.cast.author.username}`);
  console.log(`Text: ${data.cast.text}`);
  console.log(`Timestamp: ${data.cast.timestamp}`);
  console.log(`Full Hash: ${data.cast.hash}`);
}

fetchCast(CAST_HASH);
