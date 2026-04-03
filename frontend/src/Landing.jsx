import { useState } from 'react';
import { SignedIn, SignedOut, SignIn, useUser, useClerk, useAuth } from '@clerk/clerk-react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';

const productPills = [
  { icon: <TaskAltIcon sx={{ fontSize: 16 }} />, label: 'Action Center' },
  { icon: <AutoGraphIcon sx={{ fontSize: 16 }} />, label: 'Productivity Score' },
  { icon: <TipsAndUpdatesIcon sx={{ fontSize: 16 }} />, label: 'Smart Highlights' },
];

const featureItems = [
  {
    title: 'Live Transcript',
    description: 'Reliable speech-to-text with speaker separation and searchable history.',
    icon: <VideocamIcon fontSize="small" />,
  },
  {
    title: 'Ask Nexus',
    description: 'Ask for decisions, blockers, and summaries directly from meeting context.',
    icon: <ChatIcon fontSize="small" />,
  },
  {
    title: 'Decision Capture',
    description: 'Automatically detect owners, next steps, and deadlines in real time.',
    icon: <SecurityIcon fontSize="small" />,
  },
];

const stats = [
  { value: 'Live', label: 'Session metrics' },
  { value: 'Source', label: 'Transcript + context' },
  { value: 'Auto', label: 'AI extraction status' },
  { value: 'Export', label: 'Post-meeting report' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isLoaded } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const isMenuOpen = Boolean(anchorEl);

  const openProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeProfileMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        background: '#ffffff',
        color: 'var(--text-primary)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowY: { xs: 'auto', md: 'hidden' },
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backgroundColor: 'var(--surface-base)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border-color)',
          zIndex: 10,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 60, sm: 66 }, px: { xs: 1.5, sm: 3 }, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                background: 'var(--gradient-button)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <VideocamIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: '0.98rem', sm: '1.2rem' } }}>
              Nexus Meet AI 
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle />

            {!isLoaded && (
              <Button
                disabled
                sx={{
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--surface-elevated)',
                  px: { xs: 1.1, sm: 1.6 },
                  minWidth: { xs: 92, sm: 112 },
                }}
              >
                Loading...
              </Button>
            )}

            {isLoaded && (
              <SignedOut>
              <Button
                startIcon={<LoginIcon fontSize="small" />}
                onClick={() => document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                sx={{
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--surface-elevated)',
                  px: { xs: 1.1, sm: 1.6 },
                  minWidth: { xs: 92, sm: 112 },
                }}
              >
                Sign In
              </Button>
              </SignedOut>
            )}

            {isLoaded && (
              <SignedIn>
              <Button
                onClick={openProfileMenu}
                startIcon={
                  user?.imageUrl ? (
                    <Avatar src={user.imageUrl} sx={{ width: 24, height: 24 }} />
                  ) : (
                    <AccountCircleIcon fontSize="small" />
                  )
                }
                sx={{
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--surface-elevated)',
                  px: { xs: 1, sm: 1.6 },
                  minWidth: { xs: 90, sm: 112 },
                }}
              >
                {user?.firstName || user?.username || 'Profile'}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={closeProfileMenu}
                PaperProps={{
                  sx: {
                    borderRadius: '12px',
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    closeProfileMenu();
                    navigate('/dashboard');
                  }}
                >
                  Go to Dashboard
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    closeProfileMenu();
                    signOut();
                  }}
                >
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Sign Out
                </MenuItem>
              </Menu>
              </SignedIn>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          pt: { xs: 2.2, sm: 2.8, md: 2.4 },
          pb: { xs: 2.2, sm: 2.8, md: 1.8 },
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100dvh - 66px)',
          gap: { xs: 2, sm: 2.2, md: 1.4 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.35fr) minmax(320px, 0.85fr)' },
            gap: { xs: 2, sm: 2.4, md: 2.2, xl: 3.2 },
            alignItems: 'start',
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.6, md: 2.6 },
                borderRadius: { xs: '18px', sm: '24px' },
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <Chip
                label="Enterprise Meeting Intelligence"
                size="small"
                sx={{
                  mb: { xs: 1.4, sm: 2.2 },
                  backgroundColor: 'rgba(22, 93, 255, 0.12)',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  maxWidth: '100%',
                }}
              />

              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  lineHeight: 1.04,
                  letterSpacing: '-0.03em',
                  fontSize: { xs: '1.6rem', sm: '2.1rem', md: '2.35rem', lg: '2.8rem' },
                  maxWidth: 760,
                }}
              >
                Run smarter meetings. Convert conversations into execution.
              </Typography>

              <Typography
                sx={{
                  mt: { xs: 1.2, sm: 2 },
                  maxWidth: 760,
                  color: 'var(--text-secondary)',
                  fontSize: { xs: '0.96rem', sm: '1rem', md: '1.02rem' },
                  lineHeight: 1.6,
                }}
              >
                Nexus captures decisions, tasks, risks, and highlights from your live meeting stream. Insights, score, and summaries are generated from the current session data.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: { xs: 1.8, sm: 2.4 }, flexWrap: 'wrap', rowGap: 1.2 }}>
                {productPills.map((pill) => (
                  <Box
                    key={pill.label}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.7,
                      px: 1.2,
                      py: 0.55,
                      borderRadius: '999px',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--surface-soft)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {pill.icon}
                    {pill.label}
                  </Box>
                ))}
              </Stack>

              <Grid container spacing={1.5} sx={{ mt: { xs: 1.1, sm: 1.8 } }}>
                {stats.map((stat) => (
                  <Grid item xs={6} lg={3} key={stat.label}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: '14px',
                        backgroundColor: 'var(--surface-soft)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <Typography sx={{ color: 'var(--color-primary)', fontWeight: 800, lineHeight: 1, fontSize: '1.18rem' }}>
                        {stat.value}
                      </Typography>
                      <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.78rem', mt: 0.4 }}>
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Typography
                sx={{
                  mt: 1.2,
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem'
                }}
              >
                This page shows capability states. Real values are generated during active meetings.
              </Typography>

              <Grid container spacing={1.6} sx={{ mt: { xs: 1.8, sm: 2.6 } }}>
                {featureItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} xl={4} key={item.title}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.5, md: 1.35 },
                        borderRadius: '14px',
                        height: '100%',
                        backgroundColor: 'var(--surface-soft)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '10px',
                          background: 'var(--gradient-accent)',
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          mb: 1.1,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>{item.title}</Typography>
                      <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        {item.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Paper
              id="auth-card"
              elevation={0}
              sx={{
                maxWidth: { xs: '100%', sm: 520, xl: 430 },
                width: '100%',
                mx: { xs: 'auto', xl: 0 },
                p: { xs: 2.2, sm: 2.8, md: 2.4 },
                borderRadius: { xs: '18px', sm: '24px' },
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <SignedOut>
                <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.9rem' }, mb: 0.5 }}>
                  Welcome to Nexus
                </Typography>
                <Typography sx={{ color: 'var(--text-secondary)', mb: 2.2 }}>
                  Sign in to launch meetings, invite your team, and use AI meeting intelligence.
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1, sm: 1.3 },
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-soft)',
                    '& .cl-rootBox': {
                      width: '100% !important',
                      maxWidth: '100% !important',
                    },
                    '& .cl-card': {
                      width: '100% !important',
                      maxWidth: '100% !important',
                      boxShadow: 'none !important',
                      background: 'transparent !important',
                    },
                    '& .cl-formButtonPrimary': {
                      background: 'var(--gradient-button) !important',
                      borderRadius: '10px !important',
                    },
                  }}
                >
                  <SignIn />
                </Paper>

                <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.75rem', mt: 2, textAlign: 'center' }}>
                  By continuing, you agree to our Terms and Privacy Policy.
                </Typography>
              </SignedOut>

              <SignedIn>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={user?.imageUrl}
                    sx={{
                      width: 78,
                      height: 78,
                      mx: 'auto',
                      mb: 1.4,
                      background: 'var(--gradient-button)',
                      border: '2px solid var(--border-strong)',
                    }}
                  >
                    {user?.firstName?.[0] || user?.username?.[0] || 'N'}
                  </Avatar>
                  <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: { xs: '1.7rem', sm: '2rem' } }}>
                    Welcome back
                  </Typography>
                  <Typography sx={{ color: 'var(--text-secondary)', mb: 2.5 }}>{user?.fullName || user?.username}</Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    py: 1.4,
                    borderRadius: '12px',
                    background: 'var(--gradient-button)',
                    boxShadow: 'var(--shadow-soft)',
                    fontWeight: 700,
                    mb: 1.2,
                    '&:hover': {
                      boxShadow: 'var(--shadow-strong)',
                    },
                  }}
                >
                  Go to Dashboard
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={() => signOut()}
                  sx={{
                    py: 1.2,
                    borderRadius: '12px',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                      backgroundColor: 'var(--surface-soft)',
                    },
                  }}
                >
                  Sign Out
                </Button>
              </SignedIn>
            </Paper>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            mt: { xs: 0.4, sm: 0.6, md: 0.4 },
            p: { xs: 1.8, sm: 2.2, md: 1.6 },
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--surface-base)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'center' },
            textAlign: { xs: 'center', sm: 'left' },
            gap: { xs: 1.2, sm: 0 },
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700 }}>Nexus Meet</Typography>
            <Typography sx={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              Built for fast teams and hackathon launch readiness.
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={0.5} justifyContent="center">
            <IconButton
              component="a"
              href="https://github.com/SHlok06majmundar"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'var(--text-secondary)' }}
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.linkedin.com/in/shlok-majmundar-988851252/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'var(--text-secondary)' }}
            >
              <LinkedInIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href="https://www.instagram.com/shlok.majmundar"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'var(--text-secondary)' }}
            >
              <InstagramIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
