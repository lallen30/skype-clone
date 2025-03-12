import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model.js';

// Get all users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore - userId is added by auth middleware
    const currentUserId = req.userId;
    
    // Get all users except the current user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('-password')
      .sort({ username: 1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // @ts-ignore - userId is added by auth middleware
    const currentUserId = req.userId;
    
    // Check if the user is updating their own profile
    if (id !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }
    
    const { displayName, status } = req.body;
    
    // Fields to update
    const updateFields: { [key: string]: any } = {};
    
    if (displayName) updateFields.displayName = displayName;
    if (status) updateFields.status = status;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user avatar
export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore - userId is added by auth middleware
    const userId = req.userId;
    
    // @ts-ignore - file is added by multer middleware
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }
    
    // Update user avatar
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: `/uploads/${file.filename}` } },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user status
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore - userId is added by auth middleware
    const userId = req.userId;
    const { status } = req.body;
    
    if (!status || !['online', 'offline', 'away', 'busy'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status'
      });
    }
    
    // Update user status
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          status,
          lastSeen: status === 'offline' ? new Date() : undefined
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
