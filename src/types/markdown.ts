export type Frontmatter<T> = {
  title: string;
  date: string;
  description: string;
} & T;

export type MarkdownData<T> = {
  metadata: Frontmatter<T>;
  slug: string;
  content?: React.ReactNode;
  rawContent: string;
  filePath: string;
};
