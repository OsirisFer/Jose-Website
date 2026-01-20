import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Profile from '@/components/Profile';
import Services from '@/components/Services';
import TherapeuticApproach from '@/components/TherapeuticApproach';
import Contact from '@/components/Contact';
import BookingChoice from '@/components/Booking/BookingChoice';
import ImmediateHelp from '@/components/ImmediateHelp';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <div id="hero"><Hero /></div>
      <div id="profile"><Profile /></div>
      <div id="services"><Services /></div>
      <div id="approach"><TherapeuticApproach /></div>
      <BookingChoice
        whatsappNumber={process.env.WHATSAPP_PHONE_E164}
        whatsappMessage={process.env.WHATSAPP_PREFILL_MESSAGE}
      />
      <div id="contact"><Contact /></div>
      <ImmediateHelp />
      <Footer />
    </main>
  );
}
