'use client';

import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '@/utils/createEmotionCache';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useThemeMode } from '@/context/ThemeContext';
import { lightTheme, darkTheme } from '@/theme';

const clientSideEmotionCache = createEmotionCache();

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const { resolvedMode } = useThemeMode();

  const appliedTheme = React.useMemo(
    () => (resolvedMode === 'dark' ? darkTheme : lightTheme),
    [resolvedMode]
  );


  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={appliedTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
