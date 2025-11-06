/**
 * IPFS Commands
 * Upload and download files from IPFS
 */

import * as fs from 'fs';
import * as path from 'path';
import { SomniaAgentKit } from '../..';
import { loadConfig } from './init';

export interface IPFSUploadOptions {
  name?: string;
  _positional?: string[];
}

export interface IPFSGetOptions {
  output?: string;
  _positional?: string[];
}

export interface IPFSMetadataOptions {
  name?: string;
  description?: string;
  image?: string;
  attributes?: string;
  _positional?: string[];
}

/**
 * Initialize SDK from config
 */
async function initSDK(): Promise<SomniaAgentKit> {
  const config = loadConfig();

  const kit = new SomniaAgentKit({
    network: {
      rpcUrl: config.rpcUrl,
      chainId: config.chainId,
      name: config.network,
    },
    contracts: {
      agentRegistry: config.contracts.agentRegistry,
      agentManager: config.contracts.agentManager,
      agentExecutor: config.contracts.agentExecutor,
      agentVault: config.contracts.agentVault,
    },
    privateKey: config.privateKey || process.env.PRIVATE_KEY,
  });

  await kit.initialize();
  return kit;
}

/**
 * IPFS upload command
 */
export async function ipfsUploadCommand(options: IPFSUploadOptions): Promise<void> {
  const filePath = options._positional?.[0];

  if (!filePath) {
    throw new Error('Usage: sak ipfs:upload <file> [--name <name>]');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  console.log(`📤 Uploading file to IPFS...\n`);

  const kit = await initSDK();
  const ipfsManager = kit.getIPFSManager();

  // Read file
  const fileContent = fs.readFileSync(filePath);
  const fileName = options.name || path.basename(filePath);

  console.log(`   File: ${fileName}`);
  console.log(`   Size: ${(fileContent.length / 1024).toFixed(2)} KB\n`);

  console.log('⏳ Uploading to IPFS...');

  try {
    // Convert Buffer to Blob
    const blob = new Blob([fileContent]);
    const result = await ipfsManager.uploadFile(blob, fileName);

    console.log('✅ Upload successful!\n');
    console.log(
      '╔═══════════════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      `║  IPFS Upload Details                                                      ║`
    );
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );
    console.log(`║  Hash:     ${result.hash.padEnd(61)}║`);
    console.log(`║  URI:      ${result.uri.padEnd(61)}║`);
    console.log(`║  Gateway:  ${result.url.substring(0, 61).padEnd(61)}║`);
    if (result.url.length > 61) {
      console.log(`║            ${result.url.substring(61, 122).padEnd(61)}║`);
    }
    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
    console.log();

    console.log('💡 Access your file:');
    console.log(`   - IPFS URI: ${result.uri}`);
    console.log(`   - Gateway:  ${result.url}\n`);
  } catch (error) {
    throw new Error(`Upload failed: ${(error as Error).message}`);
  }
}

/**
 * IPFS get command
 */
export async function ipfsGetCommand(options: IPFSGetOptions): Promise<void> {
  const hash = options._positional?.[0];

  if (!hash) {
    throw new Error('Usage: sak ipfs:get <hash> [--output <file>]');
  }

  console.log(`📥 Downloading file from IPFS...\n`);

  const kit = await initSDK();
  const ipfsManager = kit.getIPFSManager();

  console.log(`   Hash: ${hash}\n`);
  console.log('⏳ Fetching from IPFS...');

  try {
    const blob = await ipfsManager.fetchFile(hash);
    
    // Convert Blob to Buffer
    const buffer = Buffer.from(await blob.arrayBuffer());

    console.log(`✅ Download successful! (${(buffer.length / 1024).toFixed(2)} KB)\n`);

    if (options.output) {
      // Save to file
      fs.writeFileSync(options.output, buffer);
      console.log(`💾 Saved to: ${options.output}\n`);
    } else {
      // Try to display as text
      try {
        const text = buffer.toString('utf-8');
        console.log('📄 Content:\n');
        console.log(text);
        console.log();
      } catch (error) {
        console.log('⚠️  Binary content (use --output to save to file)\n');
      }
    }
  } catch (error) {
    throw new Error(`Download failed: ${(error as Error).message}`);
  }
}

/**
 * IPFS metadata command
 */
export async function ipfsMetadataCommand(options: IPFSMetadataOptions): Promise<void> {
  const metadataFile = options._positional?.[0];

  if (!metadataFile) {
    throw new Error(
      'Usage: sak ipfs:metadata <metadata.json> or provide --name, --description, --image'
    );
  }

  console.log(`📤 Uploading NFT metadata to IPFS...\n`);

  const kit = await initSDK();
  const ipfsManager = kit.getIPFSManager();

  let metadata: any;

  if (fs.existsSync(metadataFile)) {
    // Load from file
    const metadataContent = fs.readFileSync(metadataFile, 'utf-8');
    try {
      metadata = JSON.parse(metadataContent);
    } catch (error) {
      throw new Error('Invalid JSON in metadata file');
    }
  } else {
    // Create from options
    if (!options.name || !options.description || !options.image) {
      throw new Error(
        'If metadata file not found, provide --name, --description, and --image'
      );
    }

    metadata = {
      name: options.name,
      description: options.description,
      image: options.image,
    };

    if (options.attributes) {
      try {
        metadata.attributes = JSON.parse(options.attributes);
      } catch (error) {
        throw new Error('Invalid JSON in attributes');
      }
    }
  }

  console.log('📋 Metadata:');
  console.log(JSON.stringify(metadata, null, 2));
  console.log();

  console.log('⏳ Uploading to IPFS...');

  try {
    const result = await ipfsManager.uploadNFTMetadata(metadata);

    console.log('✅ Upload successful!\n');
    console.log(
      '╔═══════════════════════════════════════════════════════════════════════════╗'
    );
    console.log(
      `║  NFT Metadata Upload                                                      ║`
    );
    console.log(
      '╠═══════════════════════════════════════════════════════════════════════════╣'
    );
    console.log(`║  Hash:     ${result.hash.padEnd(61)}║`);
    console.log(`║  URI:      ${result.uri.padEnd(61)}║`);
    console.log(`║  Gateway:  ${result.url.substring(0, 61).padEnd(61)}║`);
    if (result.url.length > 61) {
      console.log(`║            ${result.url.substring(61, 122).padEnd(61)}║`);
    }
    console.log(
      '╚═══════════════════════════════════════════════════════════════════════════╝'
    );
    console.log();

    console.log('💡 Use this URI in your NFT contract:');
    console.log(`   ${result.uri}\n`);
  } catch (error) {
    throw new Error(`Upload failed: ${(error as Error).message}`);
  }
}
