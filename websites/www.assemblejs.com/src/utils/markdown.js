/**
 * Utility functions for markdown content
 */

/**
 * Fetches markdown content from a URL
 * @param {string} url - The URL to fetch markdown from
 * @returns {Promise<string>} - The markdown content as a string
 */
export const fetchMarkdown = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching markdown:`, error);
    return `# Error Loading Content\n\nSorry, we couldn't load the content you requested. Please try again later.\n\nError: ${error.message}`;
  }
};

/**
 * Converts a GitHub-style anchor (e.g., #section-name) to a slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The slug
 */
export const toSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

/**
 * Extracts the table of contents from markdown content
 * @param {string} markdown - The markdown content
 * @returns {Array<{level: number, text: string, slug: string}>} - Array of TOC items
 */
export const extractTableOfContents = (markdown) => {
  if (!markdown) return [];
  
  const toc = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const slug = toSlug(text);
    
    toc.push({ level, text, slug });
  }
  
  return toc;
};

/**
 * Process code blocks in the markdown to add line numbers and syntax highlighting
 * @param {string} markdown - The markdown content 
 * @returns {string} - The processed markdown
 */
export const processCodeBlocks = (markdown) => {
  if (!markdown) return '';
  
  // Find code blocks and add line numbers
  return markdown.replace(/```(\w+)?\n([\s\S]+?)```/g, (match, language, code) => {
    const lines = code.trim().split('\n');
    const lineNumbers = lines.map((_, i) => i + 1).join('\n');
    const lang = language || 'plaintext';
    
    return `<div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-block-language">${lang}</span>
      </div>
      <div class="code-block">
        <div class="line-numbers">
          ${lineNumbers}
        </div>
        <pre><code class="language-${lang}">${code}</code></pre>
      </div>
    </div>`;
  });
};