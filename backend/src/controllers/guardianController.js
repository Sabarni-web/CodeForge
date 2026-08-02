import Repository from '../models/Repository.js';
import File from '../models/File.js';
import Notification from '../models/Notification.js';
import { queueFullRepositoryDNA } from '../workers/dnaWorker.js';

export const enableGuardian = async (req, res, next) => {
  try {
    const { id: repoId } = req.params;
    const repo = await Repository.findById(repoId);

    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    if (repo.owner.toString() !== req.user._id.toString()) {
      const error = new Error('Only the repository owner can enable Guardian');
      error.statusCode = 403;
      throw error;
    }

    repo.guardianEnabled = true;
    repo.guardianCreatedAt = new Date();
    await repo.save();

    // Create Notification
    await Notification.create({
      recipient: repo.owner,
      sender: req.user._id,
      message: `CodeForge Guardian™ has been enabled for ${repo.name}`,
      type: 'GUARDIAN_ENABLED',
      link: `/repository/${repo._id}`
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('GuardianEnabled', { repoId: repo._id, repoName: repo.name });
      io.to(req.user._id.toString()).emit('RepositoryProtected', { repoId: repo._id, repoName: repo.name });
    }

    // Trigger full repository CodeDNA fingerprinting in background
    queueFullRepositoryDNA(repo._id);

    res.status(200).json({ success: true, message: 'Guardian enabled', guardianEnabled: true });
  } catch (error) {
    next(error);
  }
};

export const disableGuardian = async (req, res, next) => {
  try {
    const { id: repoId } = req.params;
    const repo = await Repository.findById(repoId);

    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    if (repo.owner.toString() !== req.user._id.toString()) {
      const error = new Error('Only the repository owner can disable Guardian');
      error.statusCode = 403;
      throw error;
    }

    repo.guardianEnabled = false;
    await repo.save();

    await Notification.create({
      recipient: repo.owner,
      sender: req.user._id,
      message: `CodeForge Guardian™ has been disabled for ${repo.name}`,
      type: 'GUARDIAN_DISABLED',
      link: `/repository/${repo._id}`
    });

    res.status(200).json({ success: true, message: 'Guardian disabled', guardianEnabled: false });
  } catch (error) {
    next(error);
  }
};

export const getGuardianStatus = async (req, res, next) => {
  try {
    const { id: repoId } = req.params;
    const repo = await Repository.findById(repoId).select('guardianEnabled guardianCreatedAt guardianVersion certificateId');
    if (!repo) {
      const error = new Error('Repository not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      guardianEnabled: repo.guardianEnabled,
      guardianCreatedAt: repo.guardianCreatedAt,
      guardianVersion: repo.guardianVersion,
    });
  } catch (error) {
    next(error);
  }
};

export const getFileCertificate = async (req, res, next) => {
  try {
    const { id: fileId } = req.params;
    const file = await File.findById(fileId).select('fileCertificateId ownershipVerified guardianProtected certificateInsertedAt repository name path');
    
    if (!file) {
      const error = new Error('File not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      certificate: {
        fileCertificateId: file.fileCertificateId,
        ownershipVerified: file.ownershipVerified,
        guardianProtected: file.guardianProtected,
        certificateInsertedAt: file.certificateInsertedAt,
      }
    });
  } catch (error) {
    next(error);
  }
};
