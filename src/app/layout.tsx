import type {Metadata} from 'next';
import { Montserrat, Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-headline',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'MindBloom - Your Personal Wellness Companion',
  description: 'An AI-powered app for mood tracking, journaling, and self-care.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${roboto.variable} font-body antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
