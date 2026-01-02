import type { ArticleData } from '@/types/diagram';
import { ActionSection } from './action-section';
import { CoreMessageSection } from './core-message-section';
import { HeroSection } from './hero-section';
import { ProblemSection } from './problem-section';
import { StepsSection } from './steps-section';
import { TransitionSection } from './transition-section';

type DynamicPageBuilderProps = {
  data: ArticleData;
};

export default function DynamicPageBuilder({ data }: DynamicPageBuilderProps) {
  return (
    <div className='min-h-screen font-sans'>
      {data.content.map((section) => {
        switch (section.type) {
          case 'hero':
            return <HeroSection key={section.id} data={section} />;
          case 'problem':
            return <ProblemSection key={section.id} data={section} />;
          case 'transition':
            return <TransitionSection key={section.id} />;
          case 'core_message':
            return <CoreMessageSection key={section.id} data={section} />;
          case 'steps':
            return <StepsSection key={section.id} data={section} />;
          case 'action':
            return <ActionSection key={section.id} data={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
