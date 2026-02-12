import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

console.log("API Key:", API_KEY?.slice(0, 8) + "...");
console.log("Signer:", SIGNER_UUID?.slice(0, 8) + "...");

if (!API_KEY || !SIGNER_UUID) {
  console.error("Missing env vars");
  process.exit(1);
}

const text = process.argv[2];
if (!text) {
  console.error("Usage: npx tsx post.ts 'message'");
  process.exit(1);
}

fetch("https://api.neynar.com/v2/farcaster/cast", {
  method: "POST",
  headers: {
    "accept": "application/json",
    "api_key": API_KEY,
    "content-type": "application/json",
  },
  body: JSON.stringify({
    text: text.trim(),
    signer_uuid: SIGNER_UUID,
  }),
})
  .then(async res => {
    const data = await res.json();
    if (!res.ok) {
      console.error("Error:", res.status, JSON.stringify(data, null, 2));
      process.exit(1);
    }
    console.log("Success!");
    console.log("Hash:", data.cast.hash);
    console.log("URL:", `https://warpcast.com/${data.cast.author.username}/${data.cast.hash.slice(0, 10)}`);
  })
  .catch(e => {
    console.error("Failed:", e.message);
    process.exit(1);
  });
