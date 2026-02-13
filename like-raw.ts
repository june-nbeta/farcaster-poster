import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

if (!API_KEY || !SIGNER_UUID) {
  console.error("Missing env vars");
  process.exit(1);
}

async function likeCast(castHash: string) {
  const url = "https://api.neynar.com/v2/farcaster/reaction";
  
  const body = {
    signer_uuid: SIGNER_UUID,
    reaction_type: "like",
    cast_hash: castHash,
  };
  
  console.log("Sending request...");
  console.log(`URL: ${url}`);
  console.log(`Body: ${JSON.stringify(body, null, 2)}`);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api_key": API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error("Error:", response.status);
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }
  
  console.log("Success!");
  console.log(JSON.stringify(data, null, 2));
}

const castHash = process.argv[2];
if (!castHash) {
  console.error("Usage: npx tsx like-raw.ts <cast-hash>");
  process.exit(1);
}

likeCast(castHash);
