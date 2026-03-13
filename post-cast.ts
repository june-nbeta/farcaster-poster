import "dotenv/config";
import { readFileSync, existsSync, statSync } from "fs";
import { basename, extname } from "path";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;

if (!API_KEY) throw new Error("Missing NEYNAR_API_KEY");
if (!SIGNER_UUID) throw new Error("Missing NEYNAR_SIGNER_UUID");

const SUPPORTED_MEDIA_FORMATS: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

const VIDEO_FORMATS = new Set([".mp4", ".mov"]);

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;  // 10MB
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export async function uploadToIPFS(filePath: string): Promise<string> {
  const PINATA_JWT = process.env.PINATA_JWT;
  if (!PINATA_JWT) throw new Error("Missing PINATA_JWT in environment");

  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const ext = extname(filePath).toLowerCase();
  const mimeType = SUPPORTED_MEDIA_FORMATS[ext];
  if (!mimeType) {
    throw new Error(
      `Unsupported media format: ${ext}. Supported: jpg, jpeg, png, gif, webp, mp4, mov`
    );
  }

  const isVideo = VIDEO_FORMATS.has(ext);
  const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  const maxLabel = isVideo ? "100MB" : "10MB";

  const stats = statSync(filePath);
  if (stats.size > maxSize) {
    throw new Error(
      `Media too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB. Max for ${isVideo ? "video" : "image/gif"}: ${maxLabel}`
    );
  }

  const fileBuffer = readFileSync(filePath);
  const fileName = basename(filePath);
  const blob = new Blob([fileBuffer], { type: mimeType });

  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: `farcaster-${fileName}` })
  );

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Pinata upload failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const cid: string = data.IpfsHash;

  if (!cid) {
    throw new Error("Pinata response missing IpfsHash");
  }

  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

export async function postToFarcaster(
  text: string,
  replyToHash?: string,
  embeds?: { url: string }[]
) {
  const url = "https://api.neynar.com/v2/farcaster/cast";

  const body: any = {
    text: text.trim(),
    signer_uuid: SIGNER_UUID,
  };

  if (replyToHash) {
    body.parent = replyToHash;
  }

  if (embeds && embeds.length > 0) {
    body.embeds = embeds;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      api_key: API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();

  return {
    hash: data.cast.hash,
    text: data.cast.text,
    fid: data.cast.author.fid,
    username: data.cast.author.username,
    url: `https://farcaster.xyz/${data.cast.author.username}/${data.cast.hash.slice(0, 10)}`,
  };
}

// CLI usage
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0].startsWith("--")) {
    console.error(
      "Usage: npx tsx post-cast.ts 'Your message here' [--image <path>] [--video <path>] [--reply <hash>]\n" +
      "  --image <path>  Attach an image or GIF (jpg, jpeg, png, gif, webp) — max 10MB, up to 2 total embeds\n" +
      "  --video <path>  Attach a video (mp4, mov) — max 100MB, up to 2 total embeds\n" +
      "  --reply <hash>  Reply to an existing cast\n" +
      "  Total embeds (images + videos) must be ≤ 2"
    );
    process.exit(1);
  }

  const text = args[0];
  const imagePaths: string[] = [];
  const videoPaths: string[] = [];
  let replyTo: string | undefined;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--image") {
      const nextArg = args[i + 1];
      if (!nextArg || nextArg.startsWith("--")) {
        console.error("Error: --image requires a file path argument");
        process.exit(1);
      }
      imagePaths.push(nextArg);
      i++; // skip the path argument
    } else if (args[i] === "--video") {
      const nextArg = args[i + 1];
      if (!nextArg || nextArg.startsWith("--")) {
        console.error("Error: --video requires a file path argument");
        process.exit(1);
      }
      videoPaths.push(nextArg);
      i++; // skip the path argument
    } else if (args[i] === "--reply") {
      const nextArg = args[i + 1];
      if (!nextArg || nextArg.startsWith("--")) {
        console.error("Error: --reply requires a hash argument");
        process.exit(1);
      }
      replyTo = nextArg;
      i++; // skip the hash argument
    }
  }

  const totalEmbeds = imagePaths.length + videoPaths.length;
  if (totalEmbeds > 2) {
    console.error(
      `Error: Maximum 2 embeds allowed per cast (Farcaster embed limit). Got ${totalEmbeds} (${imagePaths.length} image(s), ${videoPaths.length} video(s)).`
    );
    process.exit(1);
  }

  if (text.length > 299) {
    console.error(
      "Error: Message exceeds 299 character limit (use threads for longer content)"
    );
    process.exit(1);
  }

  try {
    let embeds: { url: string }[] | undefined;

    const allMediaPaths = [
      ...imagePaths.map((p) => ({ path: p, type: "image" })),
      ...videoPaths.map((p) => ({ path: p, type: "video" })),
    ];

    if (allMediaPaths.length > 0) {
      console.log(`Uploading ${allMediaPaths.length} media file(s) to IPFS...`);
      const embedUrls = await Promise.all(
        allMediaPaths.map(async ({ path: mediaPath, type }) => {
          console.log(`  Uploading ${type}: ${mediaPath}`);
          const gatewayUrl = await uploadToIPFS(mediaPath);
          console.log(`  ✓ ${mediaPath} → ${gatewayUrl}`);
          return { url: gatewayUrl };
        })
      );
      embeds = embedUrls;
    }

    const result = await postToFarcaster(text, replyTo, embeds);
    console.log("Cast posted successfully!");
    console.log("Hash:", result.hash);
    console.log("URL:", result.url);
  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}
