import React, { useRef, useState, useEffect } from 'react';
import { useTheme, Box, IconButton, Paper, TextField, Typography, Link, List, ListItem, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { auth, db } from '@/lib/firebase';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { ThinkingIndicator } from '@/components/common/ThinkingIndicator';

const markdownComponents = {
  h1: ({ node, ...props }) => <Typography variant="h4" gutterBottom {...props} />,
  h2: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} />,
  h3: ({ node, ...props }) => <Typography variant="h6" gutterBottom {...props} />,
  p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} />,
  a: ({ node, ...props }) => <Link {...props} />,
  ul: ({ node, ...props }) => (
    <List
      component="ul"
      sx={{ pl: 3, listStyleType: 'disc' }}
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <List
      component="ol" 
      sx={{ pl: 3, listStyleType: 'decimal' }} 
      {...props}
    />
  ),
  li: ({ node, ...props }) => (
    <ListItem
      component="li"  
      sx={{ display: 'list-item', py: 0, px: 0 }}
      {...props}
    />
  ),
  code: ({ node, inline, className, children, ...props }) =>
    inline ? (
      <Box component="code" sx={{ bgcolor: 'background.light', p: 0.5, borderRadius: 1 }} {...props}>
        {children}
      </Box>
    ) : (
      <Typography component="pre" variant="body2" sx={{ bgcolor: 'background.light', color: 'grey.100', p: 2, borderRadius: 1 }}>
        {children}
      </Typography>
    ),
};

interface ReferenceProps {
  courseId: string | null;
  moduleId: string | null; 
  lessonId: string | null;
  lessonTitle: string | null;
  lessonType: string | null;
}

interface RightChatDrawerProps {
  reference: ReferenceProps;
  children: React.ReactNode;
}

export default function RightChatDrawer({ children, reference }: RightChatDrawerProps) {
  const theme = useTheme();

  const assistantContentRef = useRef('');

  const drawerRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);

  const MIN_WIDTH = 180;
  const DEFAULT_OPEN_WIDTH = 300;
  const MAX_WIDTH = 500;

  const toggleDrawer = () => {
    setWidth((prev) => (prev === 0 ? DEFAULT_OPEN_WIDTH : 0));
  };

  const startResizing = () => {
    setIsResizing(true);
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
  };
  
  const resize = (e) => {
    const newWidth = Math.min(MAX_WIDTH, window.innerWidth - e.clientX);
    setWidth(newWidth >= MIN_WIDTH ? newWidth : MIN_WIDTH);
  };
  
  const stopResizing = () => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResizing);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { from: 'user', text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setError(null);

    setMessages((msgs) => [...msgs, { from: 'bot', loading: true }]);
    setLoading(true);

    try {
      const token = await auth.currentUser.getIdToken(true);

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage], reference }),
      });

      if (!response.ok || !response.body) throw new Error();

      assistantContentRef.current = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);
        assistantContentRef.current += chunk;

        setMessages((msgs) => {
          const tmp = [...msgs];
          tmp[tmp.length - 1] = { from: 'bot', text: assistantContentRef.current };
          return tmp;
        });

        if (loading) setLoading(false);
      }
    } catch {
      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { from: 'bot', text: 'Sorry, something went wrong.' },
      ]);
      setLoading(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <>
      {/* Toggle Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: width === 0 ? 0 : `${width + 8}px`,
          zIndex: 1300,
        }}
      >
        <Tooltip title="AI Assistant">
          <IconButton
            onClick={toggleDrawer}
            size="large"
            sx={{
              bgcolor: 'transparent',
              boxShadow: 'none',
              mr: 2,
            }}
          >
            {width === 0 ? <ChatIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Drawer Panel */}
      <Paper
        ref={drawerRef}
        elevation={4}
        square
        sx={{
          borderTop: 'none !important',
          borderBottom: 'none !important',
          borderRight: 'none !important',
          position: 'fixed',
          top: 0,
          right: 0,
          height: 'calc(100% - 72px)',
          mt: '72px',
          width: `${width}px`,
          display: width > 0 ? 'flex' : 'none',
          flexDirection: 'column',
          transition: isResizing ? 'none' : 'width 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <Box
          onMouseDown={startResizing}
          sx={{
            cursor: 'ew-resize',
            width: '5px',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1400,
          }}
        />

        <Box
          sx={{
            flexGrow: 1,
            p: 4,
            overflowX: 'hidden',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.08)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            scrollbarWidth: 'thin',
            scrollbarColor: `${theme.palette.grey[400]} transparent`,
          }}
        >
          {messages.length === 0 ? (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h3" color="grey.400" sx={{ textAlign: 'center', fontWeight: 600 }}>
                Ask for help
              </Typography>
            </Box>
          ) : (
            <>
              {messages.map((msg, i) =>
                msg.from === 'user' ? (
                  <Box key={i} sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ maxWidth: '80%', bgcolor: 'grey.100', borderRadius: 2, p: 1.2 }}>
                      {msg.text}
                    </Box>
                  </Box>
                ) : (
                  <Box key={i} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      {msg.loading ? (
                        <ThinkingIndicator />
                      ) : (
                        <Typography component="div" color="text.primary">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={markdownComponents}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </Typography>
                      )}
                    </Box>
                    {error && (
                      <Typography variant="body1" color="error">
                        {error}
                      </Typography>
                    )}
                  </Box>
                )
              )}
            </>
          )}
        </Box>

        <Box sx={{ p: 3 }}>
          <TextField
            placeholder="Ask for help on the current lesson"
            variant="outlined"
            size="small"
            fullWidth
            multiline
            minRows={1}
            maxRows={6}
            autoComplete="off"
            name="no-autocomplete"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              autoComplete: 'new-password',
              sx: {
                p: 1.5,
                borderRadius: 3,
                backgroundColor: 'grey.100',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },

                // Style the inner <textarea>
                '& textarea': {
                  overflow: 'auto',
                  resize: 'none',

                  // Hide scrollbar (cross-browser)
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                },
              },
            }}
          />
        </Box>
      </Paper>

      {/* Main Content Wrapper */}
      <Box
        sx={{
          transition: isResizing ? 'none' : 'margin 0.3s ease',
          marginRight: `${width}px`,
          flexGrow: 1,
        }}
      >
        {children}
      </Box>
    </>
  );
}
