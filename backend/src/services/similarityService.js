import { compareAST } from './astComparisonService.js';
import { compareStyle } from './styleComparisonService.js';
import { compareStructure } from './structureComparisonService.js';

export const calculateSimilarity = (tempFileDnaArray, storedFileDnaArray, tempRepoDna, storedRepoDna, storedFunctionDnaArray = []) => {
  // We want to calculate overall similarity
  
  // 1. Structure Similarity (Repo level)
  const structureScore = compareStructure(tempRepoDna, storedRepoDna);
  
  // 2. File Level Similarities (AST & Style)
  let totalAstScore = 0;
  let totalStyleScore = 0;
  let totalFunctionScore = 0;
  let totalComplexityScore = 0;
  let matchedFiles = [];
  
  // Create a fast lookup for stored files by path or hash
  const storedFilesMap = new Map();
  storedFileDnaArray.forEach(f => {
    storedFilesMap.set(f.path, f);
  });
  
  let matchCount = 0;
  
  tempFileDnaArray.forEach(tempFile => {
    // Try to find the exact path match first
    let bestMatch = storedFilesMap.get(tempFile.path);
    let bestScore = 0;
    
    // If no exact path, try to find the most structurally similar file
    if (!bestMatch) {
      let highestSimilarity = 0;
      for (const storedFile of storedFileDnaArray) {
        const sim = compareAST(tempFile, storedFile);
        if (sim > highestSimilarity) {
          highestSimilarity = sim;
          bestMatch = storedFile;
          bestScore = sim;
        }
      }
    } else {
      bestScore = compareAST(tempFile, bestMatch);
    }
    
    if (bestMatch) {
      const astScore = bestScore;
      let styleScore = 0;
      if (tempFile.styleFingerprint && tempFile.styleFingerprint === bestMatch.styleHash) {
        styleScore = 100;
      } else {
        styleScore = compareStyle(tempFile.styleData, bestMatch.styleData);
      }
      
      // Complexity score
      const tempComp = tempFile.complexityMetrics || 0;
      const storedComp = bestMatch.complexity || 0;
      const compDiff = Math.abs(tempComp - storedComp);
      const maxComp = Math.max(tempComp, storedComp) || 1;
      const compScore = Math.max(0, 100 - (compDiff / maxComp) * 100);
      
      // Calculate function score using FunctionDNA
      let functionScore = astScore * 0.8; // Fallback
      if (tempFile.functions && storedFunctionDnaArray.length > 0) {
         let matchFns = 0;
         const fileStoredFns = storedFunctionDnaArray.filter(f => f.file.toString() === bestMatch._id?.toString());
         
         if (tempFile.functions.length > 0 && fileStoredFns.length > 0) {
            tempFile.functions.forEach(f => {
               // Exact match on functionHash or signatureHash
               if (fileStoredFns.some(sf => sf.signatureHash === f.signatureHash || sf.functionHash === f.functionHash)) {
                 matchFns++;
               }
            });
            functionScore = (matchFns / tempFile.functions.length) * 100;
         }
      }
      
      totalAstScore += astScore;
      totalStyleScore += styleScore;
      totalComplexityScore += compScore;
      totalFunctionScore += functionScore;
      
      matchCount++;
      
      if (astScore > 50) {
        matchedFiles.push({
          path: tempFile.path,
          matchedWith: bestMatch.path,
          similarity: Math.round((astScore + styleScore + compScore) / 3)
        });
      }
    }
  });
  
  const avgAst = matchCount > 0 ? totalAstScore / matchCount : 0;
  const avgStyle = matchCount > 0 ? totalStyleScore / matchCount : 0;
  const avgComp = matchCount > 0 ? totalComplexityScore / matchCount : 0;
  const avgFunc = matchCount > 0 ? totalFunctionScore / matchCount : 0;
  
  // Weighted overall score
  // AST: 35%, Structure: 20%, Style: 15%, Function: 10%, Complexity: 10%, Imports/Dependencies: 10%
  // But our AST score implicitly includes imports and dependencies since compareAST does Jaccard on them.
  const overallSimilarityScore = (avgAst * 0.45) + (avgStyle * 0.15) + (structureScore * 0.20) + (avgComp * 0.10) + (avgFunc * 0.10);
  
  return {
    overallSimilarityScore: Math.round(overallSimilarityScore),
    rawOverallScore: overallSimilarityScore,
    structureScore: Math.round(structureScore),
    styleScore: Math.round(avgStyle),
    functionScore: Math.round(avgFunc),
    complexityScore: Math.round(avgComp),
    matchedFiles
  };
};
