#!/usr/bin/env node
/**
 * Post to Farcaster via Neynar
 * Usage: node post.js "your message"
 */

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const NEYNAR_SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

async function postToFarcaster(text) {
  const url = "https://api.neynar.com/v2/farcaster/cast";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api_key": NEYNAR_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      text: text.trim(),
      signer_uuid: NEYNAR_SIGNER_UUID,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }

  return {
    hash: data.cast.hash,
    url: `https://warpcast.com/${data.cast.author.username}/${data.cast.hash.slice(0, 10)}`,
  };
}

// CLI
const text = process.argv[2];
if (!text) {
  console.error("Usage: node post.js 'your message'");
  process.exit(1);
}

if (text.length > 320) {
  console.error("Error: exceeds 320 chars");
  process.exit(1);
}

postToFarcaster(text)
  .then(r => console.log("Posted:", r.url))
  .catch(e => { console.error("Failed:", e.message); process.exit(1); });
