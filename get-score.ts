#!/usr/bin/env tsx
// get-score.ts - Look up a Farcaster user's Neynar score
// Usage: npx tsx get-score.ts <fid|username>

const API_KEY = process.env.NEYNAR_API_KEY;

if (!API_KEY) {
  console.error("Error: NEYNAR_API_KEY not set");
  process.exit(1);
}

const arg = process.argv[2];

if (!arg) {
  console.error("Usage: npx tsx get-score.ts <fid|username>");
  console.error("Examples:");
  console.error("  npx tsx get-score.ts 1237317");
  console.error("  npx tsx get-score.ts agrimony.eth");
  process.exit(1);
}

async function getScore() {
  try {
    // Determine if FID or username (FID is numeric)
    const isFid = /^\d+$/.test(arg);
    
    let user;
    
    if (isFid) {
      // Lookup by FID using bulk endpoint
      const fid = parseInt(arg, 10);
      const resp = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
        {
          headers: {
            "Accept": "application/json",
            "api_key": API_KEY,
          },
        }
      );
      
      const data = await resp.json();
      
      if (data.message) {
        console.error("Error:", data.message);
        process.exit(1);
      }
      
      if (!data.users || data.users.length === 0) {
        console.error(`User with FID ${fid} not found`);
        process.exit(1);
      }
      
      user = data.users[0];
    } else {
      // Lookup by username
      const resp = await fetch(
        `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(arg)}`,
        {
          headers: {
            "Accept": "application/json",
            "api_key": API_KEY,
          },
        }
      );
      
      const data = await resp.json();
      
      if (data.message) {
        console.error("Error:", data.message);
        process.exit(1);
      }
      
      if (!data.user) {
        console.error(`User @${arg} not found`);
        process.exit(1);
      }
      
      user = data.user;
    }
    
    // Output results
    console.log(`\n@${user.username} (${user.display_name})`);
    console.log(`FID: ${user.fid}`);
    console.log(`Score: ${user.score ?? "N/A"}`);
    console.log(`Followers: ${user.follower_count.toLocaleString()}`);
    console.log(`Following: ${user.following_count.toLocaleString()}`);
    console.log(`Registered: ${new Date(user.registered_at).toLocaleDateString()}`);
    console.log();
    
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

getScore();
