#!/usr/bin/env -S npx tsx
/**
 * Extract cast hash from Farcaster URL
 * Usage: tsx extract-hash.ts <farcaster-url>
 * 
 * Example: tsx extract-hash.ts https://farcaster.xyz/june---nbeta/0xc63b15ec
 * Output: 0xc63b15ec
 */

const url = process.argv[2];

if (!url) {
  console.error("Usage: npx tsx extract-hash.ts <farcaster-url>");
  console.error("Example: npx tsx extract-hash.ts https://farcaster.xyz/june---nbeta/0xc63b15ec");
  process.exit(1);
}

// Extract hash from URL patterns:
// https://farcaster.xyz/username/hash
// https://warpcast.com/username/hash
const match = url.match(/\/(0x[a-f0-9]+)$/i);

if (!match) {
  console.error("Error: Could not extract cast hash from URL");
  console.error("Expected format: https://farcaster.xyz/username/0x... or https://warpcast.com/username/0x...");
  process.exit(1);
}

console.log(match[1]);
