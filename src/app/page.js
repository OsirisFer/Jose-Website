import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Profile from '@/components/Profile';
import Services from '@/components/Services';
import TherapeuticApproach from '@/components/TherapeuticApproach';
import Contact from '@/components/Contact';
import BookingChoice from '@/components/Booking/BookingChoice';
import ImmediateHelp from '@/components/ImmediateHelp';
import Footer from '@/components/Footer';
import WaveDivider from '@/components/WaveDivider';
import FirmaSection from '@/components/FirmaSection';

/*
  Section background sequence (alternating for wave contrast):
  Hero                → var(--background)
  Profile             → var(--soft-beige)
  Services            → var(--background)
  TherapeuticApproach → var(--soft-beige)
  Booking             → var(--background)
  Contact             → var(--deep-text)   dark
  ImmediateHelp       → var(--soft-beige)
  Footer              → var(--soft-beige)
*/

const BG = 'var(--background)';
const SB = 'var(--soft-beige)';
const DT = 'var(--deep-text)';

export default function Home() {
  return (
    <main>
      <Header />

      <div id="hero"><Hero /></div>
      <FirmaSection />

      <div id="profile" style={{ scrollMarginTop: '70px' }}><Profile /></div>
      <WaveDivider bg={SB} fill={BG} variant={2} flip />

      <div id="services" style={{ scrollMarginTop: '70px' }}><Services /></div>
      <WaveDivider bg={BG} fill={SB} variant={3} />

      <div id="approach" style={{ scrollMarginTop: '70px' }}><TherapeuticApproach /></div>
      <WaveDivider bg={SB} fill={BG} variant={1} flip />

      <BookingChoice
        whatsappNumber={process.env.WHATSAPP_PHONE_E164}
        whatsappMessage={process.env.WHATSAPP_PREFILL_MESSAGE}
      />
      {/* Separación recta Booking → Contact y Contact → ImmediateHelp */}
      <div id="contact"><Contact /></div>

      <ImmediateHelp />
      <Footer />
    </main>
  );
}
