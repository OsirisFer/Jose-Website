import { Inter, Young_Serif } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
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
  verification: {
    google: 'lQYjnClZB5qJVt-DT3QsJ7bYoYpMsKQkTPZ4c6HdUno',
  },
  title: "Lic. Josefina García da Rosa | Psicóloga en Maldonado",
  description: "Psicóloga clínica en Maldonado, Punta del Este y San Carlos. Atención individual presencial y online. Primera entrevista sin compromiso. Agendá tu turno.",
  keywords: "psicóloga Maldonado, psicóloga Punta del Este, psicóloga San Carlos, psicología clínica, terapia individual, salud mental Uruguay, Josefina García da Rosa",
  openGraph: {
    title: "Lic. Josefina García da Rosa | Psicóloga en Maldonado",
    description: "Psicóloga clínica en Maldonado, Punta del Este y San Carlos. Atención individual presencial y online.",
    url: "https://psicologajosefina.page",
    siteName: "Psicóloga Josefina García da Rosa",
    locale: "es_UY",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${youngSerif.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
