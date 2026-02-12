# Farcaster Poster

Simple CLI utility to post casts to Farcaster via Neynar API.

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

```bash
npx tsx post.ts "your message here"
```

## Create a Signer

If you need a new signer:

```bash
node create-signer.js
```

## Requirements

- Neynar API key from https://dev.neynar.com
- Approved Farcaster signer UUID
