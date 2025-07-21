'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { api } from '@/lib/apiClient';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import { getDoc, updateDoc, doc } from 'firebase/firestore';
import { TestPage, ReadingPage, VideoPage, AssignmentPage, RightChatDrawer } from '@/components'

import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Button,
  useMediaQuery,
  Divider,
  Tooltip,
  Container,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

import { completeLesson } from '@/utils';

import MenuIcon from '@mui/icons-material/Menu';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LoadingAnimationComponent from '@/components/common/LoadingAnimationComponent';

function LessonIcon({ type }: { type: string }) {
  switch (type) {
    case 'reading':
      return <AutoStoriesOutlinedIcon sx={{ fontSize: '1.2rem', color: 'text.secondary', mr: 1 }} />;
    case 'test':
      return <QuizOutlinedIcon sx={{ fontSize: '1.2rem', color: 'text.secondary', mr: 1 }} />;
    case 'unit test':
      return <QuizOutlinedIcon sx={{ fontSize: '1.2rem', color: 'text.secondary', mr: 1 }} />;
    case 'video':
      return <OndemandVideoIcon sx={{ fontSize: '1.2rem', color: 'text.secondary', mr: 1 }} />;
    case 'assignment':
      return <AssignmentIcon sx={{ fontSize: '1.2rem', color: 'text.secondary', mr: 1 }} />;
  }
}

interface QuestionItem {
  question: string;
  answer: string;
  explanation: string;
  choices: string[];
}

interface TestJson {
  completed: boolean;
  content: QuestionItem[];
  type: string;
  title: string;
}

interface ReadingJson {
  title: string;
  type: string;
  content: string;
  completed: boolean;
  citations: { [key: string]: any }[];
}

interface AssignmentJson {
  title: string;
  type: string;
  content: string;
  completed: boolean;
}

interface VideoContentProps {
  description: string;
  thumbnail: string;
  title: string;
  url: string;
  videoId: string;
}

interface VideoJson {
  complete: boolean;
  title: string;
  type: string;
  content: VideoContentProps;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}


