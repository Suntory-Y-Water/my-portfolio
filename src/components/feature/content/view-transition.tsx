'use client';

import type React from 'react';
import { ViewTransition } from 'react';

type ViewTransitionProps = {
  name: string;
  children: React.ReactNode;
};

export function BlogViewTransition({ name, children }: ViewTransitionProps) {
  return <ViewTransition name={name}>{children}</ViewTransition>;
}
