import Image from 'next/image';
import React from 'react';

interface ImageComponentProps {
  src: string;
  alt: string;
}

function ImageComponent({ src, alt }: ImageComponentProps) {
  return (
    <div className='rounded-2xl overflow-hidden transform transition duration-300 hover:scale-105'>
      <Image src={src} alt={alt} width={500} height={500} priority={true} />
    </div>
  );
}

export default ImageComponent;