export default function CoursePage() {
  const theme = useTheme();
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  
  
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null);
  const lessonsUnsubs = useRef<Record<string, () => void>>({});
  const [openModuleIds, setOpenModuleIds] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<{
    moduleId: string | null;
    lessonId: string | null;
  }>({ moduleId: null, lessonId: null });
  const [readingJson, setReadingJson] = useState<ReadingJson | null>(null);
  const [assignmentJson, setAssignmentJson] = useState<AssignmentJson | null>(null);
  const [testJson, setTestJson] = useState<TestJson | null>(null);
  const [chatReference, setChatReference] = useState<{
    courseId: string | null; 
    moduleId: string | null;
    lessonId: string | null;
    lessonTitle: string | null;
    lessonType: string | null;
  }>({
    courseId: null, 
    moduleId: null, 
    lessonId: null,
    lessonTitle: null,
    lessonType: null,
  });
  const [videoJson, setVideoJson] = useState<VideoJson | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isResizing, setIsResizing] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(300);

  const MIN_WIDTH = 200;
  const MAX_WIDTH = 400;

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      

      // Subscribe to modules (no server ordering)
      const modulesCol = collection(
        db,
        'users',
        user.uid,
        'courses',
        courseId,
        'modules'
      ) as CollectionReference<DocumentData>;

      const unsubModules = onSnapshot(modulesCol, (modSnap) => {
        // 1) Map and sort modules by numeric ID
        const mods: Module[] = modSnap.docs
          .map((modDoc) => ({
            id: modDoc.id,
            title: modDoc.data().title,
            lessons: []
          }))
          .sort((a, b) => Number(a.id) - Number(b.id));

        setModules(mods);

        // Clean up stale lesson listeners
        const currentIds = mods.map((m) => m.id);
        for (const id in lessonsUnsubs.current) {
          if (!currentIds.includes(id)) {
            lessonsUnsubs.current[id]!();
            delete lessonsUnsubs.current[id];
          }
        }

        // 2) Subscribe per‐module lessons (also sorting by numeric ID)
        mods.forEach((mod) => {
          if (lessonsUnsubs.current[mod.id]) return;

          const lessonsCol = collection(
            db,
            'users',
            user.uid,
            'courses',
            courseId,
            'modules',
            mod.id,
            'lessons'
          ) as CollectionReference<DocumentData>;

          const unsubLessons = onSnapshot(lessonsCol, (lesSnap) => {
            const sortedLessons: Lesson[] = lesSnap.docs
              .map((d) => ({
                id: d.id,
                title: d.data().title,
                type: d.data().type,
                completed: d.data().completed
              }))
              .sort((a, b) => Number(a.id) - Number(b.id));

            // merge in-place
            setModules((prev) =>
              prev.map((m) =>
                m.id === mod.id ? { ...m, lessons: sortedLessons } : m
              )
            );
          });

          lessonsUnsubs.current[mod.id] = unsubLessons;
        });
      });

      return () => {
        unsubModules();
        Object.values(lessonsUnsubs.current).forEach((u) => u());
      };
    });

    return () => {
      unsubAuth();
      Object.values(lessonsUnsubs.current).forEach((u) => u());
    };
  }, [courseId, router]);

  
  useEffect(() => {
    if (
      user &&
      modules.length > 0 &&
      modules.every(m => m.lessons.length > 0) &&
      selectedLesson.moduleId === null
    ) {
      const courseRef = doc(db, 'users', user.uid, 'courses', courseId);
      getDoc(courseRef).then(snap => {
        const data = snap.data() || {};
        const { lastModuleId, lastLessonId } = data;
        if (lastModuleId && lastLessonId) {
          fetchLessonContent(lastModuleId, lastLessonId);
        } else {
          const firstModule = modules[0];
          const firstLesson = firstModule.lessons[0];
          fetchLessonContent(firstModule.id, firstLesson.id);
        }
      });
    }
  }, [modules, user]);



  // fetch single lesson content
  const fetchLessonContent = async (moduleId: string, lessonId: string) => {
    if (loading) return;  
    setLoading(true);
    try {
      setReadingJson(null);
      setTestJson(null);
      setVideoJson(null);
      setAssignmentJson(null);
      setChatReference(null);
      const { data } = await api.get(
        `/retrieve/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`
      );

      setChatReference({ courseId, moduleId, lessonId, 
        lessonTitle: data.title,
        lessonType: data.type,
      });
      if (data.type === "reading") {
        setReadingJson(data);
      } else if (data.type === "test" || data.type === "unit test") {
        setTestJson(data);
      } else if (data.type === "video") {
        setVideoJson(data);
      } else if (data.type === "assignment") {
        setAssignmentJson(data);
      }
      setSelectedLesson({ moduleId, lessonId });
      setOpenModuleIds(prev =>
        prev.includes(moduleId)
          ? prev
          : [...prev, moduleId]
      );

      if (user) {
        const courseRef = doc(db, 'users', user.uid, 'courses', courseId);
        await updateDoc(courseRef, {
          lastModuleId: moduleId,
          lastLessonId: lessonId,
        });
      }

      if (isMobile) setMobileOpen(false);
    } catch (err) {
      console.error("Error fetching lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const mod = selectedLesson.moduleId;
    if (mod) {
      setOpenModuleIds(prev =>
        prev.includes(mod) ? prev : [...prev, mod]
      );
    }
  }, [selectedLesson.moduleId]);


  const handleModuleClick = (modId: string) => {
    setOpenModuleIds((prev) =>
      prev.includes(modId)
        ? prev.filter((id) => id !== modId)
        : [...prev, modId]
    );
  };
  const handleDrawerToggle = () => setMobileOpen((o) => !o);
  const handleReturnHome = () => router.push('/dashboard');

  const handleComplete = () => {
    completeLesson(courseId, selectedLesson.moduleId, selectedLesson.lessonId);
  }

  const startResizing = () => {
    setIsResizing(true);
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
  };
  
  const resize = (e) => {
    const w = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
    setDrawerWidth(w);
  };
  
  const stopResizing = () => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResizing);
  };

  const drawer = (
    <Box sx={{ width: `${drawerWidth}px`, overflowX: 'hidden', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
      <Box
        onMouseDown={startResizing}
        sx={{
          cursor: 'ew-resize',
          width: '5px',
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 1400,
        }}
      />
      <Toolbar sx={{ mt: '72px', alignItems: "center" }}>
        <Tooltip title="Return">
          <IconButton
            color="primary"
            onClick={() => {
              handleReturnHome();
            }}
            sx={{
              mr: 1,
              '&:hover' : {
                backgroundColor: alpha(theme.palette.grey[300], 0.5)
              },
              height: '42px',
              width: '42px',
              '& .MuiTouchRipple-root .MuiTouchRipple-rippleVisible': {
                color: theme.palette.grey[500],
              },
            }}
          >
            <KeyboardReturnIcon sx={{ color: theme.palette.grey[500], fontSize: '1.6rem' }}/>
          </IconButton>
        </Tooltip>
        <Typography variant="h6">Modules</Typography>
      </Toolbar>
      <Divider />
      <List disablePadding>
        {modules.map((mod) => (
          <React.Fragment key={mod.id}>
            <ListItemButton disableRipple onClick={() => handleModuleClick(mod.id)} sx={{ pl: 3, pr: 2 }}>
              <ListItemText primary={mod.title} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '1.2rem',
                    fontWeight: 500,
                  }
                }}/>
              {openModuleIds.includes(mod.id) ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openModuleIds.includes(mod.id)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {mod.lessons.map((les) => {
                  const isSelected =
                    selectedLesson.moduleId === mod.id &&
                    selectedLesson.lessonId === les.id;
                  
                  return (
                    <ListItemButton
                      disableRipple
                      key={les.id}
                      onClick={() => fetchLessonContent(mod.id, les.id)}
                      selected={isSelected}
                      sx={{
                        ml: 3,
                        pl: 2,
                        whiteSpace: 'normal',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          borderLeft: `4px solid ${theme.palette.primary.dark}`,
                        },
                        ...(isSelected && {
                          borderLeft: `4px solid ${theme.palette.primary.dark}`,
                          backgroundColor: `${alpha(theme.palette.primary.main, 0.1)} !important`,
                          '&:hover': {
                            backgroundColor: `${alpha(theme.palette.primary.dark, 0.15)} !important`,
                          },
                        }),
                      }}
                    >
                      {les.completed ? (
                        <CheckCircleOutlineOutlinedIcon sx={{ fontSize: '1.4rem', color: 'success.main', mr: 1 }}/>
                      ) : (
                        <LessonIcon type={les.type} />
                      )}
                      <ListItemText primary={
                        <Typography>
                          <Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {les.type.charAt(0).toUpperCase() + les.type.slice(1)}:{' '}
                          </Typography>
                          {les.title}
                        </Typography>
                      } 
                      sx={{ 
                        '& .MuiTypography-root': { 
                          fontSize: '0.9rem',
                        },
                        ml: 1,
                      }}/>
                    </ListItemButton>
                  );
                })}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {isMobile && (
        <AppBar position="fixed">
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Course</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box component="nav">
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: `${drawerWidth}px`,
              height: '100%',
              boxSizing: 'border-box',
              overflowY: 'auto',
              overflowX: 'hidden',
              
              // Modern: Firefox & latest browsers
              scrollbarColor: '#888 transparent',
              scrollbarWidth: 'thin',

              // WebKit browsers
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '4px',
                border: '2px solid transparent',
                backgroundClip: 'content-box',
              },
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <RightChatDrawer reference={chatReference}>
        <Box
          component="main"
          sx={{
            mt: isMobile ? 7 : 0,
            ml: isMobile ? 0 : `${drawerWidth}px`,
            overflow: 'auto',
          }}
        >
          {loading && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 72px)',
            }}>
              <LoadingAnimationComponent />
            </Box>
          )}
          {readingJson && (
            <ReadingPage readingJson={readingJson} handleComplete={handleComplete}/>
          )}
          {assignmentJson && (
            <AssignmentPage assignmentJson={assignmentJson} handleComplete={handleComplete}/>
          )}
          {testJson && (
            <TestPage content={testJson} handleComplete={handleComplete}/>
          )}
          {videoJson && (
            <VideoPage videoJson={videoJson} handleComplete={handleComplete}/>
          )}
        </Box>
      </RightChatDrawer>
    </Box>
  );
}
