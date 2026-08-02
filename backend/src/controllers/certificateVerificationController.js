import { verifyCertificatePublicly } from '../services/certificateVerificationService.js';

export const verifyPublicCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const result = await verifyCertificatePublicly(certificateId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};
