'use client';

import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { useEffect } from 'react';
import { RightChatDrawer } from '@/components';

export default function LandingPage() {

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>

      <Box
        sx={{
          textAlign: 'center',
          mb: 6,
          color: 'text.primary',
        }}
      >
        <Typography
          variant="h1"
          fontWeight={800}
          sx={{
            letterSpacing: '-0.05em',
            mb: 2,
            fontFamily: `'hurme_no2-webfont', sans-serif`,
          }}
        >
          LearnBridge
        </Typography>
        <Typography
          variant="h5"
          color="text.primary"
          sx={{ maxWidth: 600, mx: 'auto', mb: 4, fontWeight: 500 }}
        >
          Bridging the educational gap with AI
        </Typography>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* Cards Section */}
      <Box
        id="details"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 4,
        }}
      >
        <InfoCard title="Purpose" color="primary.main">
          LearnBridge empowers anyone—regardless of income—to access quality education. By using AI to generate complete, structured courses, we provide an affordable way for learners to broaden their knowledge and grow independently.
        </InfoCard>

        <InfoCard title="Inspiration" color="primary.main">
          Traditional learning platforms can be expensive or time-consuming to build from scratch. We created LearnBridge to automate the creation of well-structured courses, making self-education more accessible to everyone.
        </InfoCard>

        <InfoCard title="What It Does" color="primary.main">
          Just enter a course title and a team of AI agents work together to generate a full course with multiple modules and lessons. Lessons come in diverse formats, including in-depth readings, tests, and YouTube video guides. A built-in assistant can also answer questions using the course content.
        </InfoCard>

        <InfoCard title="What's Next" color="primary.main">
          We're building features like exporting courses, personalized progress tracking, and better assistant reasoning across lesson types. LearnBridge will soon support collaborative learning and become a full-featured, AI-powered education platform for everyone.
        </InfoCard>
      </Box>
    </Container>
  );
}

function InfoCard({ title, children, color }) {
  return (
    <Card
      elevation={6}
      sx={{
        borderRadius: 3,
        bgcolor: 'background.light',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
        borderTop: `4px solid ${color}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.3)',

        },
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          fontWeight={700}
          color={color}
          gutterBottom
          sx={{ fontFamily: `'hurme_no2-webfont', sans-serif` }}
        >
          {title}
        </Typography>
        <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.6 }}>
          {children}
        </Typography>
      </CardContent>
    </Card>
  );
}
