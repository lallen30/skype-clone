import React from 'react';
import { Avatar as MuiAvatar, Badge, styled } from '@mui/material';
import { User } from '../types';

interface AvatarProps {
  user: User;
  showStatus?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StyledBadge = styled(Badge)<{ status: User['status'] }>(({ theme, status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: 
      status === 'online' ? '#44b700' :
      status === 'away' ? '#ff9800' :
      status === 'busy' ? '#f44336' : 
      '#bdbdbd',
    color: 
      status === 'online' ? '#44b700' :
      status === 'away' ? '#ff9800' :
      status === 'busy' ? '#f44336' : 
      '#bdbdbd',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: status === 'online' ? 'ripple 1.2s infinite ease-in-out' : 'none',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const getSizeProps = (size: AvatarProps['size']) => {
  switch (size) {
    case 'small':
      return { width: 24, height: 24 };
    case 'large':
      return { width: 56, height: 56 };
    case 'medium':
    default:
      return { width: 40, height: 40 };
  }
};

const Avatar: React.FC<AvatarProps> = ({ user, showStatus = false, size = 'medium' }) => {
  const { username, avatar, status } = user;
  const sizeProps = getSizeProps(size);
  
  if (showStatus) {
    return (
      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        status={status}
      >
        <MuiAvatar
          alt={username}
          src={avatar}
          {...sizeProps}
        >
          {!avatar && username.charAt(0).toUpperCase()}
        </MuiAvatar>
      </StyledBadge>
    );
  }
  
  return (
    <MuiAvatar
      alt={username}
      src={avatar}
      {...sizeProps}
    >
      {!avatar && username.charAt(0).toUpperCase()}
    </MuiAvatar>
  );
};

export default Avatar;
