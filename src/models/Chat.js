import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'project'],
    default: 'direct',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ projectId: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;