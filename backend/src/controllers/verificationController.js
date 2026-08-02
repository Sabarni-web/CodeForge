import VerificationReport from '../models/VerificationReport.js';
import Notification from '../models/Notification.js';
import { performVerification } from '../services/verificationService.js';
import { getIo } from '../services/socketService.js';

export const verifyCode = async (req, res, next) => {
  try {
    const { files, targetRepoId } = req.body;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid files provided for verification' });
    }

    const io = getIo();
    if (io) {
      io.to(req.user._id.toString()).emit('VerificationStarted', { message: 'Analyzing source code...' });
    }

    const report = await performVerification(req.user._id, files, targetRepoId);

    if (io) {
      io.to(req.user._id.toString()).emit('VerificationCompleted', { reportId: report.reportId });
    }

    if (report.similarityScore > 80 && report.ownerMatch) {
      // Notify original owner if high similarity found (and they aren't the submitter)
      if (report.ownerMatch.toString() !== req.user._id.toString()) {
         await Notification.create({
           recipient: report.ownerMatch,
           sender: req.user._id,
           type: 'HIGH_SIMILARITY_FOUND',
           message: `A high similarity verification was performed against your repository`,
           link: `/guardian/report/${report.reportId}`,
         });
      }
    }

    res.status(200).json({
      success: true,
      reportId: report.reportId,
      message: 'Verification completed',
    });
  } catch (error) {
    next(error);
  }
};

export const getVerificationReport = async (req, res, next) => {
  try {
    const { id: reportId } = req.params;

    const report = await VerificationReport.findOne({ reportId })
      .populate('submittedBy', 'username avatarUrl')
      .populate('repositoryMatch', 'name owner guardianEnabled')
      .populate('ownerMatch', 'username avatarUrl')
      .lean();

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Only submitter or repository owner can view the detailed report
    const isSubmitter = report.submittedBy._id.toString() === req.user._id.toString();
    const isRepoOwner = report.ownerMatch && report.ownerMatch._id.toString() === req.user._id.toString();

    if (!isSubmitter && !isRepoOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this report' });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};
