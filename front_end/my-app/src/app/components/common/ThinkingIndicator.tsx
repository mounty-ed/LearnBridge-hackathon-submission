import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

export function ThinkingIndicator() {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    return () => clearInterval(iv);
  }, []);
  return (
    <Typography variant="body1" color="text.primary">
      Thinking{'.'.repeat(dots)}
    </Typography>
  );
}
