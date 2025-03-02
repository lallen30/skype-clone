import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Tooltip, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle typing status
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 2000);
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);
  
  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleAttachFile = () => {
    // This would be implemented with actual file upload functionality
    alert('File attachment functionality would be implemented here');
  };
  
  const handleEmojiClick = () => {
    // This would be implemented with an emoji picker
    alert('Emoji picker would be implemented here');
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <Tooltip title="Attach file">
          <IconButton 
            color="primary" 
            onClick={handleAttachFile}
            disabled={disabled}
            sx={{ 
              mr: 1,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <AttachFileIcon />
          </IconButton>
        </Tooltip>
        
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 20,
              backgroundColor: theme => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)',
              '&:hover': {
                backgroundColor: theme => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
              },
              '&.Mui-focused': {
                backgroundColor: theme => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
              }
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.1)'
            }
          }}
        />
        
        <Tooltip title="Add emoji">
          <IconButton 
            color="primary" 
            onClick={handleEmojiClick}
            disabled={disabled}
            sx={{ 
              ml: 1,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <EmojiEmotionsIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Send message">
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={disabled || !message.trim()}
            sx={{ 
              ml: 1,
              transition: 'all 0.2s',
              backgroundColor: message.trim() ? 'primary.main' : 'transparent',
              color: message.trim() ? 'white' : 'primary.main',
              '&:hover': {
                backgroundColor: message.trim() ? 'primary.dark' : 'rgba(25, 118, 210, 0.08)',
                transform: 'scale(1.1)'
              },
              '&.Mui-disabled': {
                backgroundColor: 'transparent',
                color: 'action.disabled'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default MessageInput;
