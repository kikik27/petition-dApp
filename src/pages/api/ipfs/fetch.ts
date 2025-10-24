// ==================================================
// pages/api/ipfs/fetch.ts
// Fetch content from IPFS via multiple gateways (Pages Router API route)
// ==================================================

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const cid = (req.query.cid as string) || '';
    if (!cid) {
      return res.status(400).json({ error: 'CID is required' });
    }

    // Try multiple gateways for reliability
    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`,
      `https://dweb.link/ipfs/${cid}`,
    ];

    let lastError: Error | null = null;
    for (const gateway of gateways) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(gateway, { signal: controller.signal });

        clearTimeout(timeout);

        if (response.ok) {
          const contentType = response.headers.get('content-type') || 'application/octet-stream';

          if (contentType.includes('application/json')) {
            const data = await response.json();
            return res.status(200).json({ success: true, data, gateway });
          }

          // Return binary data
          const arrayBuffer = await response.arrayBuffer();
          res.setHeader('Content-Type', contentType);
          return res.status(200).send(Buffer.from(arrayBuffer));
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        // try next gateway
        continue;
      }
    }

    return res.status(502).json({
      error: 'Failed to fetch from all gateways',
      details: lastError?.message,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}