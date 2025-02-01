import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const envConfig = {
  QIITA_ACCESS_TOKEN: process.env.QIITA_ACCESS_TOKEN,
  ZENN_USERNAME: process.env.ZENN_USERNAME,
  QIITA_USERNAMES: process.env.QIITA_USERNAMES,
  REVALIDATE_TIME: process.env.REVALIDATE_TIME,
};
