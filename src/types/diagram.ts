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
  | 'flag'
  | 'arrowRight';

export type SectionType =
  | 'hero'
  | 'problem'
  | 'core_message'
  | 'steps'
  | 'message'
  | 'action'
  | 'transition'
  | 'score_comparison'
  | 'list_steps'
  | 'flow_chart';

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

export type ScoreItem = {
  title: string;
  value: string | number;
  unit: string;
  barPercentage: number;
  barColor?: string;
  valueColor?: string;
  description?: string;
};

export type ScoreComparisonSectionData = BaseSection & {
  type: 'score_comparison';
  title: string;
  introText?: string;
  scores: ScoreItem[];
};

export type ListStepItem = {
  title: string;
  subtitle?: string;
  description: string;
  badge: string;
  badgeColor?: string;
};

export type ListStepsSectionData = BaseSection & {
  type: 'list_steps';
  title: string;
  introText?: string;
  steps: ListStepItem[];
  summaryTitle?: string;
  summaryText?: string;
};

// 3. Flow Chart
export type FlowItem = {
  label: string;
  subLabel?: string;
  highlight?: boolean;
  borderColor?: string;
  bgColor?: string;
};

export type FlowChartSectionData = BaseSection & {
  type: 'flow_chart';
  title: string;
  introText?: string;
  flows: FlowItem[];
};

// Union Type for all sections
export type ArticleSection =
  | HeroSectionData
  | ProblemSectionData
  | CoreMessageSectionData
  | StepsSectionData
  | ActionSectionData
  | TransitionSectionData
  | ScoreComparisonSectionData
  | ListStepsSectionData
  | FlowChartSectionData;

// Article Data Structure
export type ArticleData = {
  meta: {
    id: string;
    title: string;
  };
  content: ArticleSection[];
};
