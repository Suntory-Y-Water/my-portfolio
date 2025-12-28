export function splitMarkdownPages(markdown: string): string[] {
  const pages = markdown
    .split(/\n---\n/)
    .map((page) => page.trim())
    .filter((page) => page.length > 0);

  return pages.length > 0 ? pages : [markdown.trim()];
}
export function getFirstPage(markdown: string): string {
  const pages = splitMarkdownPages(markdown);
  return pages[0] || '';
}
