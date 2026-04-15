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
  title: "Lic. Josefina García da Rosa | Psicóloga en Punta del Este",
  description: "Psicóloga clínica en Punta del Este, Maldonado y San Carlos. Atención individual presencial y online. Primera entrevista sin compromiso. Agendá tu turno.",
  keywords: "psicóloga Punta del Este, psicóloga Maldonado, psicóloga San Carlos, psicología clínica, terapia individual, salud mental Uruguay, Josefina García da Rosa",
  openGraph: {
    title: "Lic. Josefina García da Rosa | Psicóloga en Punta del Este",
    description: "Psicóloga clínica en Punta del Este, Maldonado y San Carlos. Atención individual presencial y online.",
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
      </body>
    </html>
  );
}
