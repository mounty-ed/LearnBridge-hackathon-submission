'use client';

import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider, microsoftProvider, appleProvider } from '@/lib/firebase';

import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function LogInPage() {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createUserDoc(uid: string, email: string) {
    await setDoc(doc(db, 'users', uid), {
      email,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  }


  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('password', password);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserDoc(result.user.uid, result.user.email || '');
      console.log('Login success');
      router.push('/dashboard'); 
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('User not found.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDoc(result.user.uid, result.user.email || '');
      console.log('Google sign-in success');
      router.push('/dashboard'); 
    } catch (err) {
      console.error(err);
      setError('Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, microsoftProvider);
      await createUserDoc(result.user.uid, result.user.email || '');
      console.log('Microsoft sign-in success');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Microsoft sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, appleProvider);
      await createUserDoc(result.user.uid, result.user.email || '');
      console.log('Apple sign-in success');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Apple sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pt: 6,
        transform: 'translateY(-7%)',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 6,
          width: '100%',
          maxWidth: 450,
          borderRadius: 4,
          boxShadow: `0px 0px 48px ${alpha(theme.palette.grey[400], 0.4)}`,
        }}
      >
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="600" color="text.primary">
            Log In
          </Typography>
        </Box>

        {/* Use handleLogIn here instead of handleSignUp */}
        <Box component="form" noValidate autoComplete="on" onSubmit={handleLogIn}>
          <TextField
            fullWidth
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
              },
              '& fieldset': {
                borderColor: 'grey.400',
              },
              mb: '2px',
              height: 52,
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
              },
              '& fieldset': {
                borderColor: 'grey.400',
              },
              mb: 3,
              height: 52,
            }}
          />
          <Button
            disableRipple
            disableElevation
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              borderRadius: 999,
              height: 52,
              mb: 1,
              backgroundColor: 'primary.dark',
              '&:hover': {
                backgroundColor: theme.palette.primary[500],
              },
              '&:active': {
                backgroundColor: theme.palette.primary[400],
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Log In'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" variant="body2" align="center" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
          Don't have an account? <a href="/create-account">Sign up</a>
        </Typography>

        <Divider sx={{ my: 2.5 }}>OR</Divider>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            onClick={handleGoogleSignUp}
            startIcon={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GoogleIcon sx={{ fontSize: '1.5rem' }} />
              </Box>
            }
            disableRipple
            disableElevation
            fullWidth
            variant="outlined"
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontSize: '0.95rem',
              color: theme.palette.text.primary,
              borderRadius: 999,
              height: 52,
              backgroundColor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[300], 0.2),
              },
              '&:active': {
                backgroundColor: alpha(theme.palette.grey[400], 0.2),
              },
            }}
          >
            Log In with Google
          </Button>

          <Button
            onClick={handleMicrosoftSignUp}
            startIcon={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MicrosoftIcon sx={{ fontSize: '1.5rem' }} />
              </Box>
            }
            disableRipple
            disableElevation
            fullWidth
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontSize: '0.95rem',
              color: theme.palette.text.primary,
              borderRadius: 999,
              height: 52,
              backgroundColor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[300], 0.2),
              },
              '&:active': {
                backgroundColor: alpha(theme.palette.grey[400], 0.2),
              },
            }}
          >
            Log In with Microsoft
          </Button>

          <Button
            onClick={handleAppleSignUp}
            startIcon={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AppleIcon sx={{ fontSize: '1.5rem' }} />
              </Box>
            }
            disableElevation
            disableRipple
            fullWidth
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontSize: '0.95rem',
              color: theme.palette.text.primary,
              borderRadius: 999,
              height: 52,
              backgroundColor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[300], 0.2),
              },
              '&:active': {
                backgroundColor: alpha(theme.palette.grey[400], 0.2),
              },
            }}
          >
            Log In with Apple
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
