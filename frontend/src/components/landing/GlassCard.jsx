import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const GlassCard = ({ children, sx = {}, hover = true, ...props }) => {
  return (
    <Box
      component={motion.div}
      whileHover={hover ? { y: -3, transition: { duration: 0.3, ease: 'easeOut' } } : {}}
      sx={{
        ...sx,
        p: { xs: 4, md: 5 },
        borderRadius: 'var(--card-radius)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--bg-border)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          borderColor: hover ? 'var(--accent-muted)' : 'var(--bg-border)',
          boxShadow: hover ? '0 10px 40px var(--accent-glow)' : 'none',
        }
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default GlassCard;
