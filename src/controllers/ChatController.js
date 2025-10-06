// ChatController.js
import logger from '../utils/logger.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

const createChatRoom = async (req, res) => {
  try {
    const { name, participants, type = 'direct', projectId } = req.body;
    const userId = req.user._id;

    // Validate participants
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Participants are required' });
    }

    // Create chat room
    const chatData = {
      name: name || (type === 'direct' ? `Direct chat` : `Group chat`),
      type,
      participants: [...new Set([...participants, userId])], // Ensure unique participants including creator
      projectId: type === 'project' ? projectId : undefined
    };

    const chatRoom = new Chat(chatData);
    await chatRoom.save();

    // Populate participants for response
    await chatRoom.populate('participants', 'firstName lastName email');

    logger.info(`Chat room created: ${chatRoom._id}`, { chatRoomId: chatRoom._id, userId });
    
    res.status(201).json(chatRoom);
  } catch (error) {
    logger.error('Error creating chat room:', error);
    res.status(500).json({ error: error.message });
  }
};

const getChatRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find chat rooms where user is a participant
    const chatRooms = await Chat.find({ participants: userId })
      .populate('participants', 'firstName lastName email')
      .populate('projectId', 'name')
      .sort({ updatedAt: -1 });

    res.json({
      rooms: chatRooms
    });
  } catch (error) {
    logger.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: error.message });
  }
};

const getChatRoomById = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userId = req.user._id;

    const chatRoom = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    }).populate('participants', 'firstName lastName email');

    if (!chatRoom) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    res.json(chatRoom);
  } catch (error) {
    logger.error('Error fetching chat room:', error);
    res.status(500).json({ error: error.message });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userId = req.user._id;

    // Verify user has access to chat room
    const chatRoom = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    });

    if (!chatRoom) {
      return res.status(403).json({ error: 'Access denied to this chat room' });
    }

    // Get messages for this chat room
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'firstName lastName email')
      .populate('to', 'firstName lastName email')
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    res.status(500).json({ error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const { content, to, attachments = [] } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user has access to chat room
    const chatRoom = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    });

    if (!chatRoom) {
      return res.status(403).json({ error: 'Access denied to this chat room' });
    }

    // Create message
    const messageData = {
      chat: chatId,
      sender: userId,
      content: content.trim(),
      to: to || undefined,
      attachments
    };

    const message = new Message(messageData);
    await message.save();

    // Populate sender for response
    await message.populate('sender', 'firstName lastName email');

    // Update chat room's updatedAt timestamp
    chatRoom.updatedAt = new Date();
    await chatRoom.save();

    logger.info(`Message sent to chat: ${chatId}`, { chatId, userId, messageId: message._id });
    
    res.status(201).json(message);
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userId = req.user._id;

    // Verify user has access to chat room
    const chatRoom = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    });

    if (!chatRoom) {
      return res.status(403).json({ error: 'Access denied to this chat room' });
    }

    // Mark unread messages as read
    await Message.updateMany(
      { 
        chat: chatId, 
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      { 
        $push: { readBy: { user: userId, readAt: new Date() } } 
      }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    logger.error('Error marking messages as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add delete chat function
const deleteChat = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userId = req.user._id;

    // Verify user has access to chat room
    const chatRoom = await Chat.findOne({ 
      _id: chatId, 
      participants: userId 
    });

    if (!chatRoom) {
      return res.status(403).json({ error: 'Access denied to this chat room' });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });

    // Delete the chat room
    await Chat.findByIdAndDelete(chatId);

    logger.info(`Chat room deleted: ${chatId}`, { chatId, userId });
    
    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    logger.error('Error deleting chat room:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add function to find existing direct chat between two users
const findDirectChat = async (req, res) => {
  try {
    const { participantId } = req.params;
    const userId = req.user._id;

    // Find a direct chat room with exactly these two participants
    const chatRoom = await Chat.findOne({ 
      type: 'direct',
      participants: { $all: [userId, participantId], $size: 2 }
    }).populate('participants', 'firstName lastName email');

    if (!chatRoom) {
      return res.status(404).json({ error: 'No existing chat found' });
    }

    res.json(chatRoom);
  } catch (error) {
    logger.error('Error finding direct chat:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  createChatRoom,
  getChatRooms,
  getChatRoomById,
  getChatHistory,
  sendMessage,
  markAsRead,
  deleteChat,
  findDirectChat
};