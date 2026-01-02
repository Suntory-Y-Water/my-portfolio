import type { HeroSectionData } from '@/types/diagram';

export function HeroSection({ data }: { data: HeroSectionData }) {
  return (
    <div className='bg-background'>
      <div className='w-full sm:max-w-7xl mx-auto pt-0 px-4 pb-4 sm:p-8 lg:p-12 text-center'>
        <p className='text-base mb-4 font-mono text-muted-foreground'>
          {data.date}
        </p>
        <div className='flex flex-col sm:flex-row items-center justify-center mb-6'>
          <h1 className='font-bold leading-tight text-center text-2xl sm:text-3xl lg:text-5xl text-primary'>
            {data.title}
          </h1>
        </div>
        <p className='text-base sm:text-lg lg:text-xl w-full sm:max-w-4xl mx-auto leading-relaxed font-medium mb-8 sm:mb-12 px-2 sm:px-0 border-l-4 sm:border-l-0 sm:border-b-4 sm:pb-4 text-foreground border-primary'>
          {data.subtitle}
        </p>
      </div>
    </div>
  );
}
