#!/usr/bin/env node
/**
 * Create a new Farcaster signer via Neynar API
 * Usage: node create-signer.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = join(__dirname, '.env');
try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (e) {
  // .env might not exist
}

const API_KEY = process.env.NEYNAR_API_KEY;

if (!API_KEY) {
  console.error('Error: NEYNAR_API_KEY environment variable is required');
  process.exit(1);
}

async function createSigner() {
  console.log('Creating new Farcaster signer...\n');

  try {
    // Step 1: Create the signer
    const createRes = await fetch('https://api.neynar.com/v2/farcaster/signer', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api_key': API_KEY,
        'content-type': 'application/json'
      }
    });

    const signerData = await createRes.json();
    
    if (!createRes.ok) {
      console.error('Error creating signer:', JSON.stringify(signerData, null, 2));
      process.exit(1);
    }

    console.log('✓ Signer created');
    console.log('  Signer UUID:', signerData.signer_uuid);
    console.log('  Status:', signerData.status);

    // Step 2: Get the approval URL
    if (signerData.signer_approval_url) {
      console.log('\n' + '='.repeat(60));
      console.log('APPROVAL REQUIRED');
      console.log('='.repeat(60));
      console.log('\nTo approve this signer, either:');
      console.log('\n1. Scan this QR code with your phone camera:');
      console.log(`   ${signerData.signer_approval_url}`);
      console.log('\n2. Or open this link on your phone:');
      console.log(`   ${signerData.signer_approval_url}`);
      console.log('\n' + '='.repeat(60));
      console.log('After approving in Warpcast, the signer will be active.');
      console.log('='.repeat(60) + '\n');

      // Save the signer UUID to .env
      const envContent = `NEYNAR_API_KEY=${API_KEY}\nNEYNAR_SIGNER_UUID=${signerData.signer_uuid}\n`;
      writeFileSync(envPath, envContent);
      console.log('✓ Updated .env with new signer UUID');
      console.log('  Location:', envPath);
    }

    return signerData;
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createSigner();
