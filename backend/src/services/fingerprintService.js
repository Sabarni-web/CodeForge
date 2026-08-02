import { generateSHA256, generateSHA512 } from './hashService.js';
import { analyzeStructure, extractFunctions } from './structureAnalysisService.js';
import { analyzeStyle } from './styleAnalysisService.js';
import { calculateCyclomaticComplexity } from './complexityService.js';
export const getLanguageFromFilename = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', java: 'java', c: 'c', cpp: 'cpp', html: 'html', css: 'css',
    go: 'go', rs: 'rust', rb: 'ruby', php: 'php', sql: 'sql', sh: 'shell'
  };
  return map[ext] || 'plaintext';
};
/**
 * Generate File DNA
 */
export const generateFileFingerprint = (fileData) => {
  const { path: filePath, contentBuffer } = fileData;
  const content = contentBuffer.toString('utf-8');
  const language = getLanguageFromFilename(filePath.split('/').pop());

  // 1. Cryptographic Hashes
  const sha256 = generateSHA256(contentBuffer);
  const sha512 = generateSHA512(contentBuffer);

  // 2. Structural DNA
  const structure = analyzeStructure(content, language);

  // 3. Style DNA
  const style = analyzeStyle(content);

  // 4. Complexity
  const complexity = calculateCyclomaticComplexity(content);

  return {
    sha256,
    sha512,
    astHash: structure.astHash,
    structureHash: structure.structureHash,
    styleHash: style.styleHash,
    complexity,
    language,
    lineCount: structure.lineCount,
    functions: extractFunctions(content, language),
    imports: structure.imports,
    dependencies: structure.dependencies,
    rawFunctions: structure.functions,
    classes: structure.classes,
    styleData: {
      commentDensity: style.commentDensity,
      averageLineLength: style.averageLineLength,
      indentation: style.indentation,
      bracketStyle: style.bracketStyle
    }
  };
};

/**
 * Generate Repository DNA from an array of File DNAs
 */
export const generateRepositoryFingerprint = (fileDnas) => {
  // Aggregate hashes
  const fileSha256s = fileDnas.map(dna => dna.sha256).sort().join('');
  const repositoryHash = generateSHA256(fileSha256s);

  const fileStructureHashes = fileDnas.map(dna => dna.structureHash).sort().join('');
  const repositoryStructureHash = generateSHA256(fileStructureHashes);

  // Calculate overall metrics
  let totalComplexity = 0;
  const languageDistribution = {};

  fileDnas.forEach(dna => {
    totalComplexity += dna.complexity;
    if (dna.language) {
      languageDistribution[dna.language] = (languageDistribution[dna.language] || 0) + 1;
    }
  });

  const avgComplexity = fileDnas.length > 0 ? (totalComplexity / fileDnas.length) : 0;

  return {
    repositoryHash,
    repositoryStructureHash,
    complexityScore: avgComplexity,
    languageDistribution
  };
};
