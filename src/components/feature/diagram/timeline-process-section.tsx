import { Card } from '@/components/ui/card';
import type { TimelineProcessSectionData } from '@/types/diagram';
import { FormattedText, Icon, resolveColor } from './content-common';

export function TimelineProcessSection({
  data,
}: {
  data: TimelineProcessSectionData;
}) {
  return (
    <div className='bg-muted'>
      <div className='w-full sm:max-w-7xl mx-auto p-4 sm:p-8 lg:p-12'>
        <div className='p-4 sm:p-6 mx-auto w-full sm:max-w-6xl'>
          {/* タイトルセクション */}
          <div className='flex flex-col sm:flex-row items-center justify-center mb-8'>
            <Icon
              name={data.icon ?? 'clock'}
              size={40}
              className='mb-2 sm:mb-0 sm:mr-4 text-primary'
            />
            <h2 className='font-bold text-2xl sm:text-2xl lg:text-4xl text-center text-primary mb-0'>
              {data.title}
            </h2>
          </div>

          {/* 導入テキスト */}
          {data.introText && (
            <p className='text-base sm:text-lg lg:text-xl w-full sm:max-w-5xl mx-auto leading-relaxed font-medium mb-8 text-center text-foreground'>
              <FormattedText text={data.introText} />
            </p>
          )}

          {/* タイムライン */}
          <div className='relative max-w-4xl mx-auto'>
            {/* 縦線 */}
            <div className='absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-border' />

            {/* イベント */}
            <div className='space-y-8'>
              {data.events.map((event, index) => {
                const color = resolveColor(event.accentColor);
                const isHighlight = event.isHighlight ?? false;

                return (
                  <div key={index} className='relative pl-12 sm:pl-20'>
                    {/* タイムラインノード */}
                    <div
                      className='absolute left-2 sm:left-6 top-2 w-5 h-5 rounded-full border-2 transition-colors duration-200'
                      style={{
                        backgroundColor: isHighlight
                          ? color || 'hsl(var(--primary))'
                          : 'hsl(var(--background))',
                        borderColor: isHighlight
                          ? color || 'hsl(var(--primary))'
                          : 'hsl(var(--border))',
                      }}
                    />

                    {/* イベントカード */}
                    <Card
                      className={`bg-background p-4 sm:p-6 rounded-sm border-2 shadow-none transition-colors duration-200 hover:border-primary ${
                        isHighlight ? 'border-primary' : 'border-border'
                      }`}
                      style={{
                        borderColor: isHighlight ? color : undefined,
                      }}
                    >
                      {/* 時刻バッジ */}
                      <div className='mb-3'>
                        <span
                          className='inline-block py-1 text-xs sm:text-sm font-medium rounded-full'
                          style={{
                            color: isHighlight
                              ? color || 'hsl(var(--primary))'
                              : 'hsl(var(--muted-foreground))',
                          }}
                        >
                          {event.time}
                        </span>
                      </div>

                      {/* タイトル */}
                      <h3
                        className={`text-base sm:text-lg font-bold mb-2 ${
                          isHighlight ? 'text-primary' : 'text-foreground'
                        }`}
                        style={{
                          color: isHighlight ? color : undefined,
                        }}
                      >
                        {event.title}
                      </h3>

                      {/* 説明 */}
                      <p className='text-sm sm:text-base leading-relaxed text-foreground/90'>
                        <FormattedText text={event.description} />
                      </p>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
