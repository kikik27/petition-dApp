// ==================================================
// app/api/ipfs/upload-multiple/route.ts
// Upload multiple files to Pinata IPFS
// ==================================================

import { NextRequest, NextResponse } from "next/server";

export default async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'At least one file is required' },
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

    // Upload each file
    const uploadPromises = files.map(async (file) => {
      const pinataFormData = new FormData();
      pinataFormData.append('file', file);

      const metadata = JSON.stringify({
        name: file.name,
      });
      pinataFormData.append('pinataMetadata', metadata);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretKey,
        },
        body: pinataFormData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }

      const data = await response.json();

      return {
        filename: file.name,
        size: file.size,
        type: file.type,
        cid: data.IpfsHash,
        url: `ipfs://${data.IpfsHash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
        pinSize: data.PinSize,
        timestamp: data.Timestamp,
      };
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      files: results,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}