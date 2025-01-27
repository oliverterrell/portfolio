import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    return new Response(JSON.stringify(req.body), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ error: 'Unspecified error occurred.' }), { status: 500 });
  }
}
