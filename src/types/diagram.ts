export type IconName =
  | 'alert'
  | 'check'
  | 'help'
  | 'arrow'
  | 'lightbulb'
  | 'zap'
  | 'message'
  | 'target'
  | 'users'
  | 'search'
  | 'pen'
  | 'flag';

export type SectionType =
  | 'hero'
  | 'problem'
  | 'core_message'
  | 'steps'
  | 'message'
  | 'action'
  | 'transition';

export type BaseSection = {
  id: string;
  type: SectionType;
};

export type HeroSectionData = BaseSection & {
  type: 'hero';
  date: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
};

export type ProblemCard = {
  icon: IconName;
  title: string;
  subtitle: string;
  description: string;
  isHighlight?: boolean;
};

export type ProblemSectionData = BaseSection & {
  type: 'problem';
  title: string;
  introText: string;
  cards: ProblemCard[];
  summaryTitle?: string;
  summaryText?: string;
};

export type ComparisonItem = {
  icon: IconName;
  title: string;
  text: string;
  isGood: boolean;
};

export type CoreMessageSectionData = BaseSection & {
  type: 'core_message';
  title: string;
  mainMessage: string;
  comparisons?: ComparisonItem[];
  coreHighlight: {
    title: string;
    text: string;
  };
};

export type StepItem = {
  number: number;
  title: string;
  text: string;
  detailTitle?: string;
  details?: string[];
  detailText?: string;
};

export type StepsSectionData = BaseSection & {
  type: 'steps';
  title: string;
  introText: string;
  steps: StepItem[];
};

export type ActionStep = {
  title: string;
  description: string;
};

export type ActionSectionData = BaseSection & {
  type: 'action';
  title: string;
  mainText: string;
  actionStepsTitle: string;
  actionSteps: ActionStep[];
  pointText: string;
  footerText: string;
  subFooterText: string;
};

export type TransitionSectionData = BaseSection & {
  type: 'transition';
};

// Union Type for all sections
export type ArticleSection =
  | HeroSectionData
  | ProblemSectionData
  | CoreMessageSectionData
  | StepsSectionData
  | ActionSectionData
  | TransitionSectionData;

// Article Data Structure
export type ArticleData = {
  meta: {
    id: string;
    title: string;
  };
  content: ArticleSection[];
};
