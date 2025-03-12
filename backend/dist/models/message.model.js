import mongoose, { Schema } from 'mongoose';
const MessageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['text', 'file', 'image', 'video', 'audio'],
        default: 'text'
    },
    fileUrl: {
        type: String
    },
    fileName: {
        type: String
    },
    fileSize: {
        type: Number
    },
    readBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
}, {
    timestamps: true
});
export default mongoose.model('Message', MessageSchema);
//# sourceMappingURL=message.model.js.map