import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InsightsIcon from '@mui/icons-material/Insights';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppTheme } from '../theme/AppThemeProvider';

export default function WatermelonPreviewCard({ onOpenMeeting, recentMeetingsCount = 0 }) {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isLocalHost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const apiBase = isLocalHost
    ? (import.meta.env.VITE_LOCAL_API_URL || import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000')
    : (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/api/status`);
      const contentType = response.headers.get('content-type') || '';
      const rawBody = await response.text();
      const isJson = contentType.includes('application/json');

      if (!isJson) {
        throw new Error('API did not return JSON. Check VITE_API_URL / VITE_LOCAL_API_URL.');
      }

      let data;
      try {
        data = JSON.parse(rawBody);
      } catch {
        throw new Error('Invalid JSON from /api/status.');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load server status');
      }

      setServerStatus(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load server status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [apiBase]);

  const liveData = useMemo(() => {
    const activeRooms = Number(serverStatus?.activeRooms || 0);
    const activeUsers = Number(serverStatus?.activeUsers || 0);
    const recentMeetings = Number(recentMeetingsCount || 0);
    const totalEvents = activeRooms + activeUsers + recentMeetings;
    const progress = totalEvents > 0 ? Math.round((activeUsers / totalEvents) * 100) : 0;

    return {
      activeRooms,
      activeUsers,
      recentMeetings,
      totalEvents,
      progress,
      breakdown: [
        { label: 'Active Rooms', amount: activeRooms, color: '#2563EB' },
        { label: 'Active Users', amount: activeUsers, color: '#7C3AED' },
        { label: 'Recent Meetings', amount: recentMeetings, color: '#D97706' },
      ],
    };
  }, [serverStatus, recentMeetingsCount]);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2.2, sm: 2.8 },
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          backgroundColor: isDark ? '#0f151f' : '#ffffff',
          color: 'var(--text-primary)',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Chip
            icon={<AccountBalanceWalletIcon />}
            label="Watermelon Metrics Card"
            sx={{
              color: isDark ? '#dbe8ff' : '#24425d',
              backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,109,255,0.08)',
            }}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={fetchStatus}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Stack>

        <Typography sx={{ fontSize: { xs: 34, sm: 48 }, fontWeight: 700, lineHeight: 1 }}>
          {loading ? '...' : liveData.totalEvents.toLocaleString()}
        </Typography>
        <Typography sx={{ color: 'var(--text-secondary)', mt: 1 }}>Live system activity snapshot</Typography>

        {error ? (
          <Typography sx={{ mt: 1, fontSize: 12, color: 'var(--color-error)' }}>{error}</Typography>
        ) : null}

        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={liveData.progress}
            sx={{
              height: 8,
              borderRadius: 0,
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#edf3fb',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #9ca3af, #1f2937)',
              },
            }}
          />
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.4, mb: 2.2 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>Active Users</Typography>
            <Typography sx={{ fontWeight: 600 }}>{liveData.activeUsers.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>Active Rooms</Typography>
            <Typography sx={{ fontWeight: 600 }}>{liveData.activeRooms.toLocaleString()}</Typography>
          </Box>
        </Stack>

        <Typography sx={{ fontSize: 13, color: 'var(--text-muted)', mb: 1.2 }}>Live breakdown</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.2, mb: 2 }}>
          {liveData.breakdown.map((item) => (
            <Box key={item.label}>
              <Box sx={{ height: 6, borderRadius: 1, mb: 0.8, background: item.color }} />
              <Typography sx={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</Typography>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{item.amount.toLocaleString()}</Typography>
            </Box>
          ))}
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
          <Button
            variant="outlined"
            onClick={() => setDetailsOpen(true)}
            sx={{ textTransform: 'none', borderRadius: '12px', fontWeight: 600 }}
          >
            View Details
          </Button>
          <Button
            variant="contained"
            onClick={onOpenMeeting}
            sx={{ textTransform: 'none', borderRadius: '12px', fontWeight: 700 }}
          >
            Start Meeting
          </Button>
        </Stack>
      </Paper>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InsightsIcon fontSize="small" /> Live Nexus Metrics
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'var(--text-secondary)', mb: 2 }}>
            Real-time values from your running backend and local meeting history.
          </Typography>
          {liveData.breakdown.map((item) => {
            const pct = liveData.totalEvents > 0 ? Math.round((item.amount / liveData.totalEvents) * 100) : 0;
            return (
              <Box key={item.label} sx={{ mb: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: 14 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)' }}>{pct}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 6,
                    borderRadius: 6,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ebf1f8',
                    '& .MuiLinearProgress-bar': { backgroundColor: item.color },
                  }}
                />
              </Box>
            );
          })}
          <Typography sx={{ mt: 1, fontSize: 12, color: 'var(--text-muted)' }}>
            Last updated: {serverStatus?.timestamp ? new Date(serverStatus.timestamp).toLocaleString() : 'N/A'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}