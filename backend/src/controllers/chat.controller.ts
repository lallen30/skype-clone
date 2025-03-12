import { Request, Response, NextFunction } from 'express';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// Create a new conversation
export const createConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore - userId is added by auth middleware
    const userId = req.userId;
    const { participants, name, isGroup } = req.body;
    
    // Validate participants
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one participant'
      });
    }
    
    // For group chats, name is required
    if (isGroup && !name) {
      return res.status(400).json({
        success: false,
        message: 'Group conversations require a name'
      });
    }
    
    // Check if all participants exist
    const allParticipants = [...participants];
    if (!allParticipants.includes(userId)) {
      allParticipants.push(userId);
    }
    
    const users = await User.find({ _id: { $in: allParticipants } });
    if (users.length !== allParticipants.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more participants do not exist'
      });
    }
    
    // For direct (non-group) conversations, check if a conversation already exists
    if (!isGroup && participants.length === 1) {
      const existingConversation = await Conversation.findOne({
        isGroup: false,
        participants: { 
          $all: [userId, participants[0]],
          $size: 2
        }
      });
      
      if (existingConversation) {
        return res.status(200).json({
          success: true,
          data: existingConversation
        });
      }
    }
    
    // Create new conversation
    const conversation = new Conversation({
      name: isGroup ? name : undefined,
      isGroup,
      participants: allParticipants,
      admins: isGroup ? [userId] : undefined,
      createdBy: userId
    });
    
    await conversation.save();
    
    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// Get all conversations for a user
export const getUserConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore - userId is added by auth middleware
    const userId = req.userId;
    
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'username displayName avatar status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// Get conversation by ID
export const getConversationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // @ts-ignore - userId is added by auth middleware
    const userId = req.userId;
    
    // Find conversation
    const conversation = await Conversation.findById(id)
      .populate('participants', 'username displayName avatar status')
      .populate('lastMessage');
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }
    
    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId, content, contentType } = req.body;
    // @ts-ignore - userId is added by auth middleware
    const userId = req.userId;
    
    // Validate input
    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide conversation ID and message content'
      });
    }
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!conversation.participants.some(p => p.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }
    
    // Create message
    const message = new Message({
      conversationId,
      sender: userId,
      content,
      contentType: contentType || 'text',
      readBy: [userId]
    });
    
    await message.save();
    
    // Update conversation's lastMessage with proper typing
    conversation.lastMessage = message._id as any;
    await conversation.save();
    
    // Populate sender info
    await message.populate('sender', 'username displayName avatar');
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// Get messages for a conversation
export const getConversationMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    // @ts-ignore - userId is added by auth middleware
    const userId = req.userId;
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!conversation.participants.some(p => p.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    
    // Get messages
    const messages = await Message.find({ conversationId })
      .populate('sender', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Message.countDocuments({ conversationId });
    
    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );
    
    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
};

// Add user to group conversation
export const addUserToGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const { userId: userToAdd } = req.body;
    // @ts-ignore - userId is added by auth middleware
    const currentUserId = req.userId;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Check if it's a group conversation
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add users to non-group conversations'
      });
    }
    
    // Check if current user is an admin
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    if (!conversation.admins?.some(admin => admin.equals(currentUserObjectId))) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add users to the group'
      });
    }
    
    // Check if user to add exists
    const userExists = await User.exists({ _id: userToAdd });
    
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User to add not found'
      });
    }
    
    // Check if user is already in the conversation
    const userToAddObjectId = new mongoose.Types.ObjectId(userToAdd);
    if (conversation.participants.some(p => p.equals(userToAddObjectId))) {
      return res.status(400).json({
        success: false,
        message: 'User is already in the conversation'
      });
    }
    
    // Add user to conversation
    conversation.participants.push(new mongoose.Types.ObjectId(userToAdd));
    await conversation.save();
    
    // Create system message
    const addedUser = await User.findById(userToAdd).select('displayName');
    const currentUser = await User.findById(currentUserId).select('displayName');
    
    const message = new Message({
      conversationId,
      sender: currentUserId,
      content: `${currentUser?.displayName} added ${addedUser?.displayName} to the group`,
      contentType: 'text',
      readBy: [currentUserId]
    });
    
    await message.save();
    
    // Update conversation's lastMessage with proper typing
    conversation.lastMessage = message._id as any;
    await conversation.save();
    
    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// Remove user from group conversation
export const removeUserFromGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId, userId: userToRemove } = req.params;
    // @ts-ignore - userId is added by auth middleware
    const currentUserId = req.userId;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Check if it's a group conversation
    if (!conversation.isGroup) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove users from non-group conversations'
      });
    }
    
    // Check if current user is an admin or the user is removing themselves
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    const isAdmin = conversation.admins?.some(admin => admin.equals(currentUserObjectId));
    const isSelfRemoval = userToRemove === currentUserId;
    
    if (!isAdmin && !isSelfRemoval) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove users from the group'
      });
    }
    
    // Check if user to remove is in the conversation
    if (!conversation.participants.some(p => p.toString() === userToRemove)) {
      return res.status(404).json({
        success: false,
        message: 'User is not in the conversation'
      });
    }
    
    // Remove user from conversation
    conversation.participants = conversation.participants.filter(
      p => p.toString() !== userToRemove
    );
    
    // If user was an admin, remove from admins as well
    const userToRemoveObjectId = new mongoose.Types.ObjectId(userToRemove);
    if (conversation.admins?.some(admin => admin.equals(userToRemoveObjectId))) {
      conversation.admins = conversation.admins.filter(
        a => !a.equals(userToRemoveObjectId)
      );
    }
    
    await conversation.save();
    
    // Create system message
    const removedUser = await User.findById(userToRemove).select('displayName');
    const currentUser = await User.findById(currentUserId).select('displayName');
    
    let messageContent = '';
    if (isSelfRemoval) {
      messageContent = `${removedUser?.displayName} left the group`;
    } else {
      messageContent = `${currentUser?.displayName} removed ${removedUser?.displayName} from the group`;
    }
    
    const message = new Message({
      conversationId,
      sender: currentUserId,
      content: messageContent,
      contentType: 'text',
      readBy: [currentUserId]
    });
    
    await message.save();
    
    // Update conversation's lastMessage with proper typing
    conversation.lastMessage = message._id as any;
    await conversation.save();
    
    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

// Mark messages as read in a conversation
export const markMessagesAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    // Properly type userId from the request
    const userId = req.userId as string;
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Create a properly typed ObjectId for comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation'
      });
    }
    
    // Mark all messages as read by this user
    const result = await Message.updateMany(
      { 
        conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
};
