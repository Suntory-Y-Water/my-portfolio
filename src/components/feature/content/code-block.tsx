'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';

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
    <pre
      ref={preRef}
      className={cn(
        'my-6 overflow-x-auto rounded-lg border border-border/50 p-4',
        'bg-[#111A1F] dark:bg-[#151A1E]',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted',
        'relative pr-12', // コピーボタン用の余白
        className,
      )}
      {...props}
    >
      {children}

      {/* コピー成功メッセージ */}
      {isCopied && (
        <div className='absolute right-12 top-2 rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-foreground'>
          Copied!
        </div>
      )}

      <Button
        variant='ghost'
        size='icon'
        className='absolute right-2 top-2 h-8 w-8 rounded-md opacity-70 transition-opacity hover:bg-muted/30 hover:opacity-100'
        onClick={copyToClipboard}
        aria-label='コードをコピー'
      >
        {isCopied ? (
          <Check className='h-4 w-4 text-green-500' />
        ) : (
          <Copy className='h-4 w-4 text-muted-foreground' />
        )}
      </Button>
    </pre>
  );
}
