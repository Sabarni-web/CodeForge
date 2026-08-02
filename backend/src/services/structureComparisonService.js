/**
 * structureComparisonService.js
 * Compares folder structures and overall dependency shapes
 */

export const compareStructure = (repoDna1, repoDna2) => {
  if (!repoDna1 || !repoDna2) return 0;
  
  // We can compare languages distribution and overall counts
  const lang1 = repoDna1.languageProfile || {};
  const lang2 = repoDna2.languageProfile || {};
  
  let langScore = 0;
  const allLangs = new Set([...Object.keys(lang1), ...Object.keys(lang2)]);
  if (allLangs.size === 0) return 100;
  
  let totalWeight = 0;
  let matchWeight = 0;
  
  for (const lang of allLangs) {
    const val1 = lang1[lang] || 0;
    const val2 = lang2[lang] || 0;
    const maxVal = Math.max(val1, val2);
    const minVal = Math.min(val1, val2);
    
    totalWeight += maxVal;
    matchWeight += minVal;
  }
  
  if (totalWeight > 0) {
    langScore = (matchWeight / totalWeight) * 100;
  } else {
    langScore = 100;
  }
  
  // Total files difference (penalty for large diffs, but smaller diffs are okay)
  const files1 = repoDna1.totalFiles || 0;
  const files2 = repoDna2.totalFiles || 0;
  
  let sizeScore = 100;
  // If one of them is a single pasted snippet, do not penalize size!
  if (files1 === 1 || files2 === 1) {
    sizeScore = 100;
  } else if (files1 > 0 || files2 > 0) {
    const diff = Math.abs(files1 - files2);
    const max = Math.max(files1, files2);
    sizeScore = Math.max(0, 100 - (diff / max) * 100);
  }

  // Final structure score based on language breakdown and size
  return (langScore * 0.7) + (sizeScore * 0.3);
};
