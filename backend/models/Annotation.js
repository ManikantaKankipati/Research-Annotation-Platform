import mongoose from 'mongoose';

const annotationSchema = new mongoose.Schema({
  paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['highlight', 'comment', 'drawing'], required: true },
  content: String, // For comments
  position: {
    pageNumber: Number,
    boundingRect: {
      x1: Number,
      y1: Number,
      x2: Number,
      y2: Number
    },
    rects: [{
      x1: Number,
      y1: Number,
      x2: Number,
      y2: Number
    }]
  },
  color: { type: String, default: '#ffeb3b' }
}, { timestamps: true });

// Index for search
annotationSchema.index({ content: 'text' });

export default mongoose.model('Annotation', annotationSchema);
