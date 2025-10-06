import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Only needed for direct messages
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    url: String,
    type: String, // 'image', 'document', etc.
    name: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ chat: 1, timestamp: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ to: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;