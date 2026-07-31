export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Not authorized to access this resource',
  FORBIDDEN: 'You do not have permission to perform this action',
  SERVER_ERROR: 'Internal server error',
  REPO_NOT_FOUND: 'Repository not found',
  FILE_NOT_FOUND: 'File not found',
  COMMIT_NOT_FOUND: 'Commit not found',
  SITE_NOT_FOUND: 'Generated site not found',
  DUPLICATE_REPO: 'A repository with this name already exists',
  DUPLICATE_FILE: 'A file with this path already exists in this repository',
};

export const MIME_TYPES = {
  js: 'application/javascript',
  jsx: 'application/javascript',
  ts: 'application/typescript',
  tsx: 'application/typescript',
  json: 'application/json',
  html: 'text/html',
  css: 'text/css',
  md: 'text/markdown',
  txt: 'text/plain',
  py: 'text/x-python',
  java: 'text/x-java',
  c: 'text/x-c',
  cpp: 'text/x-c++',
  go: 'text/x-go',
  rs: 'text/x-rust',
  rb: 'text/x-ruby',
  php: 'text/x-php',
  sql: 'text/x-sql',
  sh: 'text/x-shellscript',
  yml: 'text/yaml',
  yaml: 'text/yaml',
  xml: 'text/xml',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  ico: 'image/x-icon',
};

/**
 * Get MIME type from file extension
 * @param {string} filename
 * @returns {string}
 */
export const getMimeType = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return MIME_TYPES[ext] || 'text/plain';
};
