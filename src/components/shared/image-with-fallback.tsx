'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className='flex size-full items-center justify-center bg-muted/30'>
        <span className='text-4xl text-muted-foreground/20'>🔗</span>
      </div>
    );
  }

  return (
    <Image
      src={src || '/placeholder.svg'}
      alt={alt}
      className={cn('object-cover', className)}
      fill
      sizes='148px'
      onError={() => setError(true)}
      unoptimized={src.startsWith('http')}
    />
  );
}
