'use client';

import Snowfall from 'react-snowfall';

export default function Snow() {
  return (
    <Snowfall
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        zIndex: 21, // Headerのz-indexより大きい値にする
      }}
      snowflakeCount={30}
      speed={[0.5, 1.0]}
    />
  );
}
