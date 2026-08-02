const fs = require('fs');

const resolveFile = (filePath, keepBoth = true) => {
  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
  const newLines = [];
  let inConflict = false;

  for (const line of lines) {
    if (line.startsWith('<<<<<<< HEAD')) {
      inConflict = true;
      continue;
    }
    if (line.startsWith('=======')) {
      continue;
    }
    if (line.startsWith('>>>>>>> ')) {
      inConflict = false;
      continue;
    }
    newLines.push(line);
  }

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
  console.log(`Resolved ${filePath}`);
};

resolveFile('backend/src/app.js');
resolveFile('backend/src/models/File.js');
resolveFile('backend/src/controllers/fileController.js');
resolveFile('frontend/src/components/file/FileTree.jsx');
resolveFile('frontend/src/pages/FileViewPage.jsx');
resolveFile('frontend/src/pages/RepoDetailPage.jsx');
