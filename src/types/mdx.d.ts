// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type Frontmatter<T = {}> = {
  title: string;
  date: string;
  description: string;
} & T;

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type MDXData<T = {}> = {
  metadata: Frontmatter<T>;
  slug: string;
  content?: React.ReactNode;
  rawContent: string;
};
