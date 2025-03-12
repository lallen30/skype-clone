import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  List,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Paper,
  InputBase,
  Badge,
  Drawer,
  useMediaQuery,
  useTheme,
  Button,
  Avatar as MuiAvatar
} from '@mui/material';
import ErrorBoundary from '../components/ErrorBoundary';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';

import { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  setActiveConversation,
  markMessagesAsRead,
  receiveMessage,
  clearActiveConversation
} from '../store/chatSlice';

import ConversationItem from '../components/ConversationItem';
import MessageInput from '../components/MessageInput';
import socketService from '../services/socketService';
import { Message } from '../types';

const Chat: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversations, activeConversation, messages, loading } = useSelector((state: RootState) => state.chat);
  
  // Get messages for active conversation
  const activeConversationMessages = activeConversation
    ? messages[activeConversation.id] || []
    : [];
  
  // Filter conversations by search query
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // For group chats, search by name
    if (conversation.isGroup && conversation.name) {
      return conversation.name.toLowerCase().includes(searchLower);
    }
    
    // For direct messages, search by other participant's username
    const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
    return otherParticipant?.username.toLowerCase().includes(searchLower);
  });
  
  // Connect to socket on mount
  useEffect(() => {
    if (user) {
      let token;
      try {
        token = localStorage.getItem('token');
      } catch (error) {
        console.warn('Could not access localStorage:', error);
        // In development mode, we can use a mock token
        if (import.meta.env.DEV) {
          token = 'dev-mock-token';
        }
      }
      
      if (token) {
        socketService.connect(token);
        
        // Listen for new messages
        socketService.onMessage((message: Message) => {
          dispatch(receiveMessage(message));
          
          // If the message is for the active conversation, mark it as read
          if (activeConversation && message.conversationId === activeConversation.id) {
            dispatch(markMessagesAsRead(message.conversationId));
          }
        });
        
        // Cleanup on unmount
        return () => {
          socketService.disconnect();
        };
      }
    }
  }, [user, dispatch, activeConversation]);
  
  // Fetch conversations on mount
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversationMessages]);
  
  // Handle conversation click
  const handleConversationClick = (conversationId: string) => {
    try {
      console.log('Clicking conversation:', conversationId);
      
      // Clear any existing errors
      setRenderError(null);
      
      // Dispatch actions sequentially
      dispatch(setActiveConversation(conversationId));
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        dispatch(fetchMessages(conversationId));
        dispatch(markMessagesAsRead(conversationId));
        
        // Join conversation room in socket
        socketService.joinConversation(conversationId);
      }, 50);
      
      // Close mobile drawer if open
      if (isMobile) {
        setMobileDrawerOpen(false);
      }
    } catch (error) {
      console.error('Error in handleConversationClick:', error);
      setRenderError(error instanceof Error ? error.message : 'Unknown error in conversation click');
    }
  };
  
  // Handle send message
  const handleSendMessage = (content: string) => {
    if (activeConversation) {
      dispatch(sendMessage({ conversationId: activeConversation.id, content }));
    }
  };
  
  // Handle typing status
  const handleTyping = (isTyping: boolean) => {
    if (activeConversation) {
      socketService.sendTypingStatus(activeConversation.id, isTyping);
    }
  };
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleMenuClose();
    socketService.disconnect();
    dispatch(logout());
  };
  
  // Sidebar content
  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <Paper
          component="form"
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: 20,
            boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
            width: '100%'
          }}
        >
          <IconButton sx={{ p: '8px' }} aria-label="search">
            <SearchIcon fontSize="small" />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: '0.95rem' }}
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Paper>
      </Box>
      
      <List sx={{ flex: 1, overflow: 'auto', width: '100%', py: 0 }}>
        {filteredConversations.map((conversation) => (
          <React.Fragment key={conversation.id}>
            <ConversationItem
              conversation={conversation}
              currentUser={user!}
              isActive={activeConversation?.id === conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
            />
            <Divider component="li" sx={{ my: 0.5 }} />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
  
  // Add error boundary to catch rendering errors
  const [renderError, setRenderError] = useState<string | null>(null);
  
  // Debug logging for active conversation
  useEffect(() => {
    console.log('Active conversation changed:', activeConversation);
    if (activeConversation) {
      console.log('Participants:', activeConversation.participants);
    }
  }, [activeConversation]);

  // We're using ErrorBoundary instead of this function
  // so we can remove it to fix the TypeScript warning

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
      {renderError && (
        <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body1">Error: {renderError}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              setRenderError(null);
              dispatch(clearActiveConversation());
            }}
            sx={{ mt: 1 }}
          >
            Reset View
          </Button>
        </Box>
      )}
      <AppBar position="static" elevation={0} sx={{ bgcolor: theme.palette.mode === 'light' ? '#0078d4' : undefined }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Skype Clone
          </Typography>
          
          <IconButton color="inherit" aria-label="new chat" sx={{ mx: { xs: 0.5, sm: 1 } }}>
            <Badge badgeContent={0} color="error">
              <AddIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            color="inherit"
            aria-label="account"
            onClick={handleMenuOpen}
            sx={{ ml: { xs: 0.5, sm: 1 } }}
          >
            <AccountCircleIcon />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1, borderRadius: 2 }
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', bgcolor: theme.palette.background.paper, width: '100%' }}>
        {/* Sidebar - responsive */}
        {isMobile ? (
          <Drawer
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            sx={{
              width: '80%',
              maxWidth: 350,
              flexShrink: 0,
              '& .MuiDrawer-paper': { width: '80%', maxWidth: 350, boxSizing: 'border-box' },
            }}
          >
            {sidebarContent}
          </Drawer>
        ) : (
          <Box
            sx={{
              width: { sm: 260, md: 300, lg: 320 },
              flexShrink: 0,
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : theme.palette.background.paper,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {sidebarContent}
          </Box>
        )}
        
        {/* Chat area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          p: { xs: 0.5, sm: 1, md: 2 },
          bgcolor: theme.palette.background.default,
          height: '100%',
          overflow: 'hidden',
          width: '100%'
        }}>
          <ErrorBoundary
            onReset={() => {
              dispatch(clearActiveConversation());
              setRenderError(null);
            }}
          >
            {activeConversation ? (
              <>
                {/* Chat header - Simplified */}
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: { xs: 1, sm: 2 },
                    p: { xs: 1, sm: 2 },
                    borderRadius: 2,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    width: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MuiAvatar sx={{ width: 40, height: 40, mr: 2 }}>
                      {activeConversation.isGroup
                        ? (activeConversation.name ? activeConversation.name.charAt(0).toUpperCase() : 'G')
                        : 'U'}
                    </MuiAvatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        {activeConversation.isGroup
                          ? activeConversation.name || 'Group Chat'
                          : 'Chat'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activeConversation.id}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Paper>
              
              {/* Messages - Simplified */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                mb: 2,
                px: { xs: 1, sm: 2, md: 3 },
                py: 2,
                bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)',
                borderRadius: 2,
                width: '100%'
              }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : !activeConversationMessages || activeConversationMessages.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%',
                    opacity: 0.7
                  }}>
                    <Box component="img" 
                      src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" 
                      alt="Empty chat"
                      sx={{ width: 80, height: 80, opacity: 0.5, mb: 2 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      No messages yet. Start a conversation!
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {activeConversationMessages.map((message, index) => (
                      <Paper 
                        key={index} 
                        elevation={0} 
                        sx={{
                          p: 2,
                          bgcolor: message.senderId === user?.id ? 'primary.light' : 'background.paper',
                          color: message.senderId === user?.id ? 'primary.contrastText' : 'text.primary',
                          borderRadius: 2,
                          alignSelf: message.senderId === user?.id ? 'flex-end' : 'flex-start',
                          maxWidth: '70%'
                        }}
                      >
                        <Typography variant="body1" component="div">{message.content || 'No content'}</Typography>
                        <Typography variant="caption" component="div" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>
              
              {/* Message input */}
              <Paper
                elevation={0}
                sx={{ 
                  p: { xs: 1, sm: 2 }, 
                  borderRadius: 3,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  width: '100%'
                }}
              >
                <MessageInput
                  onSendMessage={(content) => {
                    try {
                      handleSendMessage(content);
                    } catch (error) {
                      console.error('Error sending message:', error);
                      setRenderError('Failed to send message');
                    }
                  }}
                  onTyping={handleTyping}
                  disabled={loading}
                />
              </Paper>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%',
                p: { xs: 2, sm: 3 }
              }}
            >
              <Box 
                component="img"
                src="https://cdn-icons-png.flaticon.com/512/3820/3820331.png"
                alt="Welcome"
                sx={{ 
                  width: 120, 
                  height: 120, 
                  opacity: 0.7, 
                  mb: 4,
                  filter: theme.palette.mode === 'dark' ? 'brightness(0.8)' : 'none'
                }}
              />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Welcome to Skype Clone
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: { xs: '100%', sm: 450 }, px: 2 }}>
                Select a conversation from the sidebar to start chatting or create a new one using the + button.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                sx={{ mt: 4 }}
                onClick={() => {/* TODO: Implement new chat functionality */}}
              >
                Start New Conversation
              </Button>
            </Box>
          )}
          </ErrorBoundary>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
