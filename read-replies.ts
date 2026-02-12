import "dotenv/config";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const API_KEY = process.env.NEYNAR_API_KEY;
const SIGNER_UUID = process.env.NEYNAR_SIGNER_UUID;
const FID = process.env.FARCASTER_FID; // Your FID to check mentions

if (!API_KEY || !SIGNER_UUID || !FID) {
  console.error("Missing NEYNAR_API_KEY, NEYNAR_SIGNER_UUID, or FARCASTER_FID");
  process.exit(1);
}

const neynar = new NeynarAPIClient({ apiKey: API_KEY });

const SCORE_THRESHOLD = 0.85;

async function readReplies() {
  console.log("Fetching mentions...\n");
  
  try {
    // Get mentions/notifications
    const response = await neynar.fetchAllNotifications({
      fid: parseInt(FID),
      type: "mentions", // or all notifications
    });

    const notifications = response.notifications || [];
    
    // Filter for replies to my casts with high Neynar score
    const highQualityReplies = notifications.filter((notif: any) => {
      const score = notif.user?.experimental?.neynarScore?.score || 0;
      return score >= SCORE_THRESHOLD && notif.cast?.parent_hash;
    });

    if (highQualityReplies.length === 0) {
      console.log("No high-quality replies (≥0.85) found.");
      return;
    }

    console.log(`Found ${highQualityReplies.length} high-quality replies:\n`);
    
    highQualityReplies.forEach((notif: any, i: number) => {
      const user = notif.user;
      const cast = notif.cast;
      const score = user?.experimental?.neynarScore?.score || 0;
      
      console.log(`${i + 1}. @${user.username} (Score: ${score.toFixed(2)})`);
      console.log(`   Text: ${cast.text.slice(0, 100)}${cast.text.length > 100 ? '...' : ''}`);
      console.log(`   Cast Hash: ${cast.hash}`);
      console.log(`   Parent Hash: ${cast.parent_hash}`);
      console.log();
    });

    // TODO: Report to Brian (could write to file, send message, etc.)
    console.log("Report these to Brian for consideration.");
    
  } catch (error: any) {
    console.error("Error fetching mentions:", error.message);
    process.exit(1);
  }
}

readReplies();
