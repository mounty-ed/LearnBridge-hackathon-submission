import { useState, useRef, useEffect } from 'react'
import YouTube, { YouTubeProps } from 'react-youtube'
import { Container, Box, Typography } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles';

interface ContentProps {
  description: string;
  thumbnail: string;
  title: string;
  url: string;
  videoId: string;
}

interface VideoJsonProps {
  complete: boolean;
  title: string;
  type: string;
  content: ContentProps;
}

interface VideoPageProps {
  videoJson: VideoJsonProps;
  handleComplete: () => void;
}

export default function VideoPage({ videoJson, handleComplete }: VideoPageProps) {
  const theme = useTheme();

  const { videoId, title, description } = videoJson.content;
  const playerRef = useRef<any>(null);
  const [hasCalled, setHasCalled] = useState(false);

  const opts: YouTubeProps['opts'] = {
    width: '100%', height: '100%',
    playerVars: {
      autoplay: 1,
      enablejsapi: 1,
      origin: window.location.origin,
    },
  };

  const checkProgress = () => {
    const player = playerRef.current;
    if (!player || hasCalled) return;
    const current = player.getCurrentTime();
    const duration = player.getDuration();
    if (duration > 0 && current / duration >= 0.9) {
      setHasCalled(true);
      handleComplete();
    }
  };

  const onReady: YouTubeProps['onReady'] = (e) => {
    playerRef.current = e.target;
  };

  const onStateChange: YouTubeProps['onStateChange'] = (e) => {
    if (e.data === YouTube.PlayerState.PLAYING) {
      playerRef.current.__int = setInterval(checkProgress, 1000);
    } else {
      clearInterval(playerRef.current?.__int);
    }
  };

  useEffect(() => {
    return () => clearInterval(playerRef.current?.__int);
  }, []);

  return (
    <Container disableGutters maxWidth={false} sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <Box
        sx={{
          width: '100%',
          aspectRatio: '16 / 9',
          maxHeight: '720px',
          height: '100%',
          overflow: 'hidden',
          borderBottom: `2px solid ${theme.palette.divider}`
        }}
      >
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </Box>
      <Box sx={{ p: 4 }}>
        <Typography variant="body1" >
          {description}
        </Typography>
      </Box>
    </Container>
  );
}