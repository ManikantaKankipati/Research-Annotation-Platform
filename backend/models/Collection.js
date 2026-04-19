import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  papers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }],
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Collection', collectionSchema);
