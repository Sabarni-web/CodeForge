import Repository from '../models/Repository.js';
import OwnershipCertificate from '../models/OwnershipCertificate.js';
import RepositoryDNA from '../models/RepositoryDNA.js';
import VerificationReport from '../models/VerificationReport.js';
import FileDNA from '../models/FileDNA.js';

export const getUserGuardianDashboard = async (userId) => {
  // 1. Get user's protected repositories
  const protectedRepos = await Repository.find({ owner: userId, guardianEnabled: true })
    .select('name description isPrivate stars forksCount updatedAt')
    .sort({ updatedAt: -1 })
    .lean();

  // 2. Counts
  const repoCount = protectedRepos.length;
  
  // 3. Certificates & DNA status for these repos
  const repoIds = protectedRepos.map(r => r._id);
  const certificates = await OwnershipCertificate.find({ targetId: { $in: repoIds }, type: 'REPOSITORY' }).lean();
  const repoDnas = await RepositoryDNA.find({ repository: { $in: repoIds } }).lean();

  const certsCount = certificates.length;
  const dnaCount = repoDnas.length;

  // Enhance repos with status
  const reposWithStatus = protectedRepos.map(repo => {
    const cert = certificates.find(c => c.targetId.toString() === repo._id.toString());
    const dna = repoDnas.find(d => d.repository.toString() === repo._id.toString());
    return {
      ...repo,
      hasCertificate: !!cert,
      hasDNA: !!dna,
      certificateId: cert ? cert.certificateId : null,
      lastScan: dna ? dna.updatedAt : null
    };
  });

  // 4. Verification Reports submitted by this user
  const verificationRequests = await VerificationReport.find({ submittedBy: userId })
    .populate('repositoryMatch', 'name owner')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // 5. Verification Reports matching this user's repositories
  const matchedReports = await VerificationReport.find({ ownerMatch: userId })
    .populate('repositoryMatch', 'name')
    .populate('submittedBy', 'username')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    overview: {
      protectedRepositories: repoCount,
      certificatesGenerated: certsCount,
      dnaGenerated: dnaCount,
      verificationRequestsMade: await VerificationReport.countDocuments({ submittedBy: userId }),
      verificationsMatched: await VerificationReport.countDocuments({ ownerMatch: userId })
    },
    repositories: reposWithStatus,
    recentVerifications: verificationRequests,
    recentMatches: matchedReports,
    health: {
      status: repoCount === certsCount && repoCount === dnaCount ? 'Excellent' : repoCount > 0 ? 'Good' : 'Inactive',
      message: repoCount === 0 ? 'Enable Guardian on a repository to get started.' : 
               repoCount > certsCount ? 'Some repositories are missing certificates.' : 'All systems normal.'
    }
  };
};
