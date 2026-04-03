import { IconButton, Tooltip } from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { useAppTheme } from '../theme/AppThemeProvider';

export default function ThemeToggle({ sx = {} }) {
  const { mode, toggleMode } = useAppTheme();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        onClick={toggleMode}
        aria-label="Toggle light and dark mode"
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface-elevated)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-soft)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            backgroundColor: 'var(--surface-hover)',
          },
          ...sx,
        }}
      >
        {isDark ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
