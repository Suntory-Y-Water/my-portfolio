import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const processEnv = {
  QIITA_ACCESS_TOKEN: process.env.QIITA_ACCESS_TOKEN,
};
