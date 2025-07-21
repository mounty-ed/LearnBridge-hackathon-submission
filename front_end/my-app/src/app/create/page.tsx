'use client';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  InputAdornment,
  TextField,
  Typography,
  alpha,
  Switch,
  Paper,
  Slider,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { generateCourses } from '@/utils';
import { useRouter } from 'next/navigation';
import { useThemeMode } from '@/context/ThemeContext';

import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import LoadingAnimationComponent from '@/components/common/LoadingAnimationComponent';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';


export default function CourseCreatePage() {
  const router = useRouter();
  const theme = useTheme();
  const { resolvedMode } = useThemeMode();

  const MAX_MODULES = 6;

  const [isFocused, setIsFocused] = useState(false);
  const [showEditTab, setShowEditTab] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [types, setTypes] = useState({
    videos: true,
    assignments: true,
  });
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [numModules, setNumModules] = useState(3);


  const handleStartEdit = () => {
    setShowEditTab(true);
  };
  const handleCreate = async () => {
    try {
      setIsLoading(true);
      await generateCourses(title, topic, types, numModules)
      router.push('/dashboard');
    } catch (e) {
      console.error('Error generating course:', e);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  if (isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 72px)',
      }}>
        <LoadingAnimationComponent />
      </Box>
    )
  }

  const disabled = topic.trim() === '' || title.trim() === '';

  return (
    <>
      {/* SLIDE CONTAINER */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',  
          mt: '-72px',
        }}
      >
        {!showEditTab ? (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              mx: 'auto',
              maxWidth: 'md',
            }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  textAlign: 'center',
                  mb: 8
                }}
                gutterBottom
              >
                Create New Course
              </Typography>
              <Box component="form" noValidate autoComplete="off" sx={{ width: '100%' }}>
                <Box
                  sx={{
                    bgcolor: 'background.light',
                    borderRadius: 999,
                    minWidth: 460,
                    boxShadow: resolvedMode === "light" ? (
                      isFocused
                      ? `0px 0px 36px ${alpha(theme.palette.grey[400], 0.5)}`
                      : `0px 0px 24px ${alpha(theme.palette.grey[400], 0.4)}`
                    ) : ('none'),
                    transition: 'box-shadow 0.3s ease-in-out',
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 460,
                      display: 'flex',
                      alignItems: 'center',
                      border: resolvedMode === "light" ? 
                        (`2px solid ${theme.palette.divider}`) : 
                        (`1px solid ${theme.palette.divider}`),
                      borderRadius: 999,
                      overflow: 'hidden',
                      '& .MuiInputBase-root': {
                        '& input': {
                          padding: '16px',
                          fontSize: '1rem',
                        },
                      },
                    }}
                  >
                    <TextField
                      variant="standard"
                      placeholder="Enter Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      sx={{
                        minWidth: 110,
                        maxWidth: 640,
                        width: `${Math.max(110, title.length * 15)}px`,
                        transition: 'width 0.3s ease',
                      }}
                    />

                    <Divider orientation="vertical" flexItem />

                    <TextField
                      variant="standard"
                      placeholder="Enter Course Topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      fullWidth
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      InputProps={{
                        disableUnderline: true,
                        sx: { px: 2 },
                        endAdornment: (
                          <InputAdornment position="end" sx={{ mr: '-7px' }}>
                            <IconButton
                              onClick={handleStartEdit}
                              disabled={disabled}
                              disableRipple
                              sx={{
                                borderRadius: 999,
                                height: '100%',
                                p: 1,
                                transition: 'all 0.3s ease-in-out',

                                backgroundColor: theme.palette.primary.dark,
                                color: theme.palette.common.white,

                                '&:hover': {
                                  backgroundColor: theme.palette.primary.main,
                                  color: theme.palette.primary.contrastText,
                                  '& .MuiSvgIcon-root': {
                                    transform: 'rotate(360deg)',
                                  },
                                },

                                '& .MuiSvgIcon-root': {
                                  transition: 'transform 0.3s ease-in-out',
                                },

                                '&.Mui-disabled': {
                                  backgroundColor: alpha(theme.palette.grey[600], 0.5),
                                  color: alpha(theme.palette.common.white, 0.8),
                                },
                              }}
                            >
                              <ArrowUpwardIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Container maxWidth="md">
              <Paper sx={{ width: '100%', maxWidth: '750px', mx: 'auto', p: 5, bgcolor: 'background.light', borderRadius: 6, mt: 5,
                boxShadow: `0px 6px 24px ${alpha(theme.palette.grey[600], 0.3)}`, 
              }}>

                {/* Top */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 7, alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h2" gutterBottom sx={{ mb: 1, fontSize: '2rem', fontWeight: 700, color: theme.palette.text.primary }}>
                      Set up your Course
                    </Typography>
                    <Typography variant="h3" gutterBottom sx={{ fontSize: '1.25rem', color: theme.palette.text.secondary }}>
                      {title}
                    </Typography>
                  </Box>
                  <DriveFileRenameOutlineRoundedIcon sx={{ fontSize: '5.5rem', color: theme.palette.primary.dark }}/>
                </Box>


                {/* Bottom */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Number of Modules */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" sx={{ display: 'flex', flexDirection: 'row' }}>
                      Modules 
                    </Typography>
                    <Box sx={{ width: 200, px: 2 }}>
                      <Slider
                        value={numModules}
                        min={1}
                        max={MAX_MODULES}
                        step={1}
                        valueLabelDisplay="auto"
                        onChange={(_, value) => {
                          // value comes in as number | number[]
                          const val = Array.isArray(value) ? value[0] : value;
                          setNumModules(val);
                        }}
                        sx={{
                          '& .MuiSlider-thumb': {
                            width: 16,
                            height: 16,
                            '&:focus, &:hover, &.Mui-active': {
                              boxShadow: 'none',
                            },
                          },
                          '& .MuiSlider-rail': {
                            opacity: 0.3,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Question Types */}
                  {['videos', 'assignments'].map((type) => (
                    <Box key={type} sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                      <Typography sx={{ color: 'text.secondary' }}>
                        {{
                          videos: 'Videos',
                          assignments: 'Assignments',
                        }[type]}
                      </Typography>
                      <Switch
                        checked={types[type]}
                        onChange={() =>
                          setTypes((prev) => ({ ...prev, [type]: !prev[type] }))
                        }
                      />
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 6, justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowEditTab(false)}
                    sx={{
                      color: 'primary',
                      borderWidth: 2,
                      borderRadius: 10,
                      fontSize: '1rem',
                      height: '100%', 
                    }}
                  >
                    Return <KeyboardReturnIcon sx={{ml: 1}}/>
                  </Button>

                  <Button
                    onClick={handleCreate}
                    variant="outlined"
                    color="primary"
                    sx={{
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
                    Create <PlayCircleOutlineIcon sx={{ml: 1}}/>
                  </Button>
                </Box>
              </Paper>
            </Container>
          </Box>
        )}
      </Box>
    </>
  );
}
