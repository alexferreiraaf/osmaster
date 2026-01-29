import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/shared/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/auth-provider';

export const metadata: Metadata = {
  title: 'OS Manager Pro',
  description: 'Manage your service orders with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
          <Toaster />
      </body>
    </html>
  );
}
