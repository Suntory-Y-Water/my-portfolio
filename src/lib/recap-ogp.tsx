import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

// Font caching
let cachedFontData: Buffer | null = null;

export async function generateRecap2025Image(): Promise<Uint8Array> {
  // Load font (cached)
  if (!cachedFontData) {
    cachedFontData = fs.readFileSync(
      path.join(process.cwd(), 'public/fonts/NotoSansJP-SemiBold.ttf'),
    );
  }

  const svg = await satori(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        background: '#ffffff',
        color: '#1a1a1a',
        fontFamily: '"Noto Sans JP", sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          fontSize: '200px',
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(to right, #1a1a1a, #666666)',
          backgroundClip: 'text',
          color: 'transparent',
          marginBottom: '20px',
        }}
      >
        2025
      </div>

      <div
        style={{
          fontSize: '40px',
          letterSpacing: '0.2em',
          color: '#6b7280',
          textTransform: 'uppercase',
        }}
      >
        Year in Code
      </div>

      {/* Site Name / Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          fontSize: '24px',
          color: '#4b5563',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            overflow: 'hidden',
            marginRight: '16px',
            display: 'flex',
          }}
        >
          <img
            src='https://avatars.githubusercontent.com/u/116779921?v=4'
            width={40}
            height={40}
            alt='avatar'
          />
        </div>
        sui Tech Blog
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: cachedFontData,
          weight: 600,
          style: 'normal',
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const image = resvg.render();

  return image.asPng();
}
