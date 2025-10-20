// ==================================================
// app/api/ipfs/upload-file/route.ts
// Upload single file (image, PDF, etc) to PINATA
// ==================================================

import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: 'edge',
  api: {
    bodyParser: false,
  },
};

export default async function handler(request: NextRequest) {
  try {
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_KEY;

    if (!pinataApiKey || !pinataSecretKey) {
      return NextResponse.json(
        { error: 'Pinata API keys not configured' },
        { status: 500 }
      );
    }

    // Create FormData for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
    });
    pinataFormData.append('pinataMetadata', metadata);

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
      body: pinataFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata error:', error);
      return NextResponse.json(
        { error: 'Failed to upload to IPFS' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      cid: data.IpfsHash,
      filename: file.name,
      size: file.size,
      type: file.type,
      url: `ipfs://${data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      pinSize: data.PinSize,
      timestamp: data.Timestamp,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}