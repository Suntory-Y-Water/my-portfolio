import type { APIRoute } from 'astro';
import { generateRecap2025Image } from '@/lib/recap-ogp';

export const GET: APIRoute = async () => {
  const png = await generateRecap2025Image();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
    },
  });
};
