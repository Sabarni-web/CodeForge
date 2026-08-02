/**
 * Dynamically builds the CodeForge Ownership Certificate string
 */

export const buildCertificate = (data, commentSyntax) => {
  const {
    ownerName,
    username,
    repoName,
    repoId,
    fileId,
    uploadDate,
    verificationUrl,
  } = data;

  const lines = [
    '===================================================',
    '',
    'CodeForge Ownership Certificate',
    '',
    'Owner:',
    ownerName,
    '',
    'Username:',
    username,
    '',
    'Repository:',
    repoName,
    '',
    'Repository ID:',
    repoId,
    '',
    'File ID:',
    fileId,
    '',
    'Uploaded:',
    uploadDate,
    '',
    'Protected By:',
    'CodeForge Guardian™',
    '',
    'Verification:',
    verificationUrl,
    '',
    '==================================================='
  ];

  if (commentSyntax.prefix) {
    // Single line comments repeated
    const content = lines.map(line => `${commentSyntax.prefix} ${line}`.trimEnd()).join('\n');
    return `${content}\n\n`;
  } else {
    // Block comments
    const content = lines.join('\n');
    return `${commentSyntax.start}\n${content}\n${commentSyntax.end}\n\n`;
  }
};
