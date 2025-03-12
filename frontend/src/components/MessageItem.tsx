import React from 'react';
import { Box, Typography, Paper, styled } from '@mui/material';
import { Message, User } from '../types';
import Avatar from './Avatar';

interface MessageItemProps {
  message: Message;
  sender: User;
  isCurrentUser: boolean;
  showAvatar?: boolean;
}

const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser'
})<{ isCurrentUser: boolean }>(({ theme, isCurrentUser }) => ({
  padding: theme.spacing(1, 1.5),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5, 2),
  },
  borderRadius: isCurrentUser 
    ? theme.spacing(2, 2, 0, 2) 
    : theme.spacing(2, 2, 2, 0),
  maxWidth: '85%',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '75%',
  },
  wordBreak: 'break-word',
  backgroundColor: isCurrentUser 
    ? theme.palette.primary.main 
    : theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
  color: isCurrentUser 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  marginLeft: isCurrentUser ? 'auto' : undefined,
  marginRight: isCurrentUser ? undefined : 'auto',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
}));

const MessageContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser'
})<{ isCurrentUser: boolean }>(({ theme, isCurrentUser }) => ({
  display: 'flex',
  flexDirection: isCurrentUser ? 'row-reverse' : 'row',
  alignItems: 'flex-end',
  marginBottom: 6,
  [theme.breakpoints.up('sm')]: {
    marginBottom: 8,
  },
  gap: 6,
  [theme.breakpoints.up('sm')]: {
    gap: 8,
  },
  width: '100%',
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: 4,
  textAlign: 'right',
}));

const formatTime = (date: Date | string | undefined): string => {
  try {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

const MessageItem: React.FC<MessageItemProps> = ({ message, sender, isCurrentUser, showAvatar = true }) => {
  // Safely render the message with error handling
  const renderMessage = () => {
    try {
      if (!message || !sender) {
        console.error('Missing message or sender data:', { message, sender });
        return (
          <Box sx={{ p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="caption">Message data error</Typography>
          </Box>
        );
      }
      
      return (
        <Box sx={{ mb: { xs: 1, sm: 1.5 }, width: '100%' }}>
          <MessageContainer isCurrentUser={isCurrentUser}>
            {!isCurrentUser && (
              showAvatar ? (
                <Avatar user={sender} size="small" />
              ) : (
                /* Spacer to maintain alignment */
                <Box sx={{ width: 32 }} />
              )
            )}
            <Box>
              <MessageBubble isCurrentUser={isCurrentUser}>
                <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {message.content || 'No content'}
                </Typography>
              </MessageBubble>
              <TimeStamp>
                {formatTime(message.timestamp)}
                {isCurrentUser && (
                  <span style={{ marginLeft: 4 }}>
                    {message.isRead ? '✓✓' : '✓'}
                  </span>
                )}
              </TimeStamp>
            </Box>
          </MessageContainer>
        </Box>
      );
    } catch (error) {
      console.error('Error rendering message:', error);
      return (
        <Box sx={{ p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography variant="caption">Failed to render message</Typography>
        </Box>
      );
    }
  };
  
  return renderMessage();
};

export default MessageItem;
