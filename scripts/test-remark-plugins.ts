import { readFileSync } from 'node:fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkLinkCard from 'remark-link-card';
import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

async function testRemarkPlugins() {
  console.log('Testing remark plugins...\n');

  // Read sample markdown file
  const markdown = readFileSync('content/blog/response-header-web-check-list.md', 'utf-8');

  console.log('Input: First 500 characters');
  console.log(markdown.substring(0, 500));
  console.log('\n---\n');

  try {
    // Process with remark plugins
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGithubBlockquoteAlert)
      .use(remarkLinkCard)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(markdown);

    console.log('Output: First 1000 characters of HTML');
    console.log(String(result).substring(0, 1000));
    console.log('\n---\n');

    // Check if link cards are generated
    const html = String(result);
    if (html.includes('class="rlc-container"') || html.includes('link-card')) {
      console.log('✓ remark-link-card appears to be working');
    } else {
      console.log('✗ remark-link-card may not be working as expected');
    }

    // Check if GFM alerts are converted
    if (html.includes('alert') || html.includes('note')) {
      console.log('✓ remark-github-blockquote-alert appears to be working');
    } else {
      console.log('✗ remark-github-blockquote-alert may not be working as expected');
    }

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error processing markdown:', error);
    process.exit(1);
  }
}

testRemarkPlugins();
