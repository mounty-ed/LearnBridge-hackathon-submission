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
    <Container maxWidth="md" sx={{ py: 4 }}>

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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          <Button variant="contained" color="primary" size="large" 
            onClick={() => {console.log(localStorage.getItem("themeMode"))}}>
            Get Started
          </Button>
          <Button variant="outlined" color="primary" size="large" href="#details">
            Discover More
          </Button>
        </Stack>
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
        <InfoCard title="Purpose" color="primary.dark">
          Our goal is to revolutionize how students prepare for exams by making practice tests and flashcards creation effortless and tailored. Save time, stay focused, and learn smarter.
        </InfoCard>

        <InfoCard title="Inspiration" color="primary.dark">
          Frustrated with manual and time-consuming study tools, we dreamed up Study Buddy — a tool that automates practice test creation, making exam prep smoother and more effective.
        </InfoCard>

        <InfoCard title="What It Does" color="primary.dark">
          Upload notes, paste links, or provide a topic prompt. Study Buddy uses AI-powered retrieval and content analysis to generate high-quality multiple-choice tests and flashcards—complete with references.
        </InfoCard>

        <InfoCard title="What’s Next" color="primary.dark">
          We're building features like interactive note-taking, spaced repetition learning modes, and a personalized dashboard for tracking your progress and history — making Study Buddy your ultimate study partner.
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
