import FileDNA from '../models/FileDNA.js';
import FunctionDNA from '../models/FunctionDNA.js';
import RepositoryDNA from '../models/RepositoryDNA.js';
import Repository from '../models/Repository.js';
import File from '../models/File.js';
import Notification from '../models/Notification.js';
import { generateFileFingerprint, generateRepositoryFingerprint } from './fingerprintService.js';
import { getIo } from './socketService.js';

export const processFileDNA = async (fileDoc) => {
  if (!fileDoc || !fileDoc.content) return null;

  const fingerprint = generateFileFingerprint({
    path: fileDoc.path,
    contentBuffer: fileDoc.content
  });

  // Save File DNA
  const fileDna = await FileDNA.findOneAndUpdate(
    { file: fileDoc._id },
    {
      repository: fileDoc.repository,
      file: fileDoc._id,
      sha256: fingerprint.sha256,
      sha512: fingerprint.sha512,
      astHash: fingerprint.astHash,
      structureHash: fingerprint.structureHash,
      styleHash: fingerprint.styleHash,
      complexity: fingerprint.complexity,
      language: fingerprint.language,
      lineCount: fingerprint.lineCount
    },
    { upsert: true, new: true }
  );

  // Process functions
  if (fingerprint.functions && fingerprint.functions.length > 0) {
    await FunctionDNA.deleteMany({ file: fileDoc._id }); // Clear old
    const functionDocs = fingerprint.functions.map(fn => ({
      file: fileDoc._id,
      functionName: fn.functionName,
      functionHash: fn.functionHash,
      signatureHash: fn.signatureHash,
      complexity: fn.complexity,
      dependencyHash: fn.dependencyHash
    }));
    await FunctionDNA.insertMany(functionDocs);
  }

  return fileDna;
};

export const processRepositoryDNA = async (repoId) => {
  const repo = await Repository.findById(repoId);
  if (!repo) return null;

  const files = await File.find({ repository: repoId });
  const fileDnas = await FileDNA.find({ repository: repoId });

  // Generate repository DNA using existing File DNAs
  const repoFingerprint = generateRepositoryFingerprint(fileDnas);

  const repoDna = await RepositoryDNA.findOneAndUpdate(
    { repository: repoId },
    {
      repository: repoId,
      repositoryHash: repoFingerprint.repositoryHash,
      repositoryStructureHash: repoFingerprint.repositoryStructureHash,
      complexityScore: repoFingerprint.complexityScore,
      languageDistribution: repoFingerprint.languageDistribution
    },
    { upsert: true, new: true }
  );

  // Notification and Socket Emission
  const io = getIo();
  if (io) {
    io.to(`repo_${repoId}`).emit('RepositoryDNAReady', { repoId });
    io.to(repo.owner.toString()).emit('GuardianVerified', { repoId });
  }

  await Notification.create({
    recipient: repo.owner,
    sender: repo.owner, // system generated essentially
    type: 'DNA_GENERATED',
    message: `CodeDNA Fingerprint has been generated/updated for ${repo.name}`,
    link: `/repos/${repoId}`
  });

  return repoDna;
};
