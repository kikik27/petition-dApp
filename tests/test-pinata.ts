import { pinata } from '@/lib/pinata';

async function testPinata() {
  const bacndwith = await pinata.analytics.bandwidth

  console.log('Pinata bandwidth usage:', bacndwith);

  // const apiKey = process.env.PINATA_API_KEY;
  // const secretKey = process.env.PINATA_SECRET_KEY;
  // const apiUrl = process.env.PINATA_API_URL;

  // // Test authentication
  // const response = await fetch(`${apiUrl}/data/testAuthentication`, {
  //   method: 'GET',
  //   headers: {
  //     'pinata_api_key': apiKey!,
  //     'pinata_secret_api_key': secretKey!,
  //   },
  // });

  // const data = await response.json();
  // console.log('Pinata connection:', data);
}

testPinata();