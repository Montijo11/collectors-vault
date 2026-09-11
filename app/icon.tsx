import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#050B16',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <img
          alt="Collector's Vaults"
          height="64"
          src="https://collectorsvaults.org/collectors.vaults.logo.png"
          style={{ objectFit: 'cover' }}
          width="64"
        />
      </div>
    ),
    size,
  );
}
