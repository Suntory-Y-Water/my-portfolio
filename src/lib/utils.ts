import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const processEnv = {
  QIITA_ACCESS_TOKEN: process.env.QIITA_ACCESS_TOKEN,
};

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}${path}`;
}

export function truncateText(inputText: string, maxLength: number): string {
  return inputText.length > maxLength ? `${inputText.slice(0, maxLength)}...` : inputText;
}
