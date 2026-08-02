import RepositoryDNA from '../models/RepositoryDNA.js';
import FileDNA from '../models/FileDNA.js';
import Repository from '../models/Repository.js';
import mongoose from 'mongoose';
import { calculateSimilarity } from './similarityService.js';
import { generateReport } from './reportService.js';
import { generateFileFingerprint, getLanguageFromFilename } from './fingerprintService.js';

/**
 * Perform verification of temporary files against a target repository
 */
export const performVerification = async (userId, files, targetRepoId = null) => {
  // Generate temporary DNA for incoming files
  const tempFileDnaArray = [];
  const languageProfile = {};
  let totalFiles = files.length;
  let totalLines = 0;
  
  files.forEach(file => {
    const lang = getLanguageFromFilename(file.path);
    languageProfile[lang] = (languageProfile[lang] || 0) + 1;
    
    // Very basic line count for temp DNA
    totalLines += (file.content.match(/\n/g) || []).length + 1;
    
    const fingerprint = generateFileFingerprint({
      path: file.path,
      contentBuffer: Buffer.from(file.content, 'utf-8')
    });
    
    tempFileDnaArray.push({
      path: file.path,
      structureFingerprint: fingerprint.structureHash,
      styleFingerprint: fingerprint.styleHash,
      astHash: fingerprint.astHash,
      imports: fingerprint.imports,
      dependencies: fingerprint.dependencies,
      functions: fingerprint.rawFunctions,
      classes: fingerprint.classes,
      styleData: fingerprint.styleData,
      complexityMetrics: fingerprint.complexity,
    });
  });

  const tempRepoDna = {
    totalFiles,
    totalLines,
    languageProfile,
  };

  // If no target repo specified, we could search all Repos, but for performance, 
  // we require finding the most likely candidate or we test against all public.
  // Given time limits and to avoid massive DB load, we'll fetch the target repo or a highly starred public repo.
  // Let's assume frontend passes a candidate repoId, or we check against a global subset.
  // We'll implement a basic loop: check against the provided repo, or find the top 5 public repos.
  
  let candidates = [];
  if (targetRepoId && mongoose.Types.ObjectId.isValid(targetRepoId)) {
    const repo = await Repository.findById(targetRepoId);
    if (repo) candidates.push(repo);
  } else {
    // Search public repos and user's own repos
    candidates = await Repository.find({
      $or: [
        { visibility: 'public' },
        { owner: userId }
      ]
    }).sort({ updatedAt: -1 }).limit(100);
  }

  let bestMatchScores = null;
  let bestMatchRepo = null;
  let highestSim = -1;

  // Import FunctionDNA at the top
  const FunctionDNA = mongoose.model('FunctionDNA');

  for (const repo of candidates) {
    const storedRepoDna = await RepositoryDNA.findOne({ repository: repo._id }).lean();
    if (!storedRepoDna) {
      if (repo.guardianEnabled) {
        // Auto-repair missing DNA
        import('../workers/dnaWorker.js').then(({ queueFullRepositoryDNA }) => {
          queueFullRepositoryDNA(repo._id);
        });
      }
      continue; 
    }
    
    const storedFileDnaArray = await FileDNA.find({ repository: repo._id }).lean();
    
    // Extract file IDs to query FunctionDNA
    const fileIds = storedFileDnaArray.map(f => f.file);
    const storedFunctionDnaArray = await FunctionDNA.find({ file: { $in: fileIds } }).lean();
    
    const scores = calculateSimilarity(tempFileDnaArray, storedFileDnaArray, tempRepoDna, storedRepoDna, storedFunctionDnaArray);
    
    console.log(`[Verify] Repo: ${repo.name} | Score: ${scores.rawOverallScore}`);
    
    if (scores.rawOverallScore > highestSim) {
      highestSim = scores.rawOverallScore;
      bestMatchScores = scores;
      bestMatchRepo = repo;
    }
  }

  // If no match found or very low
  if (!bestMatchScores || highestSim < 10) {
    return generateReport(userId, null, {
      overallSimilarityScore: 0,
      structureScore: 0,
      styleScore: 0,
      functionScore: 0,
      complexityScore: 0,
      matchedFiles: []
    }, false, false);
  }

  const guardianProtected = bestMatchRepo.guardianEnabled || false;
  // We mock certificate detected based on high similarity for the engine's probabilistic output
  const certificateDetected = highestSim > 85 && guardianProtected;

  const report = await generateReport(
    userId,
    bestMatchRepo,
    bestMatchScores,
    certificateDetected,
    guardianProtected
  );

  return report;
};
