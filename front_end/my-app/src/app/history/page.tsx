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
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  getFirestore
} from 'firebase/firestore';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { restoreCourse } from '@/utils';

import HomeIcon from '@mui/icons-material/Home';

type Course = {
  id: string;
  title: string;
  createdAt: string;
  topic: string;
  uid: string;
  totalLessons: number;
  status: string;
  generatedLessons: number;
  deleted: boolean;
}

export default function History() {
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(null);

  const router = useRouter();
  const theme = useTheme();


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

  const handleRestore = async ( id: string ) => {
    await restoreCourse(id)
  }

  return (
    <Container maxWidth="md" sx={{ my: 8, minWidth: '600px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Your Deleted Courses
        </Typography>
      </Box>

      {!userCourses.some(c => c.deleted === true) ? (
        <Typography color="text.primary">No deleted courses.</Typography>
      ) : (
        <Stack spacing={2}>
          {userCourses
            .filter(
              ({ deleted }) =>
                deleted === true
            )
            .map(({ id, title, createdAt }) => (
              <Paper
                key={id}
                sx={{
                  position: 'relative',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  boxShadow: `0px 0px 12px ${alpha(theme.palette.grey[600], 0.2)}`,
                  borderRadius: 2,
                  transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.grey[900], 0.2)}`,
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
                      <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.25, m: 0 }}>
                        {new Date(createdAt).toLocaleDateString()}
                      </Typography>
                    }
                  />
                  <Box
                    className="actionButtons"
                    sx={{
                      display: 'none',
                      alignItems: 'center',
                    }}
                  >
                    <Button 
                      onClick={() => handleRestore(id)}
                      sx={{ 
                        borderRadius: 2, 
                        fontSize: '1.2rem', 
                        p: 1,
                        mr: 1,
                        '&:hover' : {
                          bgcolor: 'transparent',
                        }
                      }}
                    >Restore</Button>
                  </Box>
                </Box>
              </Paper>
          ))}
        </Stack>
      )}

    </Container>
    
  );
}
