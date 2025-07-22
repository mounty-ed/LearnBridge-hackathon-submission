import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';


import { Container, Typography, Link, List, ListItem, Box, Button } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles'
import { completeLesson } from '@/utils';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

interface AssignmentJson {
  title: string;
  type: string;
  content: string;
  completed: boolean;
}

interface ReadingPageProps {
  assignmentJson: AssignmentJson;
  handleComplete: () => void;
}

export default function AssignmentPage({ assignmentJson, handleComplete }: ReadingPageProps) {
  const theme = useTheme();
  const [clickedComplete, setClickedComplete] = useState(false);

  const raw = assignmentJson.content || '';
  const md = raw.replace(/\\n/g, '\n');

  const components = {
    h1: ({ node, ...props }) => <Typography variant="h2" fontWeight={500} gutterBottom {...props} />,
    h2: ({ node, ...props }) => <Typography variant="h3" gutterBottom {...props} />,
    h3: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} />,
    p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} />,
    a: ({ node, ...props }) => <Link {...props} />,
    ul: ({ node, ...props }) => <List sx={{ pl: 4 }} {...props} />,
    ol: ({ node, ...props }) => <List component="ol" sx={{ pl: 4 }} {...props} />,
    li: ({ node, ...props }) => <ListItem sx={{ display: 'list-item', py: 0 }} {...props} />,
    code: ({ node, inline, className, children, ...props }) =>
      inline ? (
        <Box component="code" sx={{ bgcolor: 'background.light', p: 0.5, borderRadius: 1, my: 1 }} {...props}>
          {children}
        </Box>
      ) : (
        <Typography component="pre" variant="body2" sx={{ bgcolor: 'background.light', color: 'text.primary', p: 2, borderRadius: 1, my: 1 }}>
          {children}
        </Typography>
      ),
  };

  return (
    <Container maxWidth="md" sx={{ my: 8 }}>
      <Box sx={{ '& img': { maxWidth: '100%' } }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={components}
        >
          {md}
        </ReactMarkdown>
        <Typography
          variant="body1"
          sx={{
              fontWeight: 400,
              fontSize: '1.1rem',
              color: alpha(theme.palette.text.primary, 0.8),
          }}
        >
          Assignments rely on an honor system. Please press complete once you have successfuly finished the assignment.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          disableElevation
          disabled={assignmentJson.completed}
          variant="contained"
          onClick={() => {
            handleComplete();
            setClickedComplete(true);
          }}
          sx={{
            color: 'primary',
            mt: 8,
            marginLeft: 'auto',
            borderRadius: 999,
            fontSize: '1.2rem',
            height: '100%', 
            textTransform: 'none',
            fontWeight: 500,
          }}
          >
          Complete <CheckCircleOutlineOutlinedIcon sx={{ml: 1}}/>
        </Button>
      </Box>
    </Container>
  );
}
