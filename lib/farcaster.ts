import { NeynarAPIClient } from "@neynar/nodejs-sdk";

if (!process.env.NEYNAR_API_KEY) {
  throw new Error("Missing NEYNAR_API_KEY");
}

if (!process.env.NEYNAR_SIGNER_UUID) {
  throw new Error("Missing NEYNAR_SIGNER_UUID");
}

const neynar = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY });

export async function postToFarcaster(text: string) {
  const res = await neynar.publishCast({
    signerUuid: process.env.NEYNAR_SIGNER_UUID!,
    text,
  });

  return {
    hash: res.cast.hash,
    text: res.cast.text,
    fid: res.cast.author.fid,
  };
}
