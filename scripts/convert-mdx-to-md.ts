import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

interface ConversionStats {
  total: number;
  success: number;
  failed: number;
  linkPreviewCount: number;
  calloutCount: number;
  imageCount: number;
}

function convertMdxToMd(mdxContent: string): { content: string; stats: { linkPreview: number; callout: number; image: number } } {
  let content = mdxContent;
  let linkPreviewCount = 0;
  let calloutCount = 0;
  let imageCount = 0;

  // Convert <LinkPreview url='...' /> to plain link
  content = content.replace(/<LinkPreview\s+url=['"](.*?)['"]\s*\/>/g, (match, url) => {
    linkPreviewCount++;
    return `[${url}](${url})`;
  });

  // Convert <Callout type='...' title='...'>...</Callout> to GFM Alerts
  content = content.replace(/<Callout\s+type=['"](.*?)['"]\s+title=['"](.*?)['"]\s*>([\s\S]*?)<\/Callout>/g, (match, type, title, content) => {
    calloutCount++;
    const trimmedContent = content.trim();
    const alertType = type.toUpperCase();
    // Convert to GFM Alerts format
    return `> [!${alertType}]${title ? `\n> **${title}**` : ''}\n> ${trimmedContent.replace(/\n/g, '\n> ')}`;
  });

  // Convert <Callout>...</Callout> without type
  content = content.replace(/<Callout\s*>([\s\S]*?)<\/Callout>/g, (match, content) => {
    calloutCount++;
    const trimmedContent = content.trim();
    return `> [!NOTE]\n> ${trimmedContent.replace(/\n/g, '\n> ')}`;
  });

  // Convert <Image src='...' alt='...' /> to standard Markdown
  content = content.replace(/<Image\s+src=['"](.*?)['"]\s+alt=['"](.*?)['"]\s*\/>/g, (match, src, alt) => {
    imageCount++;
    return `![${alt}](${src})`;
  });

  // Convert <Image src='...' /> to standard Markdown (alt not specified)
  content = content.replace(/<Image\s+src=['"](.*?)['"]\s*\/>/g, (match, src) => {
    imageCount++;
    return `![](${src})`;
  });

  return {
    content,
    stats: {
      linkPreview: linkPreviewCount,
      callout: calloutCount,
      image: imageCount,
    },
  };
}

function convertAllMdxFiles(sourceDir: string, targetDir: string, testMode = false): ConversionStats {
  const stats: ConversionStats = {
    total: 0,
    success: 0,
    failed: 0,
    linkPreviewCount: 0,
    calloutCount: 0,
    imageCount: 0,
  };

  // Create target directory if not exists
  mkdirSync(targetDir, { recursive: true });

  // Get all .mdx files
  const files = readdirSync(sourceDir).filter(file => file.endsWith('.mdx'));

  // In test mode, only process first 3 files
  const filesToProcess = testMode ? files.slice(0, 3) : files;

  console.log(`Processing ${filesToProcess.length} files...${testMode ? ' (TEST MODE)' : ''}\n`);

  for (const file of filesToProcess) {
    stats.total++;
    const sourcePath = join(sourceDir, file);
    const targetPath = join(targetDir, file.replace('.mdx', '.md'));

    try {
      // Read MDX file
      const mdxContent = readFileSync(sourcePath, 'utf-8');

      // Parse frontmatter and content with original formatting preserved
      const parsed = matter(mdxContent, {
        engines: {
          yaml: {
            parse: (str: string) => str, // Keep original YAML as string
            stringify: (obj: unknown) => obj as string,
          },
        },
      });

      const { data: frontmatterStr, content } = parsed as { data: string; content: string };

      // Convert MDX components to Markdown
      const { content: convertedContent, stats: conversionStats } = convertMdxToMd(content);

      // Update stats
      stats.linkPreviewCount += conversionStats.linkPreview;
      stats.calloutCount += conversionStats.callout;
      stats.imageCount += conversionStats.image;

      // Reconstruct file with original frontmatter
      const output = `---\n${frontmatterStr.trim()}\n---\n\n${convertedContent}`;

      // Write to target file
      writeFileSync(targetPath, output, 'utf-8');

      console.log(`✓ ${file} → ${file.replace('.mdx', '.md')}`);
      console.log(`  LinkPreview: ${conversionStats.linkPreview}, Callout: ${conversionStats.callout}, Image: ${conversionStats.image}`);

      stats.success++;
    } catch (error) {
      console.error(`✗ Failed to convert ${file}:`, error);
      stats.failed++;
    }
  }

  return stats;
}

// Main execution
const sourceDir = 'src/content/blog';
const targetDir = 'content/blog';
const testMode = process.argv.includes('--test');

console.log('MDX to Markdown Converter\n');
console.log('='.repeat(50));

const stats = convertAllMdxFiles(sourceDir, targetDir, testMode);

console.log('\n' + '='.repeat(50));
console.log('Conversion Summary:');
console.log(`Total files: ${stats.total}`);
console.log(`Success: ${stats.success}`);
console.log(`Failed: ${stats.failed}`);
console.log(`\nComponents converted:`);
console.log(`  LinkPreview: ${stats.linkPreviewCount}`);
console.log(`  Callout: ${stats.calloutCount}`);
console.log(`  Image: ${stats.imageCount}`);

if (stats.failed > 0) {
  console.error('\n⚠️  Some files failed to convert. Please check the errors above.');
  process.exit(1);
} else {
  console.log('\n✓ All files converted successfully!');
}
