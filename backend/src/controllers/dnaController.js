import RepositoryDNA from '../models/RepositoryDNA.js';
import FileDNA from '../models/FileDNA.js';
import FunctionDNA from '../models/FunctionDNA.js';
import Repository from '../models/Repository.js';

export const getRepositoryDNA = async (req, res, next) => {
  try {
    const { id: repoId } = req.params;
    
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    // Security: Only owner can view detailed DNA publicly (though we could allow verified viewers, sticking to rule for now)
    // Actually, prompt says: "Only repository owner can view detailed DNA. Public users should only see Verified, Protected, Guardian Enabled"
    // The public status is served via getGuardianStatus, this detailed endpoint should be protected and checked.
    if (repo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only repository owner can view detailed DNA' });
    }

    const repoDna = await RepositoryDNA.findOne({ repository: repoId }).lean();
    if (!repoDna) {
      return res.status(404).json({ success: false, message: 'Repository DNA not generated yet' });
    }

    // Count protected files
    const filesProtected = await FileDNA.countDocuments({ repository: repoId });

    res.status(200).json({
      success: true,
      repositoryDNA: repoDna,
      filesProtected,
      verificationReady: true
    });
  } catch (error) {
    next(error);
  }
};

export const getFileDNA = async (req, res, next) => {
  try {
    const { id: fileId } = req.params;

    const fileDna = await FileDNA.findOne({ file: fileId }).populate('repository', 'owner').lean();
    if (!fileDna) {
      return res.status(404).json({ success: false, message: 'File DNA not generated yet' });
    }

    if (fileDna.repository.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only repository owner can view detailed DNA' });
    }

    const functions = await FunctionDNA.find({ file: fileId }).lean();

    res.status(200).json({
      success: true,
      fileDNA: fileDna,
      functions
    });
  } catch (error) {
    next(error);
  }
};
