'use client';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React, { useState, useEffect, useRef, Suspense, use } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  useTheme,
  Link,
  Divider,
  Tooltip,
  Container
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import PieChartComponent from '@/components/common/PieChartComponent';
import { useThemeMode } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { keyframes } from '@mui/system';
import slugify from 'slugify';

interface QuestionItem {
  question: string,
  answer: string,
  explanation: string,
  choices: string[],
}

interface TestJson {
  content: QuestionItem[];
  type: string;
  title: string;
}

interface TestViewerProps {
  title: string;
  testJsonContent: TestJson;
  setStarted: React.Dispatch<React.SetStateAction<boolean>>;
  handleComplete: () => void;
}

export default function TestViewer({ testJsonContent, title, setStarted, handleComplete }: TestViewerProps) {
  const theme = useTheme();
  const router = useRouter();
  const { resolvedMode } = useThemeMode();

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [testJson, setTestJson] = useState<QuestionItem[]>(testJsonContent.content);

  useEffect(() => {
    console.log(testJson);
  }, [testJson])

  const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const shuffleTest = (original) => {
    return shuffleArray(original).map((q) => ({
      ...q,
      choices: shuffleArray(q.choices)
    }));
  };

  const handleRetakeTest = () => {
    const shuffled = shuffleTest(testJson);
    setTestJson(shuffled);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSelect = (qIndex, choice) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [qIndex]: choice }));
    }
  };
  const handleReturn = () => {
    setStarted(false);
  }
  const handleSubmit = () => {
    let correctCount = 0;
    testJson.forEach((q, idx) => {
      if (answers[idx] === q.answer) correctCount++;
    });
    if (correctCount / testJson.length >= 0.8) {
      handleComplete();
    }
    setScore(correctCount);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container
      maxWidth='md'
      sx={{
        marginX: 'auto',
        borderRadius: 5,
        marginY: 12,
      }}
    >

      {/* Results */}

      {submitted && (
        <>
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
              }}
            >
              <PieChartComponent score={score} total={testJson.length} />
              <Typography
                variant="h5"
                sx={{
                  color:
                    score / testJson.length >= 0.8
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  fontSize: '3rem',
                  fontWeight: 700,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.1rem',
                  }}
                >
                  You scored {score} / {testJson.length}
                </Typography>
                {Math.round((score / testJson.length) * 10000) / 100}%
              </Typography>
            </Box>
          </Box>
          {/* Return Button */}
          <Box sx={{display: 'flex'}}>
            <Tooltip title="Must score 80% or above to complete this lesson.">
              <Button
                variant="contained"
                color="primary"
                onClick={handleRetakeTest}
                sx={{
                  mt: 8,
                  mb: 8,
                  borderRadius: 999,
                  fontSize: '1rem',
                }}
              >
                Retake <ReplayIcon sx={{ml: 1}}/>
              </Button>
            </Tooltip>
            <Button
              variant="outlined"
              onClick={handleReturn}
              disabled={Object.keys(answers).length < testJson.length}
              sx={{
                color: 'primary',
                mt: 8,
                mb: 8,
                marginLeft: 'auto',
                borderWidth: 2,
                borderRadius: 999,
                fontSize: '1rem',
                height: '100%', 
              }}
            >
              Return <KeyboardReturnIcon sx={{ml: 1}}/>
            </Button>
          </Box>
        </>
      )}

      {/* Actual Test */}
      {testJson.map((q, idx) => {
        console.log('q: ', q)
        let questionColor = 'text.primary';
        if (submitted) {
          if (answers[idx] === q.answer) {
            questionColor = 'success.main';
          } else if (answers[idx]) {
            questionColor = 'error.main';
          }
        }

        return (
          <Card
            key={idx}
            variant="outlined"
            sx={{
              mb: 6,
              padding: 4,
              borderRadius: 2,
              borderWidth: 0,
              backgroundColor: 'background.light',
              boxShadow: `0px 5px 24px ${alpha(theme.palette.grey[400], 0.3)}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" align="right" sx={{ marginTop: -2, marginRight: -2, fontSize: 16, color: theme.palette.text.primary }}>
                {idx + 1} of {testJson.length}
              </Typography>
              <>
                {/* Multiple Choice Card */}
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    marginBottom: 8,
                    marginRight: 4,
                    marginTop: 2,
                    color: questionColor, 
                  }}
                >
                  {q.question}
                </Typography>
                <Grid container spacing={2}>
                  {q.choices.map((choice, cidx) => {
                    let borderColor = 'grey.200';
                    let backgroundColor = 'transparent';
                    let textColor = 'text.primary';
                    let hoverColor = alpha(theme.palette.grey[400], 0.1);

                    if (submitted) {
                      if (choice === q.answer) {
                        borderColor = 'success.main';
                        textColor = 'success.main';
                        if (resolvedMode === "light") {
                          backgroundColor = alpha(theme.palette.success.main, 0.1); 
                        } else {
                          backgroundColor = alpha(theme.palette.success.main, 0.05); 
                        }
                      } else if (answers[idx] === choice) {
                        borderColor = 'error.main';
                        textColor = 'error.main';
                        if (resolvedMode === "light") {
                          backgroundColor = alpha(theme.palette.error.main, 0.1);
                        } else {
                          backgroundColor = alpha(theme.palette.error.main, 0.05);
                        }
                      }
                    } else if (answers[idx] === choice) {
                      if (resolvedMode === "light") {
                        backgroundColor = alpha(theme.palette.primary.light, 0.2);
                        borderColor = 'primary.dark';
                        textColor = 'primary.dark';
                        hoverColor = alpha(theme.palette.primary.light, 0.4);
                      } else {
                        backgroundColor = alpha(theme.palette.primary.light, 0.08);
                        borderColor = 'primary.dark';
                        textColor = 'primary.dark';
                        hoverColor = alpha(theme.palette.primary.light, 0.16);
                      }
                    }

                    return (
                      <Grid size={{ xs: 6 }} key={cidx}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => handleSelect(idx, choice)}
                          disabled={submitted}
                          sx={{
                            height: '100%',
                            justifyContent: 'flex-start',
                            borderColor: borderColor,
                            color: textColor,
                            backgroundColor: backgroundColor,
                            textTransform: 'none',
                            borderRadius: 3,
                            borderWidth: 2,
                            padding: 2,
                            '&:hover': {
                              ...(answers[idx] !== choice && {
                                borderColor: theme.palette.grey[400],
                                backgroundColor: hoverColor
                              }),
                              ...(answers[idx] === choice && {
                                backgroundColor: hoverColor
                              }),
                            },
                            '&:disabled': {
                              opacity: 1, 
                              backgroundColor: backgroundColor,
                              color: textColor,
                              borderColor: borderColor,
                            },
                          }}
                        >
                          <Typography sx={{textAlign: 'left'}}>
                            {choice}
                          </Typography>
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </>
              
              {submitted && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mt: 6,
                    ml: 1,
                  }}
                >
                  <HelpOutlineIcon
                    sx={{
                      fontSize: '1.6rem',
                      color: alpha(theme.palette.text.primary, 0.6),
                      mr: 3,
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 400,
                      fontSize: '1.1rem',
                      color: alpha(theme.palette.text.primary, 0.8),
                    }}
                  >
                    {q.explanation}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}

      {!submitted && (
        <Box display="flex">
          <Tooltip title="Must score 80% or above to complete this lesson.">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < testJson.length}
              sx={{
                color: 'primary',
                marginTop: 4,
                marginLeft: 'auto',
                borderWidth: 2,
                borderRadius: 10,
                fontSize: '1.2rem',
              }}
              >
              Submit <CheckCircleOutlineIcon sx={{ ml: 1 }} />
            </Button>   
          </Tooltip>
        </Box>   
      )} 
    </Container>
  );
}