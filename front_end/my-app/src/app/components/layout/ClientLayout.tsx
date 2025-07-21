'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Tooltip,
  Divider,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import Image from 'next/image';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MonitorIcon from '@mui/icons-material/Monitor';
import LogoutIcon from '@mui/icons-material/Logout';
import CreateIcon from '@mui/icons-material/Create';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import StyleIcon from '@mui/icons-material/Style';
import { auth } from '@/lib/firebase';
import { logOut } from '@/lib/auth';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import HomeIcon from '@mui/icons-material/Home';
import { useThemeMode } from '@/context/ThemeContext';

const navItems = [
  { text: 'Dashboard', path: '/dashboard', icon: <HomeIcon fontSize='inherit' /> },
  { text: 'Courses', path: '/course', icon: <SchoolIcon fontSize='inherit' /> },
  { text: 'Create', path: '/create', icon: <DriveFileRenameOutlineRoundedIcon fontSize='inherit' /> },
];


interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const appBarHeight = 72;

  const [user, setUser] = useState<User | null>(null);
  const { mode, setMode, resolvedMode } = useThemeMode();

  useEffect(() => {
    const userChange = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => userChange();
  }, []);

  const signIn = async () => {
    try {
      router.push('/login');
    } catch (error) {
      console.error('Sign-up error:', error);
    }
  };

  const signUp = async () => {
    try {
      router.push('/create-account');
    } catch (error) {
      console.error('Sign-up error:', error);
    }
  };


  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'light' | 'dark' | 'system' | null
  ) => {
    if (newMode !== null) {
      setMode(newMode);
      handleMenuClose();
    }
  };

  const handleHistoryView = () => {
    router.push('/history')
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top Bar */}
      <AppBar
      position="fixed"
      sx={{
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 'none',
        height: `${appBarHeight}px`,
      }}
    >
      <Toolbar
        sx={{
          minHeight: `${appBarHeight}px !important`,
          height: `${appBarHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Logo */}
        <Box display="flex" alignItems="center" sx={{ flexShrink: 0 }}>
          <Button
            onClick={() => router.push('/')}
            disableRipple
            disableElevation
            sx={{
              p: 0,
              minWidth: 0,
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'transparent',
              },
              '&:active': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  fontSize: '1.5rem',
                  textTransform: 'none',
                }}
              >
                LearnBridge
              </Typography>
            </Box>
          </Button>
        </Box>

        {/* Right: Nav and Auth Info */}
        {user ? (
          <>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ ml: 'auto', mr: 3, height: '100%' }}
            >
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.path);

                return (
                  <Button 
                    onClick={() => router.push(item.path)}
                    key={item.text}
                    disableElevation
                    disableRipple
                    sx={{
                      textTransform: 'none',
                      bgcolor: 'transparent',
                      color: isActive ? theme.palette.grey[900] : theme.palette.grey[500],
                      borderRadius: 1,
                      px: '0.75rem',
                      height: 42,
                      fontWeight: 500,
                      fontSize: '1.2rem',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.grey[300], 0.3),
                        color: theme.palette.grey[900]
                      },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.7rem',
                        mr: 0.5,
                      }}
                    >
                      {item.icon}
                    </Box> {item.text}
                  </Button>
                )
                })
              }
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" marginRight={2}>
              <IconButton
                disableRipple
                sx={{ p: 0 }}
                onClick={handleMenuOpen}
              >
              <Image
                  src={user.photoURL ?? '/default-avatar.png'}
                  alt="User profile"
                  width={36}
                  height={36}
                  style={{ borderRadius: '50%' }}
                />
              </IconButton>

              <Menu
                disableScrollLock
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}  // ← will close on click-away or Esc
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    bgcolor: theme.palette.background.paper,
                    mt: 1,
                    borderRadius: 1.5,
                    px: 1,
                    minWidth: 140,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 'none',
                  },
                }}
              >
                <Stack spacing={0.2}>
                  <MenuItem
                    disableRipple
                    onClick={() => {
                      router.push('/history');
                      handleMenuClose();
                    }}
                    sx={{ borderRadius: 1, fontWeight: 500, fontSize: '1.1rem' }}
                  >
                    <HistoryIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> History
                  </MenuItem>
                  <MenuItem
                    disableRipple
                    onClick={() => {
                      logOut();
                      handleMenuClose();
                    }}
                    sx={{ borderRadius: 1, fontWeight: 500, fontSize: '1.1rem' }}
                  >
                    <LogoutIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> Log out
                  </MenuItem>
                </Stack>

                <Divider sx={{ my: 1, mx: -1 }} />

                <Box>
                  <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={handleModeChange}
                    fullWidth
                    size="small"
                    sx={{
                      borderRadius: 1,
                      backgroundColor: 'background.default',
                      overflow: 'hidden',
                      button: { flex: 1, px: 0.5, py: 0.5, border: 'none', height: '36px' },
                    }}
                  >
                    <ToggleButton disableRipple value="light">
                      <LightModeIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton disableRipple value="dark">
                      <DarkModeIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton disableRipple value="system">
                      <MonitorIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Menu>
            </Stack>
          </>
        ) : (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ ml: 'auto', mr: 3, height: '100%' }}
          >
            <Button 
              onClick={signIn}
              disableElevation
              disableRipple
              sx={{
                textTransform: 'none',
                bgcolor: 'transparent',
                color: theme.palette.grey[500],
                borderRadius: 2,
                px: '0.75rem',
                height: 42,
                fontWeight: 500,
                fontSize: '1.2rem',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.grey[300], 0.3),
                  color: theme.palette.grey[900]
                },
              }}
            >
              Log In
            </Button>
            <Button 
              onClick={signUp}
              disableElevation
              disableRipple
              sx={{
                textTransform: 'none',
                bgcolor: 'transparent',
                color: theme.palette.grey[500],
                borderRadius: 2,
                px: '0.75rem',
                height: 42,
                fontWeight: 500,
                fontSize: '1.2rem',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.grey[300], 0.3),
                  color: theme.palette.grey[900]
                },
              }}
            >
              Sign Up
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: `calc(100vh - ${appBarHeight}px)`,
          width: '100%',
          marginTop: `${appBarHeight}px`, 
        }}
      >
        {children}
      </Box>
    </Box>
  );
}