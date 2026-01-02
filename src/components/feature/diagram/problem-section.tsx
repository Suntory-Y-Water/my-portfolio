import type { ProblemSectionData } from '@/types/diagram';
import { FormattedText, Icon } from './content-common';

export function ProblemSection({ data }: { data: ProblemSectionData }) {
  return (
    <div className='bg-muted'>
      <div className='w-full sm:max-w-7xl mx-auto p-4 sm:p-8 lg:p-12'>
        <div className='p-4 sm:p-6 mx-auto w-full sm:max-w-6xl text-center'>
          <div className='flex flex-col sm:flex-row items-center justify-center mb-8'>
            <Icon
              name='alert'
              size={40}
              className='mb-2 sm:mb-0 sm:mr-4 text-primary'
            />
            <h2 className='font-bold text-2xl sm:text-2xl lg:text-4xl text-center text-primary'>
              {data.title}
            </h2>
          </div>

          <p className='text-base sm:text-lg lg:text-xl w-full sm:max-w-5xl mx-auto leading-relaxed font-medium mb-8 text-foreground'>
            <FormattedText text={data.introText} />
          </p>

          <div
            className={`grid grid-cols-1 ${data.cards.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 mb-8`}
          >
            {data.cards.map((card, i) => (
              <div
                key={i}
                className={`bg-background p-6 rounded-sm border-2 ${card.isHighlight ? 'border-primary' : 'border-border'}`}
              >
                <div className='flex items-center justify-center mb-4'>
                  <Icon
                    name={card.icon}
                    size={32}
                    className={`mr-1 sm:mr-3 ${card.isHighlight ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                  <h3
                    className={`text-base sm:text-lg font-bold ${card.isHighlight ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {card.title}
                  </h3>
                </div>
                <p className='leading-relaxed font-medium mb-3 text-sm sm:text-base text-foreground'>
                  {card.subtitle}
                </p>
                <div
                  className={`p-4 rounded-lg ${card.isHighlight ? 'bg-muted' : 'bg-muted/50'}`}
                >
                  <p
                    className={`text-sm leading-relaxed ${card.isHighlight ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <FormattedText text={card.description} />
                  </p>
                </div>
              </div>
            ))}
          </div>

          {(data.summaryTitle || data.summaryText) && (
            <div className='bg-background p-6 sm:p-8 rounded-sm border-2 border-primary'>
              {data.summaryTitle && (
                <p className='text-lg sm:text-xl font-bold mb-4 text-primary'>
                  {data.summaryTitle}
                </p>
              )}
              {data.summaryText && (
                <p className='text-sm sm:text-base leading-relaxed text-foreground'>
                  <FormattedText text={data.summaryText} />
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
