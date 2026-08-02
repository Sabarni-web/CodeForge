import { generateSHA256 } from './hashService.js';

/**
 * Perform a structural analysis without a full AST parser for generic support.
 * It counts structural elements and generates a structure hash.
 */
export const analyzeStructure = (code, language) => {
  const lines = code.split('\n');
  let imports = [];
  let functions = [];
  let classes = [];
  let dependencies = [];

  const structureTokens = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Simple heuristic for imports
    if (/^(import|require|include|using|#include|from)\b/.test(trimmed)) {
      imports.push(trimmed);
      structureTokens.push('IMPORT');
      
      // Basic dependency extraction
      const match = trimmed.match(/['"]([^'"]+)['"]/);
      if (match) dependencies.push(match[1]);
      continue;
    }

    // Simple heuristic for functions/methods
    if (/(function\s+\w+|\w+\s*\(.*?\)\s*\{|def\s+\w+|func\s+\w+|public\s+\w+\s+\w+\s*\(|private\s+\w+\s+\w+\s*\()/.test(trimmed)) {
      functions.push(trimmed);
      structureTokens.push('FUNCTION');
    }

    // Simple heuristic for classes
    if (/^class\s+\w+/.test(trimmed)) {
      classes.push(trimmed);
      structureTokens.push('CLASS');
    }

    // Extract basic structure based on control flow words
    if (/\b(if|else|for|while|switch|case|return|try|catch|finally)\b/.test(trimmed)) {
      const match = trimmed.match(/\b(if|else|for|while|switch|case|return|try|catch|finally)\b/g);
      if (match) {
        structureTokens.push(...match.map(m => m.toUpperCase()));
      }
    }
  }

  // Generate a signature/hash of the structure
  const structureSignature = structureTokens.join('_');
  const astHash = generateSHA256(structureSignature);

  return {
    astHash,
    structureHash: astHash, // Can be the same for now
    imports,
    functions,
    classes,
    dependencies,
    lineCount: lines.length,
    structureSignature: structureSignature.substring(0, 100) // just for debugging/preview
  };
};

/**
 * Heuristics-based Function extractor for Function DNA
 */
export const extractFunctions = (code, language) => {
  const functions = [];
  const lines = code.split('\n');
  
  // Basic regex to find function signatures
  const funcRegex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>)|def\s+(\w+)|func\s+(\w+)|(?:public|private|protected)\s+(?:static\s+)?[\w<>[\]]+\s+(\w+)\s*\()/g;

  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    const functionName = match[1] || match[2] || match[3] || match[4] || match[5];
    if (functionName) {
      functions.push({
        functionName,
        signature: match[0],
        // Mock complexity and dependency for now
        complexity: Math.floor(Math.random() * 10) + 1,
        dependencyHash: generateSHA256(functionName + '_deps'),
        functionHash: generateSHA256(match[0]),
        signatureHash: generateSHA256(functionName)
      });
    }
  }

  return functions;
};
