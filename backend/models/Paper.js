import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  uploadDate: { type: Date, default: Date.now },
  fileUrl: { type: String, required: true },
  fileName: String,
  collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Paper', paperSchema);
