import React from 'react';
import { Box, Typography, ListItem, ListItemButton, ListItemText, Badge, styled } from '@mui/material';
import { Conversation, User } from '../types';
import Avatar from './Avatar';

interface ConversationItemProps {
  conversation: Conversation;
  currentUser: User;
  isActive: boolean;
  onClick: () => void;
}

// Create a styled component that doesn't pass isActive to the DOM
const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  padding: 0,
  backgroundColor: isActive 
    ? theme.palette.mode === 'light' 
      ? 'rgba(0, 120, 212, 0.08)' 
      : theme.palette.action.selected 
    : 'transparent',
  '&:hover': {
    backgroundColor: isActive 
      ? theme.palette.mode === 'light' 
        ? 'rgba(0, 120, 212, 0.12)' 
        : theme.palette.action.selected 
      : theme.palette.action.hover,
  },
  borderRadius: 1,
  margin: '2px 4px',
  width: 'calc(100% - 8px)',
}));

const formatTime = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  
  // If the message is from today, show the time
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If the message is from this week, show the day
  const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Otherwise, show the date
  return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, currentUser, isActive, onClick }) => {
  const { participants, lastMessage, unreadCount, isGroup, name, updatedAt } = conversation;
  
  // Get the other participant for direct messages
  const otherParticipant = participants.find(p => p.id !== currentUser.id);
  
  // Display name for the conversation
  const displayName = isGroup 
    ? name || 'Group Chat' 
    : otherParticipant?.username || 'Unknown User';
  
  // Last message preview
  const lastMessagePreview = lastMessage 
    ? truncateText(lastMessage.content, 30)
    : 'No messages yet';
  
  // Last message time
  const lastMessageTime = lastMessage 
    ? formatTime(lastMessage.timestamp)
    : formatTime(updatedAt);
  
  return (
    <StyledListItem disablePadding isActive={isActive}>
      <ListItemButton 
        onClick={onClick} 
        sx={{ 
          py: { xs: 1, sm: 1.5 }, 
          px: { xs: 1.5, sm: 2 },
          borderRadius: 1,
          transition: 'all 0.2s ease',
          width: '100%'
        }}
      >
        <Avatar 
          user={isGroup ? currentUser : (otherParticipant || currentUser)} 
          showStatus={!isGroup}
          sx={{ 
            mr: { xs: 1.5, sm: 2 },
            transition: 'transform 0.2s ease',
            ...(isActive && {
              transform: 'scale(1.05)',
            }),
            flexShrink: 0
          }}
        />
        <ListItemText 
          primaryTypographyProps={{ component: 'div' }}
          secondaryTypographyProps={{ component: 'div' }}
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="body1" 
                fontWeight={unreadCount > 0 ? 'bold' : 'medium'}
                component="span"
                sx={{ 
                  color: isActive ? 'primary.main' : 'text.primary',
                  fontSize: { xs: '0.9rem', sm: '0.95rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: '120px', sm: '150px', md: '180px' }
                }}
              >
                {displayName}
              </Typography>
              <Typography 
                variant="caption" 
                component="span"
                color={isActive ? 'primary.main' : 'text.secondary'}
                sx={{ fontSize: '0.75rem' }}
              >
                {lastMessageTime}
              </Typography>
            </Box>
          }
          secondary={
            <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
              <Typography 
                variant="body2" 
                component="span"
                color={unreadCount > 0 ? 'text.primary' : 'text.secondary'} 
                fontWeight={unreadCount > 0 ? 'medium' : 'normal'}
                sx={{ 
                  maxWidth: { xs: '70%', sm: '80%' },
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  opacity: isActive ? 0.9 : 0.7,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block'
                }}
              >
                {lastMessagePreview}
              </Typography>
              {unreadCount > 0 && (
                <Badge 
                  badgeContent={unreadCount} 
                  color="primary" 
                  sx={{ 
                    ml: 1,
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: 18,
                      minWidth: 18,
                      borderRadius: 9
                    }
                  }}
                />
              )}
            </Box>
          }
          sx={{ ml: 0 }}
        />
      </ListItemButton>
    </StyledListItem>
  );
};

export default ConversationItem;
