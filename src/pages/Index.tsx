import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Particles from "@/components/garden/Particles";
import Navbar from "@/components/garden/Navbar";
import Hero from "@/components/garden/Hero";
import Services from "@/components/garden/Services";
import Courts from "@/components/garden/Courts";
import ClubHouse from "@/components/garden/ClubHouse";
import Events from "@/components/garden/Events";
import Tournois from "@/components/garden/Tournois";
import CtaSection from "@/components/garden/CtaSection";
import Tarifs from "@/components/garden/Tarifs";
import Contact from "@/components/garden/Contact";
import Footer from "@/components/garden/Footer";
import BookingModal from "@/components/garden/BookingModal";
import LoginModal from "@/components/garden/LoginModal";
import RegisterModal from "@/components/garden/RegisterModal";
import AdminDashboard from "@/components/garden/AdminDashboard";
import AccountModal from "@/components/garden/AccountModal";
import CalendarModal from "@/components/garden/CalendarModal";
import MemberDashboard from "@/components/garden/MemberDashboard";
import ResetPasswordModal from "@/components/garden/ResetPasswordModal";

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [memberPanelOpen, setMemberPanelOpen] = useState(false);

  const { user, isRecovering } = useAuth();
  const openLogin = () => { setRegisterOpen(false); setLoginOpen(true); };
  const openRegister = () => { setLoginOpen(false); setRegisterOpen(true); };
  const openAccount = () => setAccountOpen(true);
  const openBooking = () => { if (user) setBookingOpen(true); else openLogin(); };

  return (
    <>
      <Particles />
      <Navbar onLogin={openLogin} onRegister={openRegister} onAccount={openAccount} />
      <Hero onBooking={openBooking} />
      <Services />
      <Courts onBooking={openBooking} />
      <ClubHouse />
      <Events />
      <Tournois onCalendar={() => setCalendarOpen(true)} />
      <CtaSection onRegister={openRegister} />
      <Tarifs />
      <Contact />
      <Footer />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={openRegister}
        onAdminOpen={() => setAdminOpen(true)}
      />
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={openLogin}
      />
      <AdminDashboard open={adminOpen} onClose={() => setAdminOpen(false)} />
      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        onAdmin={() => setAdminOpen(true)}
        onMemberPanel={() => setMemberPanelOpen(true)}
      />
      <CalendarModal open={calendarOpen} onClose={() => setCalendarOpen(false)} />
      <MemberDashboard open={memberPanelOpen} onClose={() => setMemberPanelOpen(false)} />
      <ResetPasswordModal open={isRecovering} onClose={() => {}} />
    </>
  );
};

export default Index;
