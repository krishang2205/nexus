import React from 'react';
import { Box, Typography, Container, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ArrowOutward } from '@mui/icons-material';

const CTASection = ({ onGetStarted }) => {
  const navigate = useNavigate();

  return (
    <Box
      id="auth-section"
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'var(--bg-dark)',
        borderTop: '1px solid var(--bg-border)',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Signed Out — Show CTA + Auth */}
            <SignedOut>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '1.9rem', md: '2.5rem' },
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  lineHeight: 1.15,
                }}
              >
                Access the <span style={{ color: 'var(--text-muted)' }}>Nexus workspace</span>
              </Typography>

              <Typography
                sx={{
                  color: 'var(--text-secondary)',
                  fontSize: { xs: '0.96rem', md: '1rem' },
                  mb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                  lineHeight: 1.5,
                }}
              >
                Sign in to launch meetings, invite your team, and use AI meeting intelligence.
              </Typography>

              {/* Clerk SignIn */}
              <Box
                className="fade-in"
                sx={{
                  width: '100%',
                  maxWidth: 460,
                  mx: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  '& .cl-rootBox': { width: '100%' },
                  '& .cl-card': { width: '100%', maxWidth: '100%' },
                }}
              >
                <SignIn routing="hash" />
              </Box>
            </SignedOut>

            {/* Signed In — Show Dashboard CTA */}
            <SignedIn>
              {/* Main headline for authenticated users */}
              {/* <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '1.9rem', md: '2.5rem' },
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  lineHeight: 1.15,
                }}
              >
                Your command center{' '}
                <span style={{ color: 'var(--text-muted)' }}>awaits.</span>
              </Typography> */}

              {/* Subtitle describing available actions */}
              {/* <Typography
                sx={{
                  color: 'var(--text-secondary)',
                  fontSize: { xs: '0.96rem', md: '1rem' },
                  mb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                }}
              >
                Start a meeting, review intelligence, or set up your next AI-powered session.
              </Typography> */}

              {/* Primary action button container */}
              
            </SignedIn>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;
