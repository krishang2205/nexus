import React from 'react';
import { Box, Typography, Container, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import {
  GraphicEq,
  CheckCircle,
  TrendingUp,
  FiberManualRecord,
} from '@mui/icons-material';

const transcriptLines = [
  { speaker: 'Sarah', text: 'We should finalize the launch date by Friday.', tag: 'decision', tagColor: '#22c55e' },
  { speaker: 'Mike', text: 'What about the QA timeline — is that still realistic?', tag: 'question', tagColor: '#f59e0b' },
  { speaker: 'Sarah', text: 'If we miss that window, we risk delaying the entire Q2 roadmap.', tag: 'risk', tagColor: '#ef4444' },
  { speaker: 'Alex', text: 'I can own the QA sprint and report back by Wednesday.', tag: 'action', tagColor: '#6366f1' },
];

const actionItems = [
  { text: 'Finalize launch date', assignee: 'Sarah', due: 'Friday' },
  { text: 'Complete QA sprint', assignee: 'Alex', due: 'Wednesday' },
];

const ProductPreview = () => {
  return (
    <Box
      sx={{
        py: { xs: 12, md: 20 },
        backgroundColor: 'var(--bg-dark)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background grid */}
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
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
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
            See It In Action
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
            Intelligence at a{' '}
            <span style={{ color: 'var(--text-muted)' }}>glance.</span>
          </Typography>
          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            sx={{
              color: 'var(--text-secondary)',
              fontSize: '1.15rem',
              mt: 2,
              maxWidth: 560,
              mx: 'auto',
            }}
          >
            Your meetings become structured knowledge — every word tagged, every action tracked.
          </Typography>
        </Box>

        {/* Product preview card */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          sx={{
            maxWidth: 900,
            mx: 'auto',
            borderRadius: 'var(--card-radius)',
            border: '1px solid var(--bg-border)',
            backgroundColor: 'var(--bg-elevated)',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Window header bar */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: '1px solid var(--bg-border)',
              backgroundColor: 'var(--bg-dark)',
            }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e' }} />
            <Typography
              sx={{
                ml: 2,
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              Nexus Meeting Intelligence — Product Launch Sync
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FiberManualRecord sx={{ fontSize: 8, color: '#22c55e' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 600 }}>
                LIVE
              </Typography>
            </Box>
          </Box>

          {/* Content area */}
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ minHeight: 350 }}>
            {/* Transcript panel */}
            <Box
              sx={{
                flex: 1.2,
                p: { xs: 2, md: 3 },
                borderRight: { md: '1px solid var(--bg-border)' },
                borderBottom: { xs: '1px solid var(--bg-border)', md: 'none' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                <GraphicEq sx={{ fontSize: 18, color: 'var(--text-muted)' }} />
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Live Transcript
                </Typography>
              </Stack>

              <Stack spacing={2}>
                {transcriptLines.map((line, i) => (
                  <Box
                    key={i}
                    component={motion.div}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.12 }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {line.speaker}
                      </Typography>
                      <Chip
                        label={line.tag}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          backgroundColor: `${line.tagColor}18`,
                          color: line.tagColor,
                          border: `1px solid ${line.tagColor}30`,
                        }}
                      />
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {line.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Sidebar — Action Items & Score */}
            <Box
              sx={{
                flex: 0.8,
                p: { xs: 2, md: 3 },
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              {/* Action Items */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <CheckCircle sx={{ fontSize: 18, color: '#6366f1' }} />
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Action Items
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {actionItems.map((item, i) => (
                    <Box
                      key={i}
                      component={motion.div}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.15 }}
                      sx={{
                        p: 1.5,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-dark)',
                        border: '1px solid var(--bg-border)',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          mb: 0.5,
                        }}
                      >
                        {item.text}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        → {item.assignee} · Due {item.due}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Productivity Score */}
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
                sx={{
                  p: 2,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--bg-border)',
                  textAlign: 'center',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} justifyContent="center" sx={{ mb: 1.5 }}>
                  <TrendingUp sx={{ fontSize: 18, color: '#22c55e' }} />
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Meeting Score
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    color: '#22c55e',
                    lineHeight: 1,
                    mb: 0.5,
                  }}
                >
                  87
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  High participation · Clear outcomes
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductPreview;
