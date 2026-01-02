import React from 'react';
import type { FlowChartSectionData } from '@/types/diagram';
import { Icon } from './content-common';

export function FlowChartSection({ data }: { data: FlowChartSectionData }) {
  // TODO: ハイライトカラー対応

  return (
    <div className='bg-muted'>
      <div className='w-full sm:max-w-7xl mx-auto p-4 sm:p-8 lg:p-12'>
        <div className='p-4 sm:p-6 mx-auto w-full sm:max-w-6xl text-center'>
          {data.title && (
            <p className='text-lg sm:text-xl font-bold mb-6 text-primary'>
              {data.title}
            </p>
          )}

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8'>
            {data.flows.map((item, i) => {
              const isLast = i === data.flows.length - 1;

              return (
                <React.Fragment key={i}>
                  <div
                    className={`p-4 sm:p-6 rounded-lg w-full sm:w-auto ${
                      item.highlight
                        ? 'bg-primary border-primary'
                        : 'bg-background border-2 border-border'
                    }`}
                  >
                    <p
                      className={`font-bold mb-2 ${item.highlight ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      {item.label}
                    </p>
                    {item.subLabel && (
                      <p
                        className={`text-sm ${item.highlight ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}
                      >
                        {item.subLabel}
                      </p>
                    )}
                  </div>

                  {!isLast && (
                    <div className='transform sm:rotate-0 rotate-90 text-primary'>
                      <Icon name='arrowRight' size={32} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
