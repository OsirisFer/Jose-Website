import { Inter, Young_Serif } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const youngSerif = Young_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-young-serif',
  display: 'swap',
});

export const metadata = {
  title: "Josefina | Licensed Psychologist",
  description: "Professional psychology consultations for mental well-being in a calm, supportive environment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${youngSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
