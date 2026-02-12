import "dotenv/config";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

console.log("API Key:", process.env.NEYNAR_API_KEY?.slice(0, 8) + "...");
console.log("Signer:", process.env.NEYNAR_SIGNER_UUID?.slice(0, 8) + "...");

if (!process.env.NEYNAR_API_KEY) {
  throw new Error("Missing NEYNAR_API_KEY");
}

if (!process.env.NEYNAR_SIGNER_UUID) {
  throw new Error("Missing NEYNAR_SIGNER_UUID");
}

const neynar = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY });

async function postToFarcaster(text: string) {
  console.log("\nSending cast...");
  const res = await neynar.publishCast({
    signerUuid: process.env.NEYNAR_SIGNER_UUID!,
    text,
  });
  return res;
}

const text = process.argv[2];
if (!text) {
  console.error("Usage: npx tsx post.ts 'your message'");
  process.exit(1);
}

postToFarcaster(text)
  .then(r => {
    console.log("Success!");
    console.log("Hash:", r.cast.hash);
    console.log("URL:", `https://warpcast.com/${r.cast.author.username}/${r.cast.hash.slice(0, 10)}`);
  })
  .catch(e => {
    console.error("\nError:", e.message);
    if (e.response) {
      console.error("Status:", e.response.status);
      console.error("Data:", JSON.stringify(e.response.data, null, 2));
    }
    process.exit(1);
  });
