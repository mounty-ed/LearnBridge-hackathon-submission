import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const logOut = async () => {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
