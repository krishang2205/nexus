import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useTheme } from '@mui/material/styles';
import {
  useMediaQuery, Box, Avatar, Typography, Paper, Button,
  Alert, Snackbar, Grid, TextField, IconButton, Tooltip,
  Card, CardContent, Divider, Chip, CircularProgress, List, ListItem,
  Container, Dialog, DialogTitle, DialogContent, DialogActions, Menu, MenuItem,
  ListItemIcon, ListItemText, Fade, Tab, Tabs, ButtonGroup, Collapse, Stack
} from '@mui/material';
import { motion } from 'framer-motion';

// Import icons
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import ShareIcon from '@mui/icons-material/Share';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { ArrowOutward } from '@mui/icons-material';

// Import custom components
import ShareDialog from './components/ShareDialog';
import ThemeToggle from './components/ThemeToggle';
import MeetingCard from './components/watermelon-ui/MeetingCard';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // States
  const [displayName, setDisplayName] = useState(user?.fullName || user?.username || '');
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [meetingId, setMeetingId] = useState('');
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sharing states
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingType, setMeetingType] = useState('instant');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDuration, setScheduleDuration] = useState('60');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [isMeetingCreated, setIsMeetingCreated] = useState(false);
  const [briefTitle, setBriefTitle] = useState('');
  const [briefGoal, setBriefGoal] = useState('');
  const [briefContext, setBriefContext] = useState('');
  const [isBriefLoading, setIsBriefLoading] = useState(false);
  const [briefDialogOpen, setBriefDialogOpen] = useState(false);
  const [meetingBrief, setMeetingBrief] = useState(null);
  const navigate = useNavigate();

  const liveMeetingPreview = useMemo(() => {
    const now = new Date();
    const formattedNowTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const participantMap = new Map();
    [displayName, user?.firstName, user?.username]
      .filter(Boolean)
      .map(name => name.trim())
      .filter(Boolean)
      .forEach((name) => {
        const key = name.toLowerCase();
        if (!participantMap.has(key)) {
          participantMap.set(key, {
            name,
            avatar: user?.imageUrl || `https://i.pravatar.cc/100?img=${(participantMap.size % 70) + 1}`,
          });
        }
      });

    const participants = Array.from(participantMap.values());

    return {
      title: scheduleTitle || briefTitle || (meetingType === 'scheduled' ? 'Scheduled Nexus Meeting' : 'Instant Nexus Meeting'),
      date: scheduleDate || now.toLocaleDateString(),
      time: scheduleTime || formattedNowTime,
      duration: `${scheduleDuration || '60'} min`,
      meetingLink: meetingId ? getMeetingLink(meetingId) : 'Generate meeting ID to create live link',
      notification: meetingType === 'scheduled' ? '15 minutes before' : 'At meeting start',
      participants: participants.length > 0 ? participants : [{ name: 'Host', avatar: 'https://i.pravatar.cc/100?img=1' }],
      description:
        briefGoal ||
        briefContext ||
        'Live preview updates as you set title, schedule, duration, and meeting link.',
    };
  }, [displayName, user, scheduleTitle, briefTitle, meetingType, scheduleDate, scheduleTime, scheduleDuration, meetingId, briefGoal, briefContext]);

  // Scroll listener for header blur
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('nexus_displayName');
    const savedMic = localStorage.getItem('nexus_micPreference');
    const savedVideo = localStorage.getItem('nexus_videoPreference');
    const savedRecentMeetings = localStorage.getItem('nexus_recentMeetings');

    if (savedName) setDisplayName(savedName);
    if (savedMic !== null) setMicOn(savedMic === 'true');
    if (savedVideo !== null) setVideoOn(savedVideo === 'true');

    if (savedRecentMeetings) {
      try {
        const meetings = JSON.parse(savedRecentMeetings);
        setRecentMeetings(meetings.slice(0, 5));
      } catch (e) {
        console.error('Error loading recent meetings', e);
      }
    }

    const timer = setTimeout(() => {
      document.querySelector('.dashboard-container')?.classList.add('visible');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('nexus_displayName', displayName);
    localStorage.setItem('nexus_micPreference', micOn.toString());
    localStorage.setItem('nexus_videoPreference', videoOn.toString());
  }, [displayName, micOn, videoOn]);

  // Generate a secure meeting ID
  const generateMeetingId = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/generate-meeting-id`);
      if (!response.ok) throw new Error('Failed to generate meeting ID');
      const data = await response.json();
      setIsGenerating(false);
      return data.meetingId;
    } catch (error) {
      setIsGenerating(false);
      console.error('Error generating meeting ID:', error);
      const array = new Uint32Array(4);
      window.crypto.getRandomValues(array);
      return Array.from(array, dec => dec.toString(36)).join('').slice(0, 8);
    }
  };

  // Join or create a meeting
  const handleJoinMeeting = async () => {
    setIsJoining(true);
    let id = meetingId;
    let usedFallback = false;
    if (!id) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000'}/api/generate-meeting-id`);
        if (!response.ok) throw new Error('Failed to generate meeting ID');
        const data = await response.json();
        id = data.meetingId;
        setMeetingId(id);
      } catch (err) {
        const array = new Uint32Array(4);
        window.crypto.getRandomValues(array);
        id = Array.from(array, dec => dec.toString(36)).join('').slice(0, 8);
        setMeetingId(id);
        usedFallback = true;
      }
    }

    try {
      sessionStorage.setItem('nexus_meeting_info', JSON.stringify({
        meetingId: id,
        username: displayName,
        micEnabled: micOn,
        videoEnabled: videoOn
      }));
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(`/meet/${id}`);
      if (usedFallback) {
        setSnackbar({ open: true, message: 'Warning: Server unavailable, using local meeting ID.', severity: 'warning' });
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      setSnackbar({ open: true, message: 'Error joining meeting. Please try again.', severity: 'error' });
      setIsJoining(false);
    }
  };

  function getMeetingLink(id) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/meet/${id}`;
  }

  const copyMeetingId = (id) => {
    navigator.clipboard.writeText(id);
    setSnackbar({ open: true, message: 'Meeting ID copied to clipboard', severity: 'success' });
  };

  const copyMeetingLink = (id) => {
    const link = getMeetingLink(id);
    navigator.clipboard.writeText(link);
    setSnackbar({ open: true, message: 'Meeting link copied to clipboard', severity: 'success' });
  };

  const joinRecentMeeting = (id) => {
    setMeetingId(id);
    handleJoinMeeting();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } catch (e) {
      return 'recently';
    }
  };

  const openShareDialog = async (id) => {
    if (!id) {
      setIsGenerating(true);
      try {
        id = await generateMeetingId();
      } catch (err) {
        console.error('Error generating meeting ID for sharing', err);
        const array = new Uint32Array(4);
        window.crypto.getRandomValues(array);
        id = Array.from(array, dec => dec.toString(36)).join('').slice(0, 8);
      }
      setIsGenerating(false);
    }
    setMeetingId(id);
    setMeetingLink(getMeetingLink(id));
    setIsMeetingCreated(true);
    setShareDialogOpen(true);
  };

  const handleShareMenuOpen = (event) => {
    setShareMenuAnchor(event.currentTarget);
  };

  const handleShareMenuClose = () => {
    setShareMenuAnchor(null);
  };

  const createInstantMeeting = async () => {
    setMeetingType('instant');
    setScheduleTitle('Instant Meeting');
    await openShareDialog();
  };

  const createScheduledMeeting = () => {
    setMeetingType('scheduled');
    setShowScheduleOptions(true);
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1);
    nextHour.setMinutes(0);
    const dateStr = nextHour.toISOString().split('T')[0];
    const timeStr = nextHour.toTimeString().split(':').slice(0, 2).join(':');
    setScheduleDate(dateStr);
    setScheduleTime(timeStr);
    setScheduleDuration('60');
    setScheduleTitle(`Meeting on ${new Date(dateStr + 'T' + timeStr).toLocaleDateString()}`);
  };

  const confirmScheduledMeeting = async () => {
    await openShareDialog();
  };

  const shareViaPlatform = (platform) => {
    const title = encodeURIComponent(meetingType === 'instant' ? 'Join my Nexus Meeting' : scheduleTitle);
    const text = encodeURIComponent(
      meetingType === 'instant'
        ? `Join my Nexus meeting now: ${meetingLink}`
        : `Join my scheduled Nexus meeting "${scheduleTitle}" on ${new Date(scheduleDate + 'T' + scheduleTime).toLocaleString()}: ${meetingLink}`
    );
    let url = '';
    switch (platform) {
      case 'whatsapp': url = `https://wa.me/?text=${text}`; break;
      case 'email':
        const subject = encodeURIComponent(meetingType === 'instant' ? 'Join my Nexus Meeting' : scheduleTitle);
        url = `mailto:?subject=${subject}&body=${text}`;
        break;
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meetingLink)}&quote=${text}`; break;
      case 'twitter': url = `https://twitter.com/intent/tweet?text=${text}`; break;
      case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(meetingLink)}`; break;
      case 'copy': copyMeetingLink(meetingId); return;
    }
    if (url) window.open(url, '_blank');
  };

  const generateAiBrief = async () => {
    if (!briefTitle.trim() && !briefGoal.trim()) {
      setSnackbar({ open: true, message: 'Add a meeting title or goal before generating an AI brief.', severity: 'warning' });
      return;
    }
    try {
      setIsBriefLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000'}/api/ai-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: briefTitle, goal: briefGoal, context: briefContext })
      });
      if (!response.ok) throw new Error(`Brief API failed: ${response.status}`);
      const payload = await response.json();
      setMeetingBrief(payload);
      setBriefDialogOpen(true);
      setSnackbar({ open: true, message: 'AI pre-meeting brief generated.', severity: 'success' });
    } catch (error) {
      console.error('Failed to generate AI brief:', error);
      setSnackbar({ open: true, message: 'Unable to generate AI brief right now.', severity: 'error' });
    } finally {
      setIsBriefLoading(false);
    }
  };

  // ── Shared text field style ───────────────────────────────
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-primary)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--bg-border)',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--text-muted)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--text-secondary)',
        borderWidth: '1px',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-primary)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: 'var(--text-secondary)',
    },
  };

  // ── Feature items for the command center ──────────────────
  const features = [
    { title: 'AI Action Center', description: 'Auto-detect tasks with assignee and deadline hints' },
    { title: 'Smart Highlights', description: 'Tag transcript lines as decisions, questions, and risks' },
    { title: 'Ask Anything', description: 'Natural-language Q&A on your meeting transcript' },
    { title: 'Productivity Score', description: 'Meeting quality score with participation and action metrics' },
  ];

  return (
    <Box
      className="dashboard-container"
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg-dark)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        opacity: 0,
        transition: 'opacity 0.8s ease',
        overflow: 'auto',
        position: 'relative',
        '&.visible': { opacity: 1 },
      }}
    >
      {/* Dot-grid background */}
      <Box className="dashboard-dot-grid" />

      {/* ─── Header ─── */}
      <Box
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        sx={{
          py: { xs: 1.5, md: 2 },
          px: { xs: 2, md: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: scrolled ? '1px solid var(--bg-border)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          backgroundColor: scrolled ? 'var(--bg-dark)' : 'transparent',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--bg-dark)' }} />
          </Box>
          <Typography sx={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: '1.25rem', letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            Nexus Meet AI
          </Typography>
        </Box>

        {/* Right side controls */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ThemeToggle />
          <Typography sx={{
            color: 'var(--text-secondary)',
            display: { xs: 'none', sm: 'block' },
            fontWeight: 500, fontSize: '0.9rem',
          }}>
            {user?.fullName || user?.username || displayName || 'Guest'}
          </Typography>
          <Tooltip title="Sign out">
            <IconButton
              onClick={() => signOut().then(() => navigate('/')).catch(error => {
                console.error('Error signing out:', error);
                setSnackbar({ open: true, message: 'Failed to sign out.', severity: 'error' });
              })}
              sx={{
                color: 'var(--text-muted)',
                '&:hover': { color: 'var(--text-primary)', backgroundColor: 'var(--accent-glow)' },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {user?.imageUrl ? (
            <Avatar src={user.imageUrl} sx={{ width: 36, height: 36 }} />
          ) : (
            <Avatar sx={{
              width: 36, height: 36,
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--bg-border)',
              fontWeight: 700,
            }}>
              {(user?.firstName?.[0] || user?.username?.[0] || 'U')}
            </Avatar>
          )}
        </Stack>
      </Box>

      {/* ─── Main Content ─── */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            flex: 1,
            width: '100%',
            mx: 'auto',
            px: { xs: 1, sm: 2, md: 3 },
            py: { xs: 4, md: 6 },
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: { xs: 4, md: 6 },
          }}
        >
          {/* ══════════════ LEFT COLUMN ══════════════ */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Box
              component={motion.div}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              sx={{
                borderRadius: 'var(--card-radius)',
                p: { xs: 3, sm: 4, md: 5 },
                mb: 4,
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--bg-border)',
                backdropFilter: 'blur(24px)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  borderColor: 'var(--text-muted)',
                  boxShadow: '0 10px 40px var(--accent-glow)',
                },
              }}
            >
              {/* Subtle top accent line */}
              <Box sx={{
                position: 'absolute', top: 0, left: 40, right: 40, height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--text-muted), transparent)',
                opacity: 0.3,
              }} />

              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography className="section-label" sx={{ mb: 1.5 }}>
                  AI Meeting Intelligence
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800, fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)', mb: 1.5,
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                    letterSpacing: '-0.03em', lineHeight: 1.1,
                  }}
                >
                  {meetingId ? 'Join Meeting' : 'Start New Meeting'}
                </Typography>
                <Typography sx={{ color: 'var(--text-secondary)', mb: 2, fontSize: '1rem', maxWidth: 500, mx: 'auto' }}>
                  Launch your AI-powered room and convert every discussion into decisions and tasks.
                </Typography>

                {/* How would you like to meet? */}
                {!meetingId && !isMeetingCreated && (
                  <Box sx={{
                    mt: 3, mx: 'auto', maxWidth: '550px', p: 2,
                    bgcolor: 'var(--accent-glow)',
                    borderRadius: 'var(--card-radius)',
                    border: '1px solid var(--bg-border)',
                  }}>
                    <Typography sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                      fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.95rem',
                    }}>
                      <Box component="span" sx={{
                        width: 24, height: 24, borderRadius: '50%',
                        bgcolor: 'var(--accent-muted)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '14px', color: 'var(--text-primary)',
                      }}>?</Box>
                      How would you like to meet?
                    </Typography>
                  </Box>
                )}

                {/* Meeting type buttons */}
                {!meetingId && !isMeetingCreated && (
                  <Box sx={{
                    mt: 4, mb: 2,
                    display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 3 }, justifyContent: 'center', width: '100%',
                  }}>
                    <Box
                      component="button"
                      className="btn-premium"
                      onClick={createInstantMeeting}
                      sx={{
                        py: 1.8, px: 4, fontSize: '1rem',
                        display: 'flex', alignItems: 'center', gap: 1,
                        width: { xs: '100%', sm: 'auto' }, justifyContent: 'center',
                      }}
                    >
                      <FlashOnIcon sx={{ fontSize: 20 }} />
                      Instant Meeting
                    </Box>
                    <Box
                      component="button"
                      className="btn-premium-outline"
                      onClick={createScheduledMeeting}
                      sx={{
                        py: 1.8, px: 4, fontSize: '1rem',
                        display: 'flex', alignItems: 'center', gap: 1,
                        width: { xs: '100%', sm: 'auto' }, justifyContent: 'center',
                      }}
                    >
                      <EventAvailableIcon sx={{ fontSize: 20 }} />
                      Schedule Meeting
                    </Box>
                  </Box>
                )}
              </Box>

              {/* AI Pre-Meeting Brief */}
              <Box
                component={motion.div}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                sx={{
                  mb: 4, p: 3,
                  borderRadius: 'var(--card-radius)',
                  border: '1px solid var(--bg-border)',
                  bgcolor: 'var(--bg-surface)',
                }}
              >
                <Typography sx={{
                  mb: 1, fontWeight: 700, fontFamily: 'var(--font-heading)',
                  color: 'var(--text-primary)', fontSize: '1.05rem',
                }}>
                  AI Pre-Meeting Brief
                </Typography>
                <Typography sx={{ mb: 2.5, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Generate a focused agenda, key questions, and success criteria before you start.
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField fullWidth size="small" label="Meeting title" value={briefTitle}
                      onChange={(e) => setBriefTitle(e.target.value)} sx={textFieldSx} />
                    <TextField fullWidth size="small" label="Primary goal" value={briefGoal}
                      onChange={(e) => setBriefGoal(e.target.value)}
                      placeholder="Example: Finalize launch timeline" sx={textFieldSx} />
                  </Box>
                  <TextField fullWidth size="small" label="Optional context" value={briefContext}
                    onChange={(e) => setBriefContext(e.target.value)} sx={textFieldSx} />
                </Stack>
                <Box sx={{ mt: 2.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box component="button" className="btn-premium" onClick={generateAiBrief}
                    sx={{ py: 1.2, px: 3, fontSize: '0.875rem', opacity: isBriefLoading ? 0.6 : 1, pointerEvents: isBriefLoading ? 'none' : 'auto' }}>
                    {isBriefLoading ? 'Generating...' : 'Generate AI Brief'}
                  </Box>
                  {meetingBrief && (
                    <Box component="button" className="btn-premium-outline" onClick={() => setBriefDialogOpen(true)}
                      sx={{ py: 1.2, px: 3, fontSize: '0.875rem' }}>
                      View Latest Brief
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Schedule Meeting Options */}
              <Collapse in={showScheduleOptions} sx={{ mb: 4 }}>
                <Box sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  border: '1px solid var(--bg-border)',
                  borderRadius: 'var(--card-radius)',
                  bgcolor: 'var(--bg-surface)', mb: 3,
                }}>
                  <Typography sx={{
                    mb: 2.5, fontWeight: 700, fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1,
                    fontSize: '1.05rem',
                  }}>
                    <CalendarMonthIcon sx={{ fontSize: 20 }} />
                    Schedule Meeting
                  </Typography>

                  <Stack spacing={2}>
                    <TextField fullWidth label="Meeting Title" value={scheduleTitle}
                      onChange={e => setScheduleTitle(e.target.value)} variant="outlined"
                      placeholder="Enter a descriptive title" sx={textFieldSx} />
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <TextField fullWidth label="Date" type="date" value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)} variant="outlined"
                        InputLabelProps={{ shrink: true }} sx={textFieldSx} />
                      <TextField fullWidth label="Time" type="time" value={scheduleTime}
                        onChange={e => setScheduleTime(e.target.value)} variant="outlined"
                        InputLabelProps={{ shrink: true }} sx={textFieldSx} />
                    </Box>
                    <TextField fullWidth label="Duration (minutes)" type="number" value={scheduleDuration}
                      onChange={e => setScheduleDuration(e.target.value)} variant="outlined" sx={textFieldSx} />
                  </Stack>

                  <Box sx={{
                    mt: 3, pt: 2.5, display: 'flex', justifyContent: 'space-between', gap: 2,
                    borderTop: '1px solid var(--bg-border)',
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}>
                    <Box component="button" className="btn-premium-outline"
                      onClick={() => setShowScheduleOptions(false)}
                      sx={{ py: 1.2, px: 3, fontSize: '0.875rem', order: { xs: 2, sm: 1 } }}>
                      Cancel
                    </Box>
                    <Box component="button" className="btn-premium"
                      onClick={confirmScheduledMeeting}
                      sx={{ py: 1.2, px: 3, fontSize: '0.875rem', order: { xs: 1, sm: 2 } }}>
                      Create Scheduled Meeting
                    </Box>
                  </Box>
                </Box>
              </Collapse>

              {/* Display Name */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{
                  mb: 1, color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Your display name in meetings
                </Typography>
                <TextField fullWidth value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="Enter your name" variant="outlined" sx={textFieldSx} />
              </Box>

              {/* Device Settings */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{
                  mb: 1.5, color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Device settings
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box
                    component="button"
                    onClick={() => setMicOn(!micOn)}
                    sx={{
                      flex: 1, py: 1.5,
                      borderRadius: 'var(--button-radius)',
                      border: micOn ? '1px solid var(--text-primary)' : '1px solid var(--bg-border)',
                      background: micOn ? 'var(--text-primary)' : 'transparent',
                      color: micOn ? 'var(--bg-dark)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'var(--font-primary)',
                      fontWeight: 600, fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'var(--text-primary)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {micOn ? <MicIcon sx={{ fontSize: 18 }} /> : <MicOffIcon sx={{ fontSize: 18 }} />}
                    {micOn ? 'Mic On' : 'Mic Off'}
                  </Box>
                  <Box
                    component="button"
                    onClick={() => setVideoOn(!videoOn)}
                    sx={{
                      flex: 1, py: 1.5,
                      borderRadius: 'var(--button-radius)',
                      border: videoOn ? '1px solid var(--text-primary)' : '1px solid var(--bg-border)',
                      background: videoOn ? 'var(--text-primary)' : 'transparent',
                      color: videoOn ? 'var(--bg-dark)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'var(--font-primary)',
                      fontWeight: 600, fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'var(--text-primary)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {videoOn ? <VideocamIcon sx={{ fontSize: 18 }} /> : <VideocamOffIcon sx={{ fontSize: 18 }} />}
                    {videoOn ? 'Video On' : 'Video Off'}
                  </Box>
                </Box>
              </Box>

              {/* Meeting ID */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{
                  mb: 1, color: meetingId ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '0.85rem',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  transition: 'color 0.3s ease',
                }}>
                  {meetingId ? 'Meeting ID' : 'Enter Meeting ID to join or leave blank to create new'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    fullWidth value={meetingId} onChange={e => setMeetingId(e.target.value)}
                    placeholder="Meeting ID" variant="outlined"
                    InputProps={{
                      endAdornment: meetingId ? (
                        <Tooltip title="Copy Meeting ID">
                          <IconButton size="small" onClick={() => copyMeetingId(meetingId)}>
                            <ContentCopyIcon fontSize="small" sx={{ color: 'var(--text-muted)' }} />
                          </IconButton>
                        </Tooltip>
                      ) : null,
                    }}
                    sx={{
                      ...textFieldSx,
                      '& .MuiOutlinedInput-root': {
                        ...textFieldSx['& .MuiOutlinedInput-root'],
                        fontFamily: meetingId ? 'monospace' : 'inherit',
                        fontWeight: meetingId ? 600 : 'normal',
                        fontSize: meetingId ? '1.05rem' : 'inherit',
                      },
                    }}
                  />
                  {meetingId && (
                    <Box
                      component="button"
                      className="btn-premium-outline"
                      onClick={() => openShareDialog(meetingId)}
                      sx={{
                        py: 1.2, px: 2.5, fontSize: '0.875rem',
                        display: 'flex', alignItems: 'center', gap: 0.5,
                        whiteSpace: 'nowrap', minWidth: { xs: '50px', sm: '120px' },
                      }}
                    >
                      <ShareIcon fontSize="small" />
                      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Share</Box>
                    </Box>
                  )}
                </Box>
                {isMeetingCreated && meetingId && (
                  <Box sx={{
                    mt: 1.5, p: 1.5,
                    bgcolor: 'var(--accent-glow)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', gap: 1,
                    border: '1px solid var(--bg-border)',
                  }}>
                    <LightbulbIcon sx={{ color: 'var(--text-muted)', fontSize: '1rem' }} />
                    <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      Your meeting is ready! You can join now or share the link with others.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Join / Start CTA */}
              <Box
                component="button"
                className="btn-premium"
                disabled={isGenerating || isJoining}
                onClick={handleJoinMeeting}
                sx={{
                  width: '100%', py: 2.2,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 700, position: 'relative', overflow: 'hidden',
                  opacity: (isGenerating || isJoining) ? 0.7 : 1,
                  pointerEvents: (isGenerating || isJoining) ? 'none' : 'auto',
                  animation: (isGenerating || isJoining) ? 'none' : 'pulse 3s infinite',
                }}
              >
                {isGenerating || isJoining ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: 'var(--bg-dark)' }} />
                    <span>{isJoining ? 'Joining Meeting...' : 'Generating...'}</span>
                  </Box>
                ) : meetingId ? (
                  <>Join Meeting <ArrowOutward sx={{ ml: 1, fontSize: '1.1rem' }} /></>
                ) : (
                  <>Start New Meeting <ArrowOutward sx={{ ml: 1, fontSize: '1.1rem' }} /></>
                )}

                {isJoining && (
                  <Box sx={{
                    position: 'absolute', bottom: 0, left: 0, height: '2px',
                    bgcolor: 'var(--bg-dark)', width: '100%', opacity: 0.3,
                    '&::before': {
                      content: '""', position: 'absolute', top: 0, left: '-100%',
                      width: '100%', height: '100%',
                      backgroundColor: 'var(--bg-dark)', opacity: 0.6,
                      animation: 'loadingBar 1.5s infinite ease-in-out',
                    },
                    '@keyframes loadingBar': {
                      '0%': { left: '-100%' },
                      '100%': { left: '100%' },
                    },
                  }} />
                )}
              </Box>
            </Box>

            {/* ── Recent Meetings ── */}
            {recentMeetings.length > 0 && (
              <Box
                component={motion.div}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                sx={{
                  borderRadius: 'var(--card-radius)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--bg-border)',
                }}
              >
                <Box sx={{
                  p: 2.5,
                  borderBottom: '1px solid var(--bg-border)',
                  display: 'flex', alignItems: 'center',
                }}>
                  <HistoryIcon sx={{ color: 'var(--text-muted)', mr: 1.5, fontSize: 20 }} />
                  <Typography sx={{
                    fontFamily: 'var(--font-heading)', fontWeight: 700,
                    color: 'var(--text-primary)', fontSize: '1rem',
                  }}>
                    Recent Meetings
                  </Typography>
                </Box>
                <Box>
                  {recentMeetings.map((meeting, index) => (
                    <React.Fragment key={meeting.id}>
                      <Box sx={{
                        p: 2.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.3s ease',
                        '&:hover': { backgroundColor: 'var(--accent-glow)' },
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--bg-border)', mr: 2,
                          }}>
                            <Typography sx={{
                              fontFamily: 'monospace', fontWeight: 'bold',
                              color: 'var(--text-primary)', fontSize: '0.85rem',
                            }}>
                              {meeting.id.substring(0, 2)}
                            </Typography>
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                                {meeting.id}
                              </Typography>
                              {meeting.isCreator && (
                                <Typography sx={{
                                  fontSize: '0.65rem', fontWeight: 600,
                                  color: 'var(--text-muted)',
                                  border: '1px solid var(--bg-border)',
                                  borderRadius: 'var(--radius-sm)',
                                  px: 0.8, py: 0.2,
                                }}>
                                  Created by you
                                </Typography>
                              )}
                            </Box>
                            <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              Joined {formatRelativeTime(meeting.joinedAt)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Copy meeting ID">
                            <IconButton size="small" onClick={() => copyMeetingId(meeting.id)}
                              sx={{ color: 'var(--text-muted)', '&:hover': { color: 'var(--text-primary)' } }}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Box component="button" className="btn-premium-outline"
                            onClick={() => joinRecentMeeting(meeting.id)}
                            sx={{
                              py: 0.5, px: 2, fontSize: '0.8rem',
                              opacity: isJoining ? 0.5 : 1,
                              pointerEvents: isJoining ? 'none' : 'auto',
                            }}>
                            {isJoining ? '...' : 'Join'}
                          </Box>
                        </Box>
                      </Box>
                      {index < recentMeetings.length - 1 && (
                        <Box sx={{ height: '1px', backgroundColor: 'var(--bg-border)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* ══════════════ RIGHT COLUMN ══════════════ */}
          <Box
            component={motion.div}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Box sx={{
              borderRadius: 'var(--card-radius)',
              p: { xs: 3, md: 5 },
              height: '100%',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--bg-border)',
              backdropFilter: 'blur(24px)',
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                borderColor: 'var(--accent-muted)',
                boxShadow: '0 10px 40px var(--accent-glow)',
              },
            }}>
              {/* Decorative radial glows */}
              <Box sx={{
                position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                top: -150, right: -150, zIndex: 0,
              }} />
              <Box sx={{
                position: 'absolute', width: 250, height: 250, borderRadius: '50%',
                background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                bottom: -80, left: -80, zIndex: 0,
              }} />

              {/* Content */}
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800, fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)', mb: 2,
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    letterSpacing: '-0.03em', lineHeight: 1.1,
                  }}
                >
                  Meeting Intelligence{' '}
                  <span style={{ color: 'var(--text-muted)' }}>Command Center</span>
                </Typography>

                <Typography sx={{ color: 'var(--text-secondary)', mb: 5, lineHeight: 1.6, fontSize: '0.95rem', maxWidth: 500 }}>
                  Capture meetings live, convert talk into decisions and action items, and review productivity signals instantly.
                </Typography>

                {/* Feature grid */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2, mb: 5,
                }}>
                  {features.map((feature, index) => (
                    <Box
                      key={feature.title}
                      component={motion.div}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      sx={{
                        p: 3,
                        borderRadius: 'var(--card-radius)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--bg-border)',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {
                          borderColor: 'var(--text-muted)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 10px 40px var(--accent-glow)',
                        },
                      }}
                    >
                      <Typography sx={{
                        fontWeight: 700, fontFamily: 'var(--font-heading)',
                        color: 'var(--text-primary)', mb: 0.5, fontSize: '1rem',
                      }}>
                        {feature.title}
                      </Typography>
                      <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Live Meeting Preview */}
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{
                    mb: 1, fontWeight: 800, fontFamily: 'var(--font-heading)',
                    color: 'var(--text-primary)', fontSize: '1.15rem',
                  }}>
                    Live Meeting Preview
                  </Typography>
                  <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem', mb: 2.5 }}>
                    This card is now connected to your real dashboard inputs and updates in real time.
                  </Typography>
                  <MeetingCard
                    title={liveMeetingPreview.title}
                    date={liveMeetingPreview.date}
                    time={liveMeetingPreview.time}
                    duration={liveMeetingPreview.duration}
                    meetingLink={liveMeetingPreview.meetingLink}
                    notification={liveMeetingPreview.notification}
                    participants={liveMeetingPreview.participants}
                    description={liveMeetingPreview.description}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* ─── Notifications ─── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--bg-border)',
            color: 'var(--text-primary)',
            '& .MuiAlert-icon': { color: 'var(--text-muted)' },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ─── AI Brief Dialog ─── */}
      <Dialog
        open={briefDialogOpen}
        onClose={() => setBriefDialogOpen(false)}
        fullWidth maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--bg-border)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--card-radius)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          },
        }}
      >
        <DialogTitle sx={{
          fontFamily: 'var(--font-heading)', fontWeight: 700,
          borderBottom: '1px solid var(--bg-border)',
        }}>
          AI Meeting Brief
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'var(--bg-border)' }}>
          {!meetingBrief ? (
            <Typography sx={{ color: 'var(--text-muted)' }}>No brief generated yet.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 2.5 }}>
              {[
                { label: 'Agenda', items: meetingBrief.agenda },
                { label: 'Key Questions', items: meetingBrief.keyQuestions },
                { label: 'Success Criteria', items: meetingBrief.successCriteria },
                { label: 'Risk Checks', items: meetingBrief.riskChecks },
              ].map(section => (
                <Box key={section.label} sx={{
                  p: 2.5, borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--bg-border)', bgcolor: 'var(--bg-surface)',
                }}>
                  <Typography sx={{
                    fontFamily: 'var(--font-heading)', fontWeight: 700,
                    color: 'var(--text-primary)', mb: 1, fontSize: '0.95rem',
                  }}>
                    {section.label}
                  </Typography>
                  {(section.items || []).map((item, idx) => (
                    <Typography key={idx} sx={{ mt: 0.5, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      • {item}
                    </Typography>
                  ))}
                </Box>
              ))}
              {meetingBrief.openingScript && (
                <Box sx={{
                  p: 2.5, borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--bg-border)', bgcolor: 'var(--bg-surface)',
                }}>
                  <Typography sx={{
                    fontFamily: 'var(--font-heading)', fontWeight: 700,
                    color: 'var(--text-primary)', mb: 1, fontSize: '0.95rem',
                  }}>
                    Opening Script
                  </Typography>
                  <Typography sx={{ mt: 0.5, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {meetingBrief.openingScript}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid var(--bg-border)', p: 2 }}>
          <Box component="button" className="btn-premium-outline"
            onClick={() => setBriefDialogOpen(false)}
            sx={{ py: 1, px: 3, fontSize: '0.875rem' }}>
            Close
          </Box>
          <Box component="button" className="btn-premium"
            onClick={() => {
              if (briefTitle.trim()) setScheduleTitle(briefTitle.trim());
              setBriefDialogOpen(false);
              setShowScheduleOptions(true);
            }}
            sx={{ py: 1, px: 3, fontSize: '0.875rem' }}>
            Use For Scheduled Meeting
          </Box>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        meetingId={meetingId}
        isScheduled={meetingType === 'scheduled'}
        scheduledDate={scheduleDate}
        scheduledTime={scheduleTime}
      />
    </Box>
  );
}
