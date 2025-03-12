import mongoose, { Schema } from 'mongoose';
const ConversationSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
    admins: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
export default mongoose.model('Conversation', ConversationSchema);
//# sourceMappingURL=conversation.model.js.map