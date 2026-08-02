/**
 * Maps file extensions to their respective comment syntax
 * { extension: { start: 'comment start', end: 'comment end' } }
 * For single line comments used as block (like Python # or SQL --), start and end can be the same, 
 * or we can just use the block comment if available.
 */

export const commentSyntaxMap = {
  // JavaScript / TypeScript / C-family
  '.js': { start: '/*', end: '*/' },
  '.jsx': { start: '/*', end: '*/' },
  '.ts': { start: '/*', end: '*/' },
  '.tsx': { start: '/*', end: '*/' },
  '.c': { start: '/*', end: '*/' },
  '.cpp': { start: '/*', end: '*/' },
  '.cs': { start: '/*', end: '*/' },
  '.go': { start: '/*', end: '*/' },
  '.rs': { start: '/*', end: '*/' },
  '.java': { start: '/*', end: '*/' },
  '.php': { start: '/*', end: '*/' },
  '.swift': { start: '/*', end: '*/' },
  '.kt': { start: '/*', end: '*/' },
  '.css': { start: '/*', end: '*/' },
  '.scss': { start: '/*', end: '*/' },
  '.vue': { start: '<!--', end: '-->' }, // Vue can have html, script, style, but top level is usually HTML-like
  '.svelte': { start: '<!--', end: '-->' },

  // HTML / XML / Markdown
  '.html': { start: '<!--', end: '-->' },
  '.xml': { start: '<!--', end: '-->' },
  '.md': { start: '<!--', end: '-->' },

  // Scripting / Python / Ruby
  '.py': { start: '"""', end: '"""' },
  '.rb': { start: '=begin', end: '=end' },
  '.sh': { start: '#', end: '#', prefix: '#' }, // We will handle prefixing each line if needed, but # block is fine
  '.bat': { start: 'REM', end: 'REM', prefix: 'REM ' },
  
  // Data / Config
  '.sql': { start: '/*', end: '*/' }, // SQL supports /* */ in many dialects, or -- for single line. Using /* */
  '.yaml': { start: '#', end: '#', prefix: '#' },
  '.yml': { start: '#', end: '#', prefix: '#' },
  '.json': { start: '', end: '', unsupported: true }, // JSON does not support comments natively
};

// Dockerfile
commentSyntaxMap['dockerfile'] = { start: '#', end: '#', prefix: '#' };
