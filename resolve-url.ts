import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;

if (!API_KEY) {
  console.error("Missing NEYNAR_API_KEY");
  process.exit(1);
}

const url = process.argv[2];

if (!url) {
  console.error("Usage: npx tsx resolve-url.ts <farcaster-url>");
  console.error("Example: npx tsx resolve-url.ts https://farcaster.xyz/chamaquito.eth/0x93fa64cc");
  process.exit(1);
}

async function resolveCastUrl(castUrl: string) {
  // Try the v2 conversation endpoint first (might need paid tier)
  // Alternative: try to fetch user feed and find matching cast
  
  // Extract username from URL
  const match = castUrl.match(/farcaster\.xyz\/([^/]+)\/(.+)/);
  if (!match) {
    console.error("Invalid Farcaster URL format");
    console.error("Expected: https://farcaster.xyz/username/hash");
    process.exit(1);
  }
  
  const [, username, shortHash] = match;
  console.log(`Looking up: @${username}`);
  console.log(`Short hash: ${shortHash}`);
  
  // First, get the user's FID
  const userUrl = `https://api.neynar.com/v2/farcaster/user/by_username?username=${username}`;
  
  const userRes = await fetch(userUrl, {
    headers: {
      "accept": "application/json",
      "api_key": API_KEY,
    },
  });
  
  if (!userRes.ok) {
    const err = await userRes.json();
    console.error("Error fetching user:", JSON.stringify(err, null, 2));
    process.exit(1);
  }
  
  const userData = await userRes.json();
  const fid = userData.user.fid;
  console.log(`FID: ${fid}`);
  
  // Now fetch recent casts from this user
  const feedUrl = `https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=25`;
  
  const feedRes = await fetch(feedUrl, {
    headers: {
      "accept": "application/json",
      "api_key": API_KEY,
    },
  });
  
  if (!feedRes.ok) {
    const err = await feedRes.json();
    console.error("Error fetching feed:", JSON.stringify(err, null, 2));
    process.exit(1);
  }
  
  const feedData = await feedRes.json();
  
  // Find cast matching the short hash prefix
  const matchingCast = feedData.casts.find((cast: any) => 
    cast.hash.toLowerCase().startsWith(shortHash.toLowerCase())
  );
  
  if (!matchingCast) {
    console.error("Cast not found in recent feed");
    console.error("The cast may be too old or the URL hash may be incorrect");
    process.exit(1);
  }
  
  console.log("\n✓ Cast found!");
  console.log(`Full Hash: ${matchingCast.hash}`);
  console.log(`Author: @${matchingCast.author.username}`);
  console.log(`Text: ${matchingCast.text.slice(0, 80)}${matchingCast.text.length > 80 ? '...' : ''}`);
  console.log(`Time: ${matchingCast.timestamp}`);
  console.log(`\nTo reply:`);
  console.log(`npx tsx reply.ts ${matchingCast.hash} "your reply"`);
}

resolveCastUrl(url);
