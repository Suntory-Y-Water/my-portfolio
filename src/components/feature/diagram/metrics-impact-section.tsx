import { Card } from '@/components/ui/card';
import type { MetricsImpactSectionData } from '@/types/diagram';
import { FormattedText, Icon, resolveColor } from './content-common';

export function MetricsImpactSection({
  data,
}: {
  data: MetricsImpactSectionData;
}) {
  const layout = data.layout ?? 'horizontal';

  return (
    <div className='bg-muted'>
      <div className='w-full sm:max-w-7xl mx-auto p-4 sm:p-8 lg:p-12'>
        <div className='p-4 sm:p-6 mx-auto w-full sm:max-w-6xl'>
          <div className='flex flex-col sm:flex-row items-center justify-center mb-8'>
            <Icon
              name={data.icon ?? 'trendingUp'}
              size={40}
              className='mb-2 sm:mb-0 sm:mr-4 text-primary'
            />
            <h2 className='font-bold text-2xl sm:text-2xl lg:text-4xl text-center text-primary mb-0'>
              {data.title}
            </h2>
          </div>

          {data.introText && (
            <p className='text-base sm:text-lg lg:text-xl w-full sm:max-w-5xl mx-auto leading-relaxed font-medium mb-8 text-center text-foreground'>
              <FormattedText text={data.introText} />
            </p>
          )}

          <div
            className={`grid gap-4 sm:gap-6 ${
              layout === 'horizontal'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 max-w-md mx-auto'
            }`}
          >
            {data.metrics.map((metric, index) => {
              const color = resolveColor(metric.accentColor);

              return (
                <Card
                  key={index}
                  className='bg-background p-6 sm:p-8 rounded-sm border-2 border-border shadow-none text-center'
                  style={{
                    borderColor: color,
                  }}
                >
                  <div className='flex items-baseline justify-center mb-4'>
                    <span
                      className='text-4xl sm:text-5xl lg:text-6xl font-bold text-muted-foreground'
                      style={{ color }}
                    >
                      {metric.value}
                    </span>
                    {metric.unit && (
                      <span
                        className='text-xl sm:text-2xl font-bold ml-1 text-muted-foreground'
                        style={{ color }}
                      >
                        {metric.unit}
                      </span>
                    )}
                  </div>

                  <div className='text-base sm:text-lg font-semibold text-muted-foreground mb-2'>
                    {metric.label}
                  </div>

                  {metric.description && (
                    <div className='text-sm text-muted-foreground'>
                      <FormattedText text={metric.description} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
