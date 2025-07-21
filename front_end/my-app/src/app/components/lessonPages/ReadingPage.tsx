import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';


import { Container, Typography, Link, List, ListItem, Box, Button } from '@mui/material';
import { completeLesson } from '@/utils';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

interface ReadingJson {
  title: string;
  type: string;
  content: string;
  completed: boolean;
  citations: { [key: string]: any }[];
}

interface ReadingPageProps {
  readingJson: ReadingJson;
  handleComplete: () => void;
}

export default function ReadingPage({ readingJson, handleComplete }: ReadingPageProps) {
  const raw = readingJson.content || '';
  const md = raw.replace(/\\n/g, '\n');
  const [clickedComplete, setClickedComplete] = useState(false);

  const components = {
    h1: ({ node, ...props }) => <Typography variant="h2" gutterBottom fontWeight={500} {...props} />,
    h2: ({ node, ...props }) => <Typography variant="h3" gutterBottom {...props} />,
    h3: ({ node, ...props }) => <Typography variant="h4" gutterBottom {...props} />,
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
        <Box component="code" sx={{ bgcolor: 'background.paper', p: 0.5, borderRadius: 1, my: 1 }} {...props}>
          {children}
        </Box>
      ) : (
        <Typography component="pre" variant="body2" sx={{ bgcolor: 'background.paper', color: 'text.primary', p: 2, borderRadius: 1, my: 1 }}>
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
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          disableElevation
          disabled={readingJson.completed || clickedComplete}
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
      {/* {(readingJson.citations.length > 0 && readingJson.citations) && (
        <Box sx={{ marginTop: 12 }}>
          <Typography variant="h6" gutterBottom color="text.secondary">Sources:</Typography>
          {readingJson.citations.map((item, idx) => (
            <Typography key={idx} component="div" color="text.secondary">
              {item.title},{' '}
              <Link href={item.url} target="_blank" rel="noopener noreferrer">
                {item.url}
              </Link>
            </Typography>
          ))}
        </Box>
      )} */}
    </Container>
  );
}
