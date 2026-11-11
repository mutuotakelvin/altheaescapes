import type { Metadata } from 'next';
import { Barlow_Condensed, Geist } from 'next/font/google';
import './globals.css';
const display = Barlow_Condensed({ variable: '--font-display', subsets: ['latin'], weight: ['600', '800'], display: 'swap' });
const sans = Geist({ variable: '--font-sans', subsets: ['latin'], display: 'swap' });
export const metadata: Metadata = {
  title: 'Althea Escapes — Go beyond the ordinary',
  description: 'Find your next great story. Discover air, water, land and wilderness adventures with Althea Escapes.',
};
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <html lang="en" className={`${display.variable} ${sans.variable}`}><body>{children}</body></html>;
}
