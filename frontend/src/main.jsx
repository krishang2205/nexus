import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './clerk-styles.css'; // Premium theme-adaptive Clerk styling
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
          colorPrimary: isDark ? '#ffffff' : '#000000',
          colorTextOnPrimaryBackground: isDark ? '#000000' : '#ffffff',
          colorInputBackground: 'var(--bg-dark)',
          colorInputText: 'var(--text-primary)',
          colorText: 'var(--text-primary)',
          colorTextSecondary: 'var(--text-secondary)',
          fontFamily: 'var(--font-primary), sans-serif',
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
