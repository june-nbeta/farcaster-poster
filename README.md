# Farcaster Poster

CLI utility for Farcaster engagement via Neynar API.

## Setup

```bash
cp .env.example .env
# Edit .env with your Neynar API key, signer UUID, and FID
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

### Read replies (filter by Neynar score ≥0.85)
```bash
npx tsx read-replies.ts
```

### Reply to a cast (checks author score ≥0.85)
```bash
npx tsx reply.ts <parent-cast-hash> "your reply"
```

### Like a cast (uses taste profile)
```bash
npx tsx like.ts <cast-hash>
```

## Requirements

- Neynar API key from https://dev.neynar.com
- Approved Farcaster signer UUID (provided manually)
- Your Farcaster FID (for reading mentions)
