import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;
const CAST_HASH = process.argv[2];

if (!API_KEY || !CAST_HASH) {
  console.error("Usage: npx tsx fetch-replies.ts <cast-hash>");
  process.exit(1);
}

async function fetchReplies(castHash: string) {
  // Try using the thread endpoint
  const url = `https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${castHash}&type=hash&reply_depth=2`;
  
  console.log(`Fetching conversation for cast: ${castHash}`);
  
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
    return;
  }
  
  console.log("\nConversation data:");
  console.log(JSON.stringify(data, null, 2).slice(0, 2000));
}

fetchReplies(CAST_HASH);
