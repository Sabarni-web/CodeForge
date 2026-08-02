import VerificationReport from '../models/VerificationReport.js';

export const generateReport = async (userId, targetRepo, scoresData, certificateDetected, guardianProtected) => {
  const { overallSimilarityScore, structureScore, styleScore, functionScore, complexityScore, matchedFiles } = scoresData;

  const reportId = `VRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const report = new VerificationReport({
    reportId,
    submittedBy: userId,
    repositoryMatch: targetRepo ? targetRepo._id : null,
    ownerMatch: targetRepo ? targetRepo.owner : null,
    similarityScore: overallSimilarityScore,
    structureScore,
    styleScore,
    functionScore,
    complexityScore,
    certificateDetected,
    guardianProtected,
    matchedFiles,
  });

  await report.save();
  return report;
};
