import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, useUser, useClerk, useAuth } from '@clerk/clerk-react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Stack,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

// Landing Components
import Hero from './components/landing/Hero';
import HowItWorks from './components/landing/HowItWorks';
import FeaturesSection from './components/landing/FeaturesSection';
import ProductPreview from './components/landing/ProductPreview';
import CTASection from './components/landing/CTASection';
import ThemeToggle from './components/ThemeToggle';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isLoaded } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openProfileMenu = (event) => setAnchorEl(event.currentTarget);
  const closeProfileMenu = () => setAnchorEl(null);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Navigation */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: scrolled ? 'var(--bg-dark)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--bg-border)' : '1px solid transparent',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 100,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ height: 90, gap: 1, py: {xs: 1, md: 0} }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--bg-dark)' }} />
              </Box>
              <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Nexus Meet AI
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={3} alignItems="center">
              <ThemeToggle sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
              {!isLoaded ? (
                 <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</Typography>
              ) : (
                <>
                  <SignedOut>
                    <Box component="button" className="btn-premium-outline" onClick={handleGetStarted} sx={{ display: { xs: 'none', sm: 'inline-flex' }}}>
                      Sign In
                    </Box>
                    <Box component="button" className="btn-premium" onClick={handleGetStarted}>
                      Get Started
                    </Box>
                  </SignedOut>
                  <SignedIn>
                    <Button
                      onClick={openProfileMenu}
                      disableRipple
                      sx={{ 
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-primary)',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': { background: 'transparent', opacity: 0.8 }
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user?.firstName || 'Account'}</Typography>
                        {user?.imageUrl ? <Avatar src={user.imageUrl} sx={{ width: 36, height: 36 }} /> : <AccountCircleIcon sx={{ fontSize: 36 }} />}
                      </Stack>
                    </Button>
                  </SignedIn>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* 1. Hero */}
        <Hero onStartTrial={handleGetStarted} />
        
        {/* 2. How It Works */}
        <HowItWorks />
        
        {/* 3. Product Preview */}
        <Box id="product-preview">
          <ProductPreview />
        </Box>
        
        {/* 4. Features */}
        <FeaturesSection />
        
        {/* 5. CTA + Auth (merged) */}
        <CTASection onGetStarted={handleGetStarted} />

        {/* Footer */}
        <Box sx={{ py: 6, borderTop: '1px solid var(--bg-border)', backgroundColor: 'var(--bg-dark)' }}>
          <Container maxWidth="xl">
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{xs: 'flex-start', md: 'center'}} spacing={4}>
               <Stack direction="row" spacing={2} alignItems="center">
                 <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--text-primary)', display: 'grid', placeItems: 'center' }}>
                   <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--bg-dark)' }} />
                 </Box>
                 <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem' }}>Nexus Meet</Typography>
               </Stack>
               
               <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                 Built for fast teams and hackathon launch readiness.
               </Typography>
            </Stack>
          </Container>
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={closeProfileMenu}
        PaperProps={{
          sx: {
            mt: 2,
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--bg-border)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            minWidth: 220,
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          },
        }}
      >
        <MenuItem onClick={() => { closeProfileMenu(); navigate('/dashboard'); }} sx={{ py: 1.5, fontFamily: 'var(--font-primary)', '&:hover': { backgroundColor: 'var(--bg-border)' } }}>
           Dashboard
        </MenuItem>
        <MenuItem onClick={() => { closeProfileMenu(); signOut(); }} sx={{ py: 1.5, fontFamily: 'var(--font-primary)', color: '#ff6b6b', '&:hover': { backgroundColor: 'var(--bg-border)' } }}>
           <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
}
