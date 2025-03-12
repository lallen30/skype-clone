import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import mongoose from 'mongoose';
// Upload file
export const uploadFile = async (req, res, next) => {
    try {
        // @ts-ignore - userId is added by auth middleware
        const userId = req.userId;
        const { conversationId } = req.body;
        // @ts-ignore - file is added by multer middleware
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }
        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a conversation ID'
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
        if (!conversation.participants.includes(new mongoose.Types.ObjectId(userId))) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this conversation'
            });
        }
        // Determine content type based on file mimetype
        let contentType = 'file';
        if (file.mimetype.startsWith('image/')) {
            contentType = 'image';
        }
        else if (file.mimetype.startsWith('video/')) {
            contentType = 'video';
        }
        else if (file.mimetype.startsWith('audio/')) {
            contentType = 'audio';
        }
        // Create message with file information
        const message = new Message({
            conversationId,
            sender: userId,
            content: file.originalname,
            contentType,
            fileUrl: `/uploads/${file.filename}`,
            fileName: file.originalname,
            fileSize: file.size,
            readBy: [userId]
        });
        await message.save();
        // Update conversation's lastMessage
        conversation.lastMessage = message._id;
        await conversation.save();
        // Populate sender info
        await message.populate('sender', 'username displayName avatar');
        res.status(201).json({
            success: true,
            data: message
        });
    }
    catch (error) {
        next(error);
    }
};
// Get file
export const getFile = async (req, res, next) => {
    try {
        const { id } = req.params;
        // @ts-ignore - userId is added by auth middleware
        const userId = req.userId;
        // Find message with file
        const message = await Message.findById(id);
        if (!message || !message.fileUrl) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        // Check if user is a participant in the conversation
        const conversation = await Conversation.findById(message.conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        if (!conversation.participants.includes(new mongoose.Types.ObjectId(userId))) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this conversation'
            });
        }
        // Return file information
        res.status(200).json({
            success: true,
            data: {
                fileUrl: message.fileUrl,
                fileName: message.fileName,
                fileSize: message.fileSize,
                contentType: message.contentType
            }
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=file.controller.js.map