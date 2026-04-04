import React from 'react';
import { Box, Typography, Container, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Insights,
  Sync,
  Download,
  FiberManualRecord,
  AutoAwesome,
  Summarize,
  Analytics,
  GraphicEq,
  Chat,
  AssignmentTurnedIn,
} from '@mui/icons-material';

const capabilityPills = [
  { label: 'Action Center', icon: <Insights sx={{ fontSize: 16 }} /> },
  { label: 'Productivity Score', icon: <Analytics sx={{ fontSize: 16 }} /> },
  { label: 'Smart Highlights', icon: <AutoAwesome sx={{ fontSize: 16 }} /> },
  { label: 'Live', icon: <FiberManualRecord sx={{ fontSize: 10, color: '#22c55e' }} /> },
];

const statusRows = [
  {
    label: 'Session metrics',
    value: 'Action Center + Productivity Score + Smart Highlights',
    icon: <Analytics sx={{ fontSize: 16 }} />,
  },
  {
    label: 'Source',
    value: 'Transcript + context',
    icon: <GraphicEq sx={{ fontSize: 16 }} />,
  },
  {
    label: 'AI extraction status',
    value: 'Auto',
    icon: <Sync sx={{ fontSize: 16 }} />,
  },
  {
    label: 'Export',
    value: 'Post-meeting report',
    icon: <Download sx={{ fontSize: 16 }} />,
  },
];

const capabilityCards = [
  {
    title: 'Live Transcript',
    description: 'Reliable speech-to-text with speaker separation and searchable history.',
    icon: <GraphicEq sx={{ fontSize: 20 }} />,
  },
  {
    title: 'Ask Nexus',
    description: 'Ask for decisions, blockers, and summaries directly from meeting context.',
    icon: <Chat sx={{ fontSize: 20 }} />,
  },
  {
    title: 'Decision Capture',
    description: 'Automatically detect owners, next steps, and deadlines in real time.',
    icon: <AssignmentTurnedIn sx={{ fontSize: 20 }} />,
  },
];

const ProductPreview = () => {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        backgroundColor: 'var(--bg-dark)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(var(--bg-border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.08,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
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
            Live Session Intelligence
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
              fontSize: { xs: '1.8rem', md: '2.5rem' },
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            Operations-grade <span style={{ color: 'var(--text-muted)' }}>meeting view.</span>
          </Typography>
          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            sx={{
              color: 'var(--text-secondary)',
              fontSize: { xs: '0.95rem', md: '1rem' },
              mt: 2,
              maxWidth: 620,
              mx: 'auto',
            }}
          >
            This page shows capability states. Real values are generated during active meetings.
          </Typography>
        </Box>

        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          sx={{
            maxWidth: 980,
            mx: 'auto',
            borderRadius: 'var(--card-radius)',
            border: '1px solid var(--bg-border)',
            backgroundColor: 'var(--bg-elevated)',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: '1px solid var(--bg-border)',
              backgroundColor: 'var(--bg-dark)',
            }}
          >
            <Summarize sx={{ fontSize: 18, color: 'var(--text-muted)' }} />
            <Typography
              sx={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Nexus Session Intelligence Console
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FiberManualRecord sx={{ fontSize: 8, color: '#22c55e' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 600 }}>
                LIVE
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ minHeight: 390 }}>
            <Box
              sx={{
                flex: 1.15,
                p: { xs: 2, md: 3 },
                borderRight: { md: '1px solid var(--bg-border)' },
                borderBottom: { xs: '1px solid var(--bg-border)', md: 'none' },
              }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                {capabilityPills.map((item, i) => (
                  <Chip
                    key={item.label}
                    component={motion.div}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }}
                    icon={item.icon}
                    label={item.label}
                    sx={{
                      height: 30,
                      borderRadius: '999px',
                      backgroundColor: 'var(--bg-dark)',
                      border: '1px solid var(--bg-border)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                    }}
                  />
                ))}
              </Stack>

              <Stack spacing={1.3}>
                {statusRows.map((row, i) => (
                  <Box
                    key={row.label}
                    component={motion.div}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.35 + i * 0.1 }}
                    sx={{
                      p: 1.5,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--bg-border)',
                      backgroundColor: 'var(--bg-dark)',
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.6 }}>
                      <Box sx={{ color: 'var(--text-muted)', display: 'grid', placeItems: 'center' }}>{row.icon}</Box>
                      <Typography
                        sx={{
                          fontSize: '0.73rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {row.label}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {row.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Typography sx={{ mt: 2, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                This page shows capability states. Real values are generated during active meetings.
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 0.85,
                p: { xs: 2, md: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {capabilityCards.map((item, i) => (
                <Box
                  key={item.title}
                  component={motion.div}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.45 + i * 0.12 }}
                  sx={{
                    p: 2,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--bg-border)',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{ color: 'var(--text-primary)', display: 'grid', placeItems: 'center' }}>{item.icon}</Box>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.title}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {item.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductPreview;
