/**
 * styleComparisonService.js
 * Compares coding styles
 */

export const compareStyle = (style1, style2) => {
  if (!style1 || !style2) return 0;
  
  let score = 100;
  
  // Indentation matches
  if (style1.indentation !== style2.indentation) {
    score -= 30; // High penalty for different indentation
  }
  
  // Comment density (allow 15% variance)
  const densityDiff = Math.abs((style1.commentDensity || 0) - (style2.commentDensity || 0));
  if (densityDiff > 0.15) {
    score -= 20;
  }
  
  // Bracket placement style
  if (style1.braceStyle !== style2.braceStyle) {
    score -= 30;
  }
  
  return Math.max(0, score);
};
