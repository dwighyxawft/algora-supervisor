import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserTypescript from 'prettier/parser-typescript';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';
import parserMarkdown from 'prettier/parser-markdown';

export async function formatCode(code: string, language: string): Promise<string> {
  try {
    const parser = getParser(language);
    if (!parser) {
      return code; // Return original if no parser available
    }

    const formatted = await prettier.format(code, {
      parser,
      plugins: [parserBabel, parserTypescript, parserHtml, parserCss, parserMarkdown],
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 80,
    });

    return formatted;
  } catch (error) {
    console.error('Formatting error:', error);
    return code; // Return original on error
  }
}

function getParser(language: string): string | null {
  const parserMap: Record<string, string> = {
    javascript: 'babel',
    typescript: 'typescript',
    jsx: 'babel',
    tsx: 'typescript',
    json: 'json',
    html: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    markdown: 'markdown',
  };

  return parserMap[language.toLowerCase()] || null;
}
