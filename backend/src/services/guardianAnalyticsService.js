import GuardianAnalytics from '../models/GuardianAnalytics.js';
import Repository from '../models/Repository.js';
import File from '../models/File.js';
import OwnershipCertificate from '../models/OwnershipCertificate.js';
import VerificationReport from '../models/VerificationReport.js';

/**
 * Recalculates and caches the global Guardian analytics.
 * Should be run in the background (via guardianQueueService).
 */
export const updateGlobalAnalytics = async () => {
  try {
    const protectedRepos = await Repository.countDocuments({ guardianEnabled: true });
    
    // Count files inside protected repos
    // Alternatively, just sum fileCount of protected repos to avoid huge queries
    const protectedReposList = await Repository.find({ guardianEnabled: true }, '_id').lean();
    const repoIds = protectedReposList.map(r => r._id);
    const filesProtected = await File.countDocuments({ repository: { $in: repoIds } });

    const certificatesGenerated = await OwnershipCertificate.countDocuments();
    
    // Count distinct users who have at least one protected repo
    const uniqueUsers = await Repository.distinct('owner', { guardianEnabled: true });
    const guardianEnabledUsers = uniqueUsers.length;

    const verificationRequests = await VerificationReport.countDocuments();
    const successfulMatches = await VerificationReport.countDocuments({ repositoryMatch: { $ne: null } });

    // Calculate Average Similarity Score
    const allReports = await VerificationReport.aggregate([
      { $match: { repositoryMatch: { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: '$similarityScore' } } }
    ]);
    const averageSimilarity = allReports.length > 0 ? Math.round(allReports[0].avgScore) : 0;

    // Find most verified repository
    const mostVerifiedAgg = await VerificationReport.aggregate([
      { $match: { repositoryMatch: { $ne: null } } },
      { $group: { _id: '$repositoryMatch', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const mostVerifiedRepository = mostVerifiedAgg.length > 0 ? mostVerifiedAgg[0]._id : null;

    // Save to singleton document
    await GuardianAnalytics.findOneAndUpdate(
      { singletonId: 'global_guardian_analytics' },
      {
        repositoriesProtected: protectedRepos,
        filesProtected,
        certificatesGenerated,
        guardianEnabledUsers,
        verificationRequests,
        successfulMatches,
        averageSimilarity,
        mostVerifiedRepository,
        lastUpdatedAt: Date.now()
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating Global Guardian Analytics:', error);
  }
};

export const getGuardianAnalytics = async () => {
  let stats = await GuardianAnalytics.findOne({ singletonId: 'global_guardian_analytics' })
    .populate('mostVerifiedRepository', 'name owner')
    .lean();

  if (!stats) {
    // If it doesn't exist, trigger an update but return empty immediately to not block
    updateGlobalAnalytics();
    return {
      repositoriesProtected: 0,
      filesProtected: 0,
      certificatesGenerated: 0,
      guardianEnabledUsers: 0,
      verificationRequests: 0,
      successfulMatches: 0,
      averageSimilarity: 0
    };
  }
  return stats;
};
