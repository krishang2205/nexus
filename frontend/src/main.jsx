import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './components/clerk-styles.css'; // Import custom styles for Clerk
import './components/clerk-fixes.css'; // Import fixes for Clerk components
import './components/clerk-professional.css'; // Import professional styling for Clerk components
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { AppThemeProvider, useAppTheme } from './theme/AppThemeProvider';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ClerkShell() {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={{
        layout: {
          socialButtonsVariant: 'iconButton',
          showOptionalFields: false,
          logoPlacement: 'none',
          helpPageUrl: false,
          privacyPageUrl: false,
          termsPageUrl: false,
        },
        variables: {
          colorPrimary: isDark ? '#68a0ff' : '#165dff',
          colorTextOnPrimaryBackground: '#ffffff',
          colorBackground: isDark ? '#0f192b' : '#ffffff',
          colorInputBackground: isDark ? '#15233a' : '#f5f8fc',
          colorInputText: isDark ? '#e4ebfb' : '#263248',
          colorTextSecondary: isDark ? '#9cb0cf' : '#5f6e84',
          fontFamily: 'Space Grotesk, Segoe UI, sans-serif',
          borderRadius: '12px',
          spacingUnit: '0.75rem',
        },
        elements: {
          card: 'cl-card',
          formButtonPrimary: 'cl-formButtonPrimary',
          headerTitle: 'cl-headerTitle',
          headerSubtitle: 'cl-headerSubtitle',
          footerActionLink: 'cl-footerActionLink',
          footerActionText: 'cl-footerActionText',
          formFieldInput: 'cl-formFieldInput',
          formFieldLabel: 'cl-formFieldLabel',
          socialButtonsIconButton: 'cl-socialButtonsIconButton',
          identityPreviewText: 'cl-identityPreviewText',
          formFieldAction: 'cl-formFieldAction',
          dividerText: 'cl-dividerText',
          formFieldError: 'cl-formFieldError',
          userButtonTrigger: 'cl-userButtonTrigger',
        }
      }}
    >
      <App />
    </ClerkProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppThemeProvider>
      <ClerkShell />
    </AppThemeProvider>
  </StrictMode>
);
