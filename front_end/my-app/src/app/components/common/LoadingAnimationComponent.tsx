import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme, Box } from '@mui/material'

export default function LoadingAnimationComponent() {
  const theme = useTheme();

  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.primary.main} />
            <stop offset="100%" stopColor={theme.palette.secondary.main} />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} size={'5rem'} />
    </React.Fragment>
  );
}
