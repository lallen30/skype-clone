import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
const UserSchema = new Schema({
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
// Hash password before saving
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password'))
        return next();
    try {
        // Generate salt
        const salt = await bcrypt.genSalt(10);
        // Hash password - explicitly cast to string to satisfy TypeScript
        const plainTextPassword = String(this.password);
        const hashedPassword = await bcrypt.hash(plainTextPassword, salt);
        // Replace plain text password with hashed password
        this.password = hashedPassword;
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // Ensure password is a string by explicit casting
        const storedPassword = String(this.password);
        return await bcrypt.compare(candidatePassword, storedPassword);
    }
    catch (error) {
        throw error;
    }
};
// Create and export the User model
const UserModel = mongoose.model('User', UserSchema);
// Helper function to convert MongoDB document to IUser
export const toIUser = (doc) => {
    return doc;
};
export default UserModel;
//# sourceMappingURL=user.model.js.map