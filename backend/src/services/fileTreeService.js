/**
 * Build a nested file tree from an array of flat file documents
 * @param {Array} files - Array of file documents with { _id, name, path, size, mimeType, isDirectory }
 * @returns {Array} Nested tree structure
 *
 * Example input:
 *   [{ path: 'src/index.js' }, { path: 'src/utils/helpers.js' }, { path: 'README.md' }]
 *
 * Example output:
 *   [
 *     { name: 'src', type: 'directory', children: [
 *       { name: 'index.js', type: 'file', ... },
 *       { name: 'utils', type: 'directory', children: [
 *         { name: 'helpers.js', type: 'file', ... }
 *       ]}
 *     ]},
 *     { name: 'README.md', type: 'file', ... }
 *   ]
 */
export const buildFileTree = (files) => {
  const root = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;

      const existing = currentLevel.find((item) => item.name === part);

      if (isLastPart) {
        // This is the actual file
        if (!existing) {
          currentLevel.push({
            _id: file._id,
            name: part,
            path: file.path,
            type: file.isDirectory ? 'directory' : 'file',
            size: file.size || 0,
            mimeType: file.mimeType || 'text/plain',
            children: file.isDirectory ? [] : undefined,
          });
        }
      } else {
        // This is an intermediate directory
        if (existing && existing.type === 'directory') {
          currentLevel = existing.children;
        } else {
          const newDir = {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            type: 'directory',
            children: [],
          };
          currentLevel.push(newDir);
          currentLevel = newDir.children;
        }
      }
    }
  }

  // Sort: directories first, then files, alphabetically
  const sortTree = (nodes) => {
    nodes.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => {
      if (node.children) sortTree(node.children);
    });
  };

  sortTree(root);
  return root;
};
