import React from 'react';
import { Box, Typography, Container, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { GraphicEq, Description, AutoAwesome, FileDownload, Assessment } from '@mui/icons-material';

const ProblemSolution = () => {
  const points = [
    {
      problem: "Live",
      desc: "Session metrics",
      icon: <GraphicEq sx={{ fontSize: 32, mb: 2, color: 'var(--text-muted)' }} />
    },
    {
      problem: "Source",
      desc: "Transcript + context",
      icon: <Description sx={{ fontSize: 32, mb: 2, color: 'var(--text-muted)' }} />
    },
    {
      problem: "Auto",
      desc: "AI extraction status",
      icon: <AutoAwesome sx={{ fontSize: 32, mb: 2, color: 'var(--text-muted)' }} />
    },
    {
      problem: "Export",
      desc: "Post-meeting report",
      icon: <FileDownload sx={{ fontSize: 32, mb: 2, color: 'var(--text-muted)' }} />
    }
  ];

  return (
    <Box sx={{ py: {xs: 12, md: 24}, color: 'var(--text-primary)', position: 'relative', width: '100%', backgroundColor: 'var(--bg-surface)' }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={10} alignItems="center">
          
          <Box sx={{ flex: 1, pr: { md: 8 } }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}>
               <Assessment sx={{ fontSize: 40, color: 'var(--text-secondary)', mb: 3 }} />
               <Typography variant="h2" sx={{ fontWeight: 800, mb: 4, fontSize: { xs: '2.5rem', md: '3.5rem' }, fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
                 Real-time <span style={{ color: 'var(--text-muted)' }}>Metrics.</span>
               </Typography>
               <Typography sx={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.6, maxWidth: 500 }}>
                 This page shows capability states. Real values are generated during active meetings.
               </Typography>
            </motion.div>
          </Box>
          
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
            {points.map((point, index) => (
              <Box 
                 key={index} 
                 component={motion.div} 
                 initial={{ opacity: 0, x: 30 }} 
                 whileInView={{ opacity: 1, x: 0 }} 
                 viewport={{ once: true }} 
                 transition={{ duration: 0.6, delay: index * 0.15 }}
                 sx={{ 
                   p: 4, 
                   borderRadius: 'var(--card-radius)', 
                   backgroundColor: 'var(--bg-dark)', 
                   border: '1px solid var(--bg-border)',
                   transition: 'all 0.3s ease',
                   '&:hover': {
                     borderColor: 'var(--accent-muted)',
                     transform: 'translateX(-5px)'
                   }
                 }}
              >
                {point.icon}
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontFamily: 'var(--font-heading)' }}>
                  {point.problem}
                </Typography>
                <Typography sx={{ color: 'var(--text-secondary)' }}>
                  {point.desc}
                </Typography>
              </Box>
            ))}
          </Box>

        </Stack>
      </Container>
    </Box>
  );
};

export default ProblemSolution;
