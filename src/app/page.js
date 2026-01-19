import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Profile from '@/components/Profile';
import Services from '@/components/Services';
import TherapeuticApproach from '@/components/TherapeuticApproach';
import Contact from '@/components/Contact';
import BookingWizard from '@/components/Booking/BookingWizard';

export default function Home() {
  return (
    <main>
      <Header />
      <div id="hero"><Hero /></div>
      <div id="profile"><Profile /></div>
      <div id="services"><Services /></div>
      <div id="approach"><TherapeuticApproach /></div>
      <BookingWizard /> {/* Already has #book internal ID if needed, or we wrap it */}
      <div id="contact"><Contact /></div>
    </main>
  );
}
