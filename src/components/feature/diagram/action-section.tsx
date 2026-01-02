import type { ActionSectionData } from '@/types/diagram';
import { FormattedText, Icon, resolveColor } from './content-common';

export function ActionSection({ data }: { data: ActionSectionData }) {
  const accentColor = resolveColor(data.accentColor);
  return (
    <div className='relative'>
      <div className='relative w-full sm:max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 z-10'>
        <div className='text-center flex justify-center sm:block'>
          <div className='inline-block shadow-xl w-full sm:max-w-3xl mx-1 sm:mx-auto overflow-hidden bg-background rounded-lg border-4 border-primary'>
            <div className='p-4 sm:p-6 bg-background'>
              <div
                className='px-3 sm:px-4 py-2 rounded-full font-bold text-sm sm:text-lg inline-flex items-center mb-4 text-primary-foreground bg-primary'
                style={{
                  backgroundColor: accentColor,
                }}
              >
                <Icon
                  name='check'
                  size={20}
                  className='mr-1 sm:mr-2'
                  color='currentColor'
                />
                Next Actions
              </div>
              <div className='flex items-center justify-center'>
                <h3 className='text-foreground font-bold text-center text-xl sm:text-2xl lg:text-3xl leading-tight'>
                  {data.title}
                </h3>
              </div>
            </div>

            <div className='p-4 sm:p-6 lg:p-8 bg-background'>
              <p className='text-sm sm:text-lg lg:text-xl text-foreground/90 leading-relaxed mb-6 font-medium'>
                <FormattedText text={data.mainText} />
              </p>

              <div className='bg-muted/50 p-6 rounded-lg border-2 border-dashed border-primary mb-6'>
                <h4 className='font-bold text-base sm:text-lg mb-4 flex items-center text-primary'>
                  <Icon name='pen' size={24} className='mr-1 sm:mr-2' />
                  {data.actionStepsTitle}
                </h4>
                <div className='space-y-3'>
                  {data.actionSteps.map((step, i) => (
                    <div
                      key={i}
                      className='bg-background p-4 rounded-sm border-l-4 border-l-primary text-left'
                    >
                      <p className='font-bold text-sm sm:text-base mb-2 text-primary'>
                        {step.title}
                      </p>
                      <p className='text-xs sm:text-sm text-foreground/90'>
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className='p-4 sm:p-5 rounded-md mb-6 border-l-4 border-l-primary bg-muted'>
                <p className='text-sm sm:text-base text-foreground/90 leading-relaxed'>
                  <strong className='text-primary'>ポイント:</strong>
                  {data.pointText}
                </p>
              </div>

              <div className='mt-6 p-4 rounded-lg text-center bg-primary'>
                <p className='font-bold text-lg text-white dark:text-background'>
                  {data.footerText}
                </p>
                <p className='text-sm mt-2 text-white dark:text-background'>
                  {data.subFooterText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
