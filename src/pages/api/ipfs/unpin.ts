// ==================================================
// app/api/ipfs/unpin/route.ts
// Unpin content from Pinata (delete)
// ==================================================

import { NextRequest, NextResponse } from "next/server";

export default async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');

    if (!cid) {
      return NextResponse.json(
        { error: 'CID is required' },
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

    // Unpin from Pinata
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to unpin' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Content unpinned successfully',
    });

  } catch (error) {
    console.error('Unpin error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}