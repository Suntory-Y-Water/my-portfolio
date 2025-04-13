'use client';

import { Check, Copy } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type CodeBlockProps = {
  className?: string;
  children: ReactNode;
};

export function CodeBlock({ className, children, ...props }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  function copyToClipboard() {
    // 現在のコンポーネント内のpreタグを参照
    if (!preRef.current) return;

    const textContent = preRef.current.textContent || '';
    navigator.clipboard.writeText(textContent);

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000); // 1秒後にPOPUPを閉じる
  }

  return (
    <div className='group relative'>
      <pre
        ref={preRef}
        className={cn(
          'my-6 overflow-x-auto rounded-lg border border-border/50 p-4',
          'bg-[#111A1F] dark:bg-[#151A1E]',
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted',
          'pr-12', // コピーボタン用の余白
          className
        )}
        {...props}
      >
        {children}
      </pre>

      <div className='absolute right-3 top-3'>
        {/* コピー成功メッセージ */}
        {isCopied && (
          <div className='absolute right-10 top-0 z-20 rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-foreground'>
            Copied!
          </div>
        )}

        <Button
          variant='outline'
          size='icon'
          className='z-10 size-8 rounded-md opacity-70 transition-opacity hover:bg-muted/30 hover:opacity-100'
          onClick={copyToClipboard}
          aria-label='コードをコピー'
        >
          {isCopied ? (
            <Check className='size-4 text-green-500' />
          ) : (
            <Copy className='size-4 text-muted-foreground' />
          )}
        </Button>
      </div>
    </div>
  );
}
