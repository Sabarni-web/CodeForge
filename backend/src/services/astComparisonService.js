/**
 * astComparisonService.js
 * Compares structural fingerprints of files
 */

export const compareAST = (fingerprint1, fingerprint2) => {
  if (!fingerprint1 || !fingerprint2) return 0;
  
  // If identical exact hash
  if (fingerprint1 === fingerprint2) return 100;
  // If the new AST hashes match
  if (fingerprint1.astHash && fingerprint1.astHash === fingerprint2.astHash) return 100;

  // Calculate Jaccard index for identifiers (imports, functions, classes)
  const set1 = new Set([
    ...(fingerprint1.imports || []),
    ...(fingerprint1.functions || []),
    ...(fingerprint1.classes || []),
    ...(fingerprint1.dependencies || [])
  ]);
  
  const set2 = new Set([
    ...(fingerprint2.imports || []),
    ...(fingerprint2.functions || []),
    ...(fingerprint2.classes || []),
    ...(fingerprint2.dependencies || [])
  ]);
  
  if (set1.size === 0 && set2.size === 0) return 0; // If they were identical, hash check would have caught it
  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) intersection++;
  }
  
  const union = set1.size + set2.size - intersection;
  return (intersection / union) * 100;
};
