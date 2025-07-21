'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense, use } from 'react';
import TestViewer from '@/components/lessonPages/TestViewer';
import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useRouter } from 'next/navigation';


interface QuestionItem {
  question: string;
  answer: string;
  explanation: string;
  choices: string[];
}

interface TestJson {
  content: QuestionItem[];
  type: string;
  title: string;
  completed: boolean;
}

interface TestPageProps {
  content: TestJson;
  handleComplete: () => void;
}

export default function TestPage({ content, handleComplete }: TestPageProps) {
  const theme = useTheme();
  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [testJson, setTestJson] = useState(content);
  const [testJsonTitle, setTestJsonTitle] = useState(content.title);

  const hasRun = useRef(false);

  const preprocessQuestions = (data) => {

    const shuffle = (array) => {
        let currentIndex = array.length, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    return shuffle(data.content)
  };

  const handleStart = () => {
    setTestJson({
      ...testJson,
      content: preprocessQuestions(testJson)
    });
    setStarted(true);
  }

  return (
    <>
      {!started ? (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 24,
          mx: 'auto',
        }}>
          <Paper sx={{ width: '70%', minWidth: '640px', maxWidth: '750px', mx: 'auto', p: 5, bgcolor: 'background.light', borderRadius: 6, my: 6,
            boxShadow: `0px 6px 24px ${alpha(theme.palette.grey[400], 0.3)}`, 
          }}>

            {/* Top */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
              <Box>
                <Typography variant="h2" gutterBottom sx={{ mb: 1, fontSize: '2rem', fontWeight: 700, color: theme.palette.text.primary }}>
                  Start your Test
                </Typography>
                <Typography variant="h3" gutterBottom sx={{ fontSize: '1.25rem', color: theme.palette.text.primary }}>
                  {testJsonTitle}
                </Typography>
              </Box>
              <QuizOutlinedIcon sx={{ fontSize: '5.5rem', color: theme.palette.primary.dark }}/>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 12 }}>
              <Button
                onClick={handleStart}
                variant="outlined"
                color="primary"
                sx={{
                  ml: 'auto',
                  right: 0,
                  borderRadius: 999,
                  fontSize: '1rem',
                  borderColor: 'transparent',
                  color: 'white',
                  backgroundColor: theme.palette.primary.dark,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                  },
                  '&:disabled': {
                    backgroundColor: alpha(theme.palette.grey[500], 0.5),
                    color: alpha(theme.palette.common.white, 0.5),
                    borderColor: 'transparent',
                    cursor: 'not-allowed',
                  },
                }}
              >
                Start <PlayCircleOutlineIcon sx={{ml: 1}}/>
              </Button>
            </Box>
          </Paper>
        </Box>
      ) : (
        <TestViewer title={testJsonTitle} testJsonContent={testJson} setStarted={setStarted} handleComplete={handleComplete}/>
      )}
    </>
  );
}