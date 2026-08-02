import mongoose from 'mongoose';

const ownershipCertificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['REPOSITORY', 'FILE'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  digitalSignature: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

const OwnershipCertificate = mongoose.model('OwnershipCertificate', ownershipCertificateSchema);
export default OwnershipCertificate;
