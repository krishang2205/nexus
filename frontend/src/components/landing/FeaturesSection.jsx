import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Videocam,
  Chat,
  Security,
} from '@mui/icons-material';
import GlassCard from './GlassCard';

const features = [
  {
    title: 'Live Transcript',
    description: 'Reliable speech-to-text with speaker separation and searchable history.',
    icon: <Videocam sx={{ fontSize: 26 }} />,
  },
  {
    title: 'Ask Nexus',
    description: 'Ask for decisions, blockers, and summaries directly from meeting context.',
    icon: <Chat sx={{ fontSize: 26 }} />,
  },
  {
    title: 'Decision Capture',
    description: 'Automatically detect owners, next steps, and deadlines in real time.',
    icon: <Security sx={{ fontSize: 26 }} />,
  },
];

const FeaturesSection = () => {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        backgroundColor: 'var(--bg-dark)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
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
            Capabilities
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
              fontSize: { xs: '1.8rem', md: '2.4rem' },
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
            }}
          >
            Core{' '}
            <span style={{ color: 'var(--text-muted)' }}>capabilities.</span>
          </Typography>
        </Box>

        {/* Clean 3-column grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: { xs: 2, md: 3 },
          }}
        >
          {features.map((feature, index) => (
            <GlassCard
              key={feature.title}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-dark)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--bg-border)',
                  mb: 3,
                }}
              >
                {feature.icon}
              </Box>

              {/* Content */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                sx={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                {feature.description}
              </Typography>
            </GlassCard>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
