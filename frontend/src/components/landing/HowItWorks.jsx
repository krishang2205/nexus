import React from 'react';
import { Box, Typography, Container, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { Videocam, AutoAwesome, CheckCircleOutline } from '@mui/icons-material';

const steps = [
  {
    number: '01',
    title: 'Meet',
    headline: 'Start or join in seconds',
    description: 'Launch an instant room or schedule ahead. One click, no downloads, no friction.',
    icon: <Videocam sx={{ fontSize: 28 }} />,
  },
  {
    number: '02',
    title: 'Capture',
    headline: 'AI listens and understands',
    description: 'Real-time transcription with smart tagging — decisions, questions, and risks are flagged automatically.',
    icon: <AutoAwesome sx={{ fontSize: 28 }} />,
  },
  {
    number: '03',
    title: 'Act',
    headline: 'Turn talk into outcomes',
    description: 'Get structured action items, assignee suggestions, productivity scores, and a fully searchable meeting history.',
    icon: <CheckCircleOutline sx={{ fontSize: 28 }} />,
  },
];

const HowItWorks = () => {
  return (
    <Box
      sx={{
        py: { xs: 12, md: 20 },
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--bg-border)',
        borderBottom: '1px solid var(--bg-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            sx={{
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              mb: 2,
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            How It Works
          </Typography>
          <Typography
            component={motion.h2}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            Three steps to{' '}
            <span style={{ color: 'var(--text-muted)' }}>clarity.</span>
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 0 }}
          alignItems="stretch"
          sx={{ position: 'relative' }}
        >
          {/* Connecting line (desktop only) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              top: '60px',
              left: 'calc(16.67% + 20px)',
              right: 'calc(16.67% + 20px)',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, var(--bg-border), var(--bg-border), transparent)',
              zIndex: 0,
            }}
          />

          {steps.map((step, index) => (
            <Box
              key={step.number}
              component={motion.div}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              sx={{
                flex: 1,
                textAlign: 'center',
                px: { xs: 2, md: 4 },
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Step number badge */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  backgroundColor: 'var(--bg-dark)',
                  border: '2px solid var(--bg-border)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    borderColor: 'var(--text-muted)',
                    transform: 'scale(1.08)',
                  },
                }}
              >
                {step.icon}
              </Box>

              {/* Step number */}
              <Typography
                sx={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  color: 'var(--text-muted)',
                  mb: 1,
                  textTransform: 'uppercase',
                }}
              >
                Step {step.number}
              </Typography>

              {/* Title */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)',
                  mb: 1,
                  fontSize: { xs: '1.75rem', md: '2rem' },
                }}
              >
                {step.title}
              </Typography>

              {/* Headline */}
              <Typography
                sx={{
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  mb: 1.5,
                  fontSize: '1.05rem',
                }}
              >
                {step.headline}
              </Typography>

              {/* Description */}
              <Typography
                sx={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  maxWidth: 320,
                  mx: 'auto',
                }}
              >
                {step.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default HowItWorks;
