# Farcaster Poster

CLI toolkit for Farcaster engagement via Neynar API — text, images, GIFs, and video.

## Setup

```bash
cp .env.example .env
# Edit .env with your Neynar API key, signer UUID, and Pinata JWT
npm install
```

### Required credentials

| Key | Source |
|-----|--------|
| `NEYNAR_API_KEY` | https://dev.neynar.com |
| `NEYNAR_SIGNER_UUID` | Neynar dashboard → Signers (must be approved in Farcaster) |
| `PINATA_JWT` | https://app.pinata.cloud (free tier, 500 pins/month) |

## Usage

### Post a cast

```bash
# Text only
npx tsx post-cast.ts "your message here"

# With image(s) — uploaded to IPFS via Pinata, embedded as URL
npx tsx post-cast.ts "caption" --image photo.jpg
npx tsx post-cast.ts "two pics" --image img1.jpg --image img2.png

# With video — mp4 or mov, max 100MB
npx tsx post-cast.ts "watch this" --video clip.mp4

# Mix image + video (max 2 embeds total)
npx tsx post-cast.ts "photo and vid" --image photo.jpg --video clip.mp4
```

### Reply to a cast

```bash
npx tsx reply.ts <parent-cast-hash> "your reply"
```

**Note:** Farcaster URLs often truncate hashes. Use `extract-hash.ts` to get the full hash from a URL.

### Other scripts

```bash
# Get your feed
npx tsx get-feed.ts [--limit 10]

# Look up a user's openrank score
npx tsx get-score.ts <fid|username>

# Read replies to a cast
npx tsx read-replies.ts <cast-hash>

# Like a cast
npx tsx like.ts <cast-hash>

# Extract full hash from a Farcaster URL
npx tsx extract-hash.ts <farcaster-url>
```

## Supported media

| Type | Formats | Max size | Max per cast |
|------|---------|----------|--------------|
| Image | jpg, jpeg, png, gif, webp | 10 MB | 2 |
| Video | mp4, mov | 100 MB | 2 |

- Images and videos share the 2-embed limit (any mix)
- GIFs are posted via `--image` (treated as images)
- Media is uploaded to IPFS via Pinata, then the gateway URL is embedded in the cast
- `PINATA_JWT` is required for any media upload

## Character limit

299 characters per cast.

## API costs

~150 credits per cast (free tier has daily credit refresh). Check usage at https://dev.neynar.com.

## Troubleshooting

**"cast not found" error:**
- You're using a truncated hash — use `extract-hash.ts` to resolve the full hash

**"Invalid OAuth token" error:**
- Check `NEYNAR_API_KEY` in `.env` — no extra quotes or spaces

**"signer not approved" error:**
- Approve the signer in Farcaster first
- Check signer status in Neynar dashboard

**Media upload fails:**
- Verify `PINATA_JWT` is set in `.env`
- Check Pinata free tier limits (500 pins/month) at https://app.pinata.cloud
