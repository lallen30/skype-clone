import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

// Base interface without Document methods
export interface IUserBase {
  username: string;
  email: string;
  password: string;
  displayName: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for methods
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Combined interface with Document
export interface IUser extends IUserBase, Document, IUserMethods {}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away', 'busy'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Define document type for pre-save hook
interface IUserDocument extends Document {
  password: string;
  isModified(path: string): boolean;
}

// Hash password before saving
UserSchema.pre('save', async function(this: IUserDocument, next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password - explicitly cast to string to satisfy TypeScript
    const plainTextPassword = String(this.password);
    const hashedPassword = await bcrypt.hash(plainTextPassword, salt);
    
    // Replace plain text password with hashed password
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    // Ensure password is a string by explicit casting
    const storedPassword = String(this.password);
    return await bcrypt.compare(candidatePassword, storedPassword);
  } catch (error) {
    throw error;
  }
};

// Create and export the User model
const UserModel = mongoose.model<IUser, Model<IUser, {}, IUserMethods>>('User', UserSchema);

// Helper function to convert MongoDB document to IUser
export const toIUser = (doc: any): IUser => {
  return doc as unknown as IUser;
};

export default UserModel;
