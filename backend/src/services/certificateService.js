/**
 * Certificate checking logic
 */

export const containsCertificate = (fileBuffer) => {
  if (!fileBuffer) return false;
  
  const contentStr = fileBuffer.toString('utf-8');
  // Simple check for the unique certificate signature
  return contentStr.includes('CodeForge Ownership Certificate') && contentStr.includes('CodeForge Guardian™');
};
