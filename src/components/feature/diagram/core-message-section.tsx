import type { CoreMessageSectionData } from '@/types/diagram';
import { FormattedText, Icon } from './content-common';

export function CoreMessageSection({ data }: { data: CoreMessageSectionData }) {
  return (
    <div className='bg-background relative border-4 border-primary'>
      <div className='relative w-full sm:max-w-7xl mx-auto p-4 sm:p-8 lg:p-12'>
        <div className='p-4 sm:p-6 mx-auto w-full sm:max-w-5xl text-center mb-8'>
          <div className='mb-4'>
            <div className='inline-block rounded-full px-4 py-2 mb-3 bg-primary'>
              <span className='text-sm font-bold text-primary-foreground uppercase tracking-wider'>
                CORE MESSAGE
              </span>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row items-center justify-center mb-6'>
            <Icon
              name='target'
              size={40}
              className='mb-2 sm:mb-0 sm:mr-4 text-primary'
            />
            <h2 className='font-bold text-2xl sm:text-2xl lg:text-4xl text-center text-primary'>
              {data.title}
            </h2>
          </div>

          <p className='text-base sm:text-lg lg:text-xl w-full sm:max-w-4xl mx-auto leading-relaxed font-medium mb-8 text-foreground'>
            <FormattedText text={data.mainMessage} />
          </p>

          {data.comparisons && (
            <div className='grid md:grid-cols-2 gap-6 mb-8'>
              {data.comparisons.map((item, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-lg border-2 ${item.isGood ? 'bg-muted border-primary' : 'bg-muted/50 border-border'}`}
                >
                  <div className='flex items-center justify-center mb-4'>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 ${item.isGood ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-white'}`}
                    >
                      <Icon name={item.isGood ? 'zap' : 'alert'} size={20} />
                    </div>
                    <p
                      className={`font-bold text-base sm:text-lg ${item.isGood ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {item.title}
                    </p>
                  </div>
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${item.isGood ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <FormattedText text={item.text} />
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className='text-primary-foreground p-6 sm:p-8 rounded-lg bg-primary'>
            <p className='text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed mb-4'>
              <span className='text-primary-foreground'>
                {data.coreHighlight.title}
              </span>
            </p>
            <p className='text-primary-foreground/80 sm:text-lg'>
              <FormattedText text={data.coreHighlight.text} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
