'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Typography,
  Paper,
  Stack,
  ListItemText,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { updateCourseTitle, deleteCourse, completeLesson } from '@/utils';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import EditCourseTitleDialog from '@/components/dialogs/EditCourseTitleDialog';
import ConfirmActionDialog from '@/components/dialogs/ConfirmActionDialog';

type Course = {
  id: string;
  title: string;
  createdAt: string;
  topic: string;
  uid: string;
  totalLessons: number;
  status: string;
  generatedLessons: number;
  completedLessons: number;
  deleted: boolean;
}

export default function Dashboard() {
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(null);

  const router = useRouter();
  const theme = useTheme();

  const handleCourseView = (id, title) => {
    router.push(`/course/${id}/${slugify(title, { lower: true })}`);
  }
  const handleAddCourse = () => {
    router.push('/create');
  };
  const handleEdit = (courseId: string, courseTitle: string) => {
    setSelectedCourse({ id: courseId, title: courseTitle });
    setEditOpen(true);
  }
  const handleSaveTitle = async (newTitle: string) => {
    if (!selectedCourse) return;
    await updateCourseTitle(selectedCourse.id, newTitle);
    setEditOpen(false);
  };
  const handleDelete = (courseId: string, courseTitle: string) => {
    setSelectedCourse({ id: courseId, title: courseTitle });
    setDeleteOpen(true);
  }
  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;
    await deleteCourse(selectedCourse.id);
    setDeleteOpen(false);
  }

  useEffect(() => {
    const userChange = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => userChange();
  }, []);

  useEffect(() => {
    if (!user) return;

    const coursesCol = collection(db, 'users', user.uid, 'courses');
    const q = query(coursesCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const courses: Course[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Course));
      setUserCourses(courses);
    }, err => {
      console.error('Failed to subscribe to courses:', err);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Container maxWidth="md" sx={{ my: 8 }}>
      <ConfirmActionDialog
        open={deleteOpen}
        title="Delete Course"
        content="Deleted courses can be recovered in the history page."
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmColor="error"
      />
      <EditCourseTitleDialog
        open={editOpen}
        currentTitle={selectedCourse?.title || ''}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveTitle}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
        <HomeIcon sx={{ fontSize: '5rem', mr: 2, color: 'text.secondary' }}/>
        <Typography variant="h2" fontWeight={700} color="text.secondary">
          Your Courses
        </Typography>
      </Box>

      {userCourses.some(c => c.totalLessons !== c.generatedLessons) && (
       <>
        <Divider sx={{ mb: 3, mt: 6 }} />
        <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Generating
            </Typography>
          </Box>
          <Stack spacing={2}>
            {userCourses
              .filter(
                ({ totalLessons, generatedLessons, deleted }) =>
                  totalLessons !== generatedLessons && deleted === false
              )
              .map(({ id, title, createdAt, topic, totalLessons, generatedLessons }) => {
                return (
                  <Paper
                    key={id}
                    sx={{
                      position: 'relative',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      boxShadow: `0px 0px 16px ${alpha(theme.palette.grey[600], 0.3)}`,
                      borderRadius: 2,
                      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 36px ${alpha(theme.palette.grey[900], 0.2)}`,
                      },
                    }}
                    >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <ListItemText
                        disableTypography
                        primary={
                          <Typography sx={{ fontWeight: 600, m: 0, fontSize: '1.4rem' }}>
                            {title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, m: 0 }}>
                            {new Date(createdAt).toLocaleDateString()}
                          </Typography>
                        }
                      />
                      <Typography variant="body2" sx={{ 
                        minWidth: 80, 
                        textAlign: 'right', 
                        mr: 1,
                        color: 'text.secondary', 
                        fontSize: '1.8rem',
                        fontWeight: 600, 
                      }}>
                        {Math.floor((generatedLessons / totalLessons) * 100)}%
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={(generatedLessons / totalLessons) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: alpha(theme.palette.grey[300], 0.4),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 999,
                          backgroundColor: theme.palette.secondary.main,
                        },
                      }}
                    />
                  </Paper>
                )
            })}
          </Stack>
        </>
      )}
      
      <Divider sx={{ mb: 3, mt: 6 }} />

      <>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
        >
          <Typography variant="h5" fontWeight={600}>
            In Progress
          </Typography>
          <Tooltip title="Create a new course" arrow placement="top">
            <IconButton onClick={() => handleAddCourse()}>
              <AddIcon sx={{ fontSize: '2rem', color: 'text.primary' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {(() => {
          // 1️⃣ extract the “in progress” courses
          const inProgress = userCourses.filter(
            ({ totalLessons, generatedLessons, deleted, completedLessons }) =>
              totalLessons === generatedLessons &&
              deleted === false &&
              totalLessons !== completedLessons
          );

          // 2️⃣ if none, show the placeholder
          if (inProgress.length === 0) {
            return (
              <Typography color="text.secondary">
                No courses in progress.
              </Typography>
            );
          }

          // 3️⃣ otherwise render the list
          return (
            <Stack spacing={2}>
              {inProgress.map(
                ({ id, title, createdAt, totalLessons, completedLessons }) => (
                  <Paper
                    key={id}
                    sx={{
                      position: 'relative',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      boxShadow: `0px 0px 16px ${alpha(
                        theme.palette.grey[600],
                        0.3
                      )}`,
                      borderRadius: 2,
                      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 36px ${alpha(
                          theme.palette.grey[900],
                          0.2
                        )}`,
                        '& .actionButtons': { display: 'flex' },
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography sx={{ fontWeight: 600, m: 0, fontSize: '1.4rem' }}>
                          {title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, m: 0 }}>
                          {new Date(createdAt).toLocaleDateString()} - {completedLessons}/{totalLessons} lessons completed
                        </Typography>
                      }
                    />
                    <Box
                      className="actionButtons"
                      sx={{
                        display: 'none',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        gap: 0.2,
                      }}
                    >
                      <Tooltip title="View course" arrow>
                        <IconButton
                          onClick={() => handleCourseView(id, title)}
                          sx={{ p: 1 }}
                        >
                          <VisibilityIcon sx={{ fontSize: '1.6rem' }} />
                        </IconButton>
                      </Tooltip>
                        <Tooltip title="Edit title" arrow>
                          <IconButton 
                            onClick={() => handleEdit(id, title)}
                            sx={{ p: 1 }}>
                            <EditIcon sx={{ fontSize: '1.6rem' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete course" arrow>
                          <IconButton 
                            onClick={() => handleDelete(id, title)}
                            sx={{ 
                              p: 1, 
                              '&:hover .delete-icon': { 
                                color: 'error.main',
                                borderRadius: '50%',
                                '& .MuiSvgIcon-root': {
                                  color: alpha(theme.palette.error.main, 0.5),
                                },
                              },
                            }}
                          >
                            <DeleteIcon className="delete-icon" sx={{ fontSize: '1.6rem', color: 'inherit' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={(completedLessons / totalLessons) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: alpha(theme.palette.grey[300], 0.4),
                        '&.MuiLinearProgress-root': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 999,
                          backgroundColor: theme.palette.primary.main,
                        },
                      }}
                    />
                  </Paper>
                )
              )}
            </Stack>
          );
        })()}
      </>
      
      <Divider sx={{ mb: 3, mt: 6 }} />

      <>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Completed
          </Typography>
        </Box>
        <Stack spacing={2}>
          {(() => {
            const completedCourses = userCourses.filter(
              ({ totalLessons, generatedLessons, deleted, completedLessons }) =>
                totalLessons === generatedLessons &&
                deleted === false &&
                totalLessons === completedLessons
            );

            if (completedCourses.length === 0) {
              return (
                <Typography>
                  No courses completed yet.
                </Typography>
              );
            }

            return completedCourses.map(
              ({ id, title, createdAt, completedLessons }) => (
                <Paper
                  key={id}
                  sx={{
                    position: 'relative',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    boxShadow: `0px 0px 16px ${alpha(
                      theme.palette.grey[600],
                      0.3
                    )}`,
                    borderRadius: 2,
                    transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 36px ${alpha(
                        theme.palette.grey[900],
                        0.2
                      )}`,
                      '& .actionButtons': { display: 'flex' },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography sx={{ fontWeight: 600, m: 0, fontSize: '1.4rem' }}>
                          {title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, m: 0 }}>
                          {new Date(createdAt).toLocaleDateString()} - {completedLessons} lessons completed
                        </Typography>
                      }
                    />
                    <Box
                      className="actionButtons"
                      sx={{
                        display: 'none',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        gap: 0.2,
                      }}
                    >
                      <Tooltip title="View course" arrow>
                        <IconButton
                          onClick={() => handleCourseView(id, title)}
                          sx={{ p: 1 }}
                        >
                          <VisibilityIcon sx={{ fontSize: '1.6rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit title" arrow>
                        <IconButton 
                          onClick={() => handleEdit(id, title)}
                          sx={{ p: 1 }}>
                          <EditIcon sx={{ fontSize: '1.6rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete course" arrow>
                        <IconButton 
                          onClick={() => handleDelete(id, title)}
                          sx={{ 
                            p: 1, 
                            '&:hover .delete-icon': { 
                              color: 'error.main',
                              borderRadius: '50%',
                              '& .MuiSvgIcon-root': {
                                color: alpha(theme.palette.error.main, 0.5),
                              },
                            },
                          }}
                        >
                          <DeleteIcon className="delete-icon" sx={{ fontSize: '1.6rem', color: 'inherit' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              )
            );
          })()}
        </Stack>
      </>

    </Container>
    
  );
}
