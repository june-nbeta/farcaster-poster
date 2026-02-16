# Farcaster Poster

CLI utility for Farcaster engagement via Neynar API (Free Tier).

## Setup

```bash
cp .env.example .env
# Edit .env with your Neynar API key and signer UUID
```

## Install

```bash
npm install
```

## Usage

### Post a new cast
```bash
npx tsx post.ts "your message here"
```

### Reply to a cast
```bash
npx tsx reply.ts <parent-cast-hash> "your reply"
```

**Important:** Farcaster URLs often truncate hashes (showing only first 8-10 characters). You need the **full hash** to reply.

To get the full hash:
1. Open the cast in Farcaster
2. Tap Share → Copy Link
3. The full hash is in the URL after the username

Or use the fetch-cast script to verify a hash works:
```bash
npx tsx fetch-cast.ts <cast-hash>
```

### Resolve cast URL to full hash
```bash
npx tsx resolve-url.ts <farcaster-url>
```

This extracts the full hash from a shortened Farcaster URL so you can reply.

### Fetch a cast (verify hash)
```bash
npx tsx fetch-cast.ts <cast-hash>
```

## Free Tier Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| Post cast | ✅ Works | 150 credits |
| Reply to cast | ✅ Works | 150 credits |
| Fetch cast | ✅ Works | 4 credits |
| Get user feed | ✅ Works | 4 credits |
| Like/recast | ❌ Paid only | Requires Neynar paid plan |
| Read replies | ❌ Paid only | Requires Neynar paid plan |

## Requirements

- Neynar API key from https://dev.neynar.com
- Approved Farcaster signer UUID
  - Generate at https://dev.neynar.com → Signers
  - Approve in Farcaster when prompted

## Troubleshooting

**"cast not found" error:**
- You're using a truncated hash from the URL
- Use `resolve-url.ts` to get the full hash: `npx tsx resolve-url.ts <farcaster-url>`

**"Invalid OAuth token" error:**
- Check your NEYNAR_API_KEY in .env
- Ensure no extra quotes or spaces

**"signer not approved" error:**
- Approve the signer in Farcaster first
- Check signer status in Neynar dashboard

## API Reference

See `obsidian-vault/08_reference/farcaster-neynar-free.md` for complete free tier endpoint documentation.
