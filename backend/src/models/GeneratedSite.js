import mongoose from 'mongoose';

const generatedSiteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Site title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      trim: true,
      maxlength: [5000, 'Prompt cannot exceed 5000 characters'],
    },
    html: {
      type: String,
      required: [true, 'Generated HTML is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const GeneratedSite = mongoose.model('GeneratedSite', generatedSiteSchema);
export default GeneratedSite;
