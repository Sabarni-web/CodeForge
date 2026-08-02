import OwnershipCertificate from '../models/OwnershipCertificate.js';

export const verifyCertificatePublicly = async (certificateId) => {
  const certificate = await OwnershipCertificate.findOne({ certificateId })
    .populate('issuer', 'username avatarUrl')
    .lean();

  if (!certificate) {
    throw new Error('Certificate not found or invalid');
  }

  return {
    certificateId: certificate.certificateId,
    type: certificate.type,
    issuedAt: certificate.issuedAt,
    expiresAt: certificate.expiresAt,
    isValid: new Date() < new Date(certificate.expiresAt),
    issuer: certificate.issuer ? {
      username: certificate.issuer.username,
      avatarUrl: certificate.issuer.avatarUrl
    } : null,
    targetId: certificate.targetId,
    signature: certificate.digitalSignature
  };
};
