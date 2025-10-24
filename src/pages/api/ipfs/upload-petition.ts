// ==================================================
// app/api/ipfs/upload-petition/route.ts
// Complete petition upload (metadata + files) to Pinata
// ==================================================

import { NextRequest, NextResponse } from "next/server";

export default async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const richTextContent = formData.get('richTextContent') as string;
    const category = formData.get('category') as string;
    const tags = JSON.parse((formData.get('tags') as string) || '[]');
    const creator = formData.get('creator') as string;
    const targetSignatures = formData.get('targetSignatures') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;

    const coverImage = formData.get('coverImage') as File | null;
    const documents = formData.getAll('documents') as File[];

    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_KEY;

    if (!pinataApiKey || !pinataSecretKey) {
      return NextResponse.json(
        { error: 'Pinata API keys not configured' },
        { status: 500 }
      );
    }

    // 1. Upload cover image (if provided)
    let imageCID = '';
    if (coverImage && coverImage.size > 0) {
      const imageFormData = new FormData();
      imageFormData.append('file', coverImage);

      const imageMetadata = JSON.stringify({
        name: `cover-${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      });
      imageFormData.append('pinataMetadata', imageMetadata);

      const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretKey,
        },
        body: imageFormData,
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageCID = imageData.IpfsHash;
      }
    }

    // 2. Upload documents
    const documentMetadata: Array<{
      name: string;
      size: number;
      type: string;
      url: string;
      uploadedAt: number;
    }> = [];

    if (documents && documents.length > 0) {
      for (const doc of documents) {
        if (doc.size === 0) continue;

        const docFormData = new FormData();
        docFormData.append('file', doc);

        const docMetadata = JSON.stringify({
          name: `doc-${doc.name}`,
        });
        docFormData.append('pinataMetadata', docMetadata);

        const docResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretKey,
          },
          body: docFormData,
        });

        if (docResponse.ok) {
          const docData = await docResponse.json();
          documentMetadata.push({
            name: doc.name,
            size: doc.size,
            type: doc.type,
            url: `ipfs://${docData.IpfsHash}`,
            uploadedAt: Date.now(),
          });
        }
      }
    }

    // 3. Create metadata JSON
    const metadata = {
      name: title,
      description: description,
      image: imageCID ? `ipfs://${imageCID}` : '',
      external_url: `https://yourpetitiondapp.com/petition/${Date.now()}`,

      attributes: [
        {
          trait_type: 'Category',
          value: category,
        },
        {
          trait_type: 'Target Signatures',
          value: parseInt(targetSignatures || '0'),
          display_type: 'number',
        },
        {
          trait_type: 'Start Date',
          value: parseInt(startDate || '0'),
          display_type: 'date',
        },
        {
          trait_type: 'End Date',
          value: parseInt(endDate || '0'),
          display_type: 'date',
        },
        {
          trait_type: 'Creator',
          value: creator,
        },
      ],

      petitionData: {
        richTextContent: richTextContent,
        category: category,
        tags: tags,
        creator: creator,
        targetSignatures: parseInt(targetSignatures || '0'),
        startDate: parseInt(startDate || '0'),
        endDate: parseInt(endDate || '0'),
        documents: documentMetadata,
        version: 1,
        createdAt: Date.now(),
      },
    };

    // 4. Upload metadata JSON to Pinata
    const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `petition-${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
        },
      }),
    });

    if (!metadataResponse.ok) {
      const error = await metadataResponse.text();
      console.error('Metadata upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload metadata' },
        { status: metadataResponse.status }
      );
    }

    const metadataData = await metadataResponse.json();

    return NextResponse.json({
      success: true,
      metadataCID: metadataData.IpfsHash,
      imageCID: imageCID,
      documents: documentMetadata,
      url: `ipfs://${metadataData.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`,
      pinSize: metadataData.PinSize,
      timestamp: metadataData.Timestamp,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}