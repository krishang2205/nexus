import React from 'react';
import { Box, Typography, Container, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowOutward } from '@mui/icons-material';

const Hero = ({ onStartTrial }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        pt: { xs: 16, md: 20 },
        pb: { xs: 8, md: 12 },
        zIndex: 1,
        minHeight: { xs: '78vh', md: '74vh' },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Subtle dot-grid background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(var(--bg-border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.15,
          zIndex: -1,
        }}
      />

      {/* Bottom fade */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '300px',
          background: 'linear-gradient(to top, var(--bg-dark), transparent)',
          zIndex: -1,
        }}
      />

      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', maxWidth: '760px', mx: 'auto' }}>
          {/* Eyebrow */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Typography
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--text-secondary)',
                mb: 3,
                fontWeight: 600,
              }}
            >
              Nexus Command Layer
            </Typography>
          </Box>

          {/* Main Headline */}
          <Typography
            component={motion.h1}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.6rem', md: '3.2rem' },
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              mb: 3,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Run smarter meetings.
            <br />
            Convert conversations into <span style={{ color: 'var(--text-muted)' }}>execution.</span>
          </Typography>

          {/* Subtitle */}
          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            sx={{
              fontSize: { xs: '0.98rem', md: '1.05rem' },
              maxWidth: 640,
              mx: 'auto',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              mb: 4,
              fontWeight: 400,
            }}
          >
            Nexus captures decisions, tasks, risks, and highlights from your live meeting stream. Insights, score, and summaries are generated from the current session data.
          </Typography>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Box
              component="button"
              className="btn-premium"
              onClick={onStartTrial}
              sx={{ py: 1.6, px: 4, fontSize: '0.95rem' }}
            >
              Open Dashboard <ArrowOutward sx={{ ml: 1, fontSize: '1.2rem' }} />
            </Box>

            <Box
              component="button"
              className="btn-premium-outline"
              onClick={() => {
                document.getElementById('product-preview')?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{ py: 1.6, px: 4, fontSize: '0.95rem' }}
            >
              View Capability States
            </Box>
          </Stack>

          {/* Trust strip */}
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            sx={{
              mt: 5,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: { xs: 2, md: 4 },
            }}
          >
            {[
              'Action Center',
              'Productivity Score',
              'Smart Highlights',
            ].map((item) => (
              <Stack key={item} direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-muted)',
                  }}
                />
                <Typography
                  sx={{
                    color: 'var(--text-muted)',
                    fontSize: '0.76rem',
                    fontWeight: 500,
                  }}
                >
                  {item}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
