// src/app/layout.tsx


import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { QueryClientProvider } from '@/providers/query-client-provider';
import AuthProvider from '@/providers/auth-provider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';


const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: 'Skeduluk - Content Scheduling Made Simple',
  description: 'Schedule and manage your social media posts with ease.',
  keywords: 'content scheduler, social media automation, Buffer, Hootsuite, content planning',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#d4af37;stop-opacity:1" /><stop offset="100%" style="stop-color:#ff6b4a;stop-opacity:1" /></linearGradient></defs><rect fill="url(#grad)" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial">SK</text></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
};

function RootLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#d4af37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryClientProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1a1a1a',
                    color: '#fff',
                    borderRadius: '0.75rem',
                    fontSize: '14px',
                    border: '1px solid hsl(42 84% 61% / 0.2)',
                    backdropFilter: 'blur(4px)',
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: 'hsl(142 76% 36%)',
                      border: '1px solid hsl(142 76% 46% / 0.3)',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: 'hsl(142 76% 36%)',
                    },
                  },
                  error: {
                    duration: 4000,
                    style: {
                      background: 'hsl(0 84.2% 60.2%)',
                      border: '1px solid hsl(0 84.2% 70.2% / 0.3)',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: 'hsl(0 84.2% 60.2%)',
                    },
                  },
                  loading: {
                    style: {
                      background: 'hsl(42 84% 61%)',
                      border: '1px solid hsl(42 84% 71% / 0.3)',
                    },
                  },
                }}
              />
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayoutContent>{children}</RootLayoutContent>;
}