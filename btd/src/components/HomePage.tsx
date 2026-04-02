import React, { useState } from 'react';
import { SignInButton, useUser } from '@clerk/clerk-react';
import { Brain, Stethoscope, User, Zap, Shield, Menu, X } from 'lucide-react';

if (typeof document !== 'undefined' && !document.getElementById('neuroscan-fonts')) {
  const link = document.createElement('link');
  link.id = 'neuroscan-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
}

interface HomePageProps {
  onGuestAccess: () => void;
  onDoctorAccess: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGuestAccess, onDoctorAccess }) => {
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  React.useEffect(() => {
    if (isSignedIn) {
      sessionStorage.setItem('neuroscan-page', 'doctor');
      onDoctorAccess();
    }
  }, [isSignedIn]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'Manrope', sans-serif", background: '#f9f9f5', color: '#0d0d0d' }}
    >
      {/* ── ANNOUNCEMENT BAR ── */}
      {/* <div
        className="text-center py-2 px-3 text-xs leading-relaxed"
        style={{ background: '#0d0d0d', color: '#c8f04e', letterSpacing: '0.03em' }}
      >
        NeuroScan AI — For informational purposes only. Always consult a qualified physician.
      </div> */}

      {/* ── HEADER ── */}
      <header
        className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b sticky top-0 z-50"
        style={{ background: '#f9f9f5', borderColor: '#e0e0d8' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#0d0d0d' }}>
            <Brain className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#c8f04e' }} />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-extrabold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
              NeuroScan AI
            </div>
            <div className="text-xs hidden sm:block" style={{ color: '#888' }}>Brain Tumor Detection System</div>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs" style={{ color: '#2d9c2d' }}>
            <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: '#2d9c2d' }} />
            System Online
          </div>
          <SignInButton mode="modal">
            <button
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
              style={{ background: 'transparent', color: '#0d0d0d', border: '1.5px solid #ccc' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#ccc')}
            >
              <Shield className="h-4 w-4" /> Login
            </button>
          </SignInButton>
          <button
            onClick={onGuestAccess}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
            style={{ background: '#0d0d0d', color: '#f9f9f5', border: '2px solid #0d0d0d' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#c8f04e'; el.style.color = '#0d0d0d'; el.style.borderColor = '#c8f04e'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#0d0d0d'; el.style.color = '#f9f9f5'; el.style.borderColor = '#0d0d0d'; }}
          >
            <Zap className="h-4 w-4" /> Scan Now
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg"
          style={{ background: '#f0f0ea' }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-b px-4 py-4 flex flex-col gap-3" style={{ background: '#f9f9f5', borderColor: '#e0e0d8' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#2d9c2d' }}>
            <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: '#2d9c2d' }} />
            System Online
          </div>
          <SignInButton mode="modal">
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: 'transparent', color: '#0d0d0d', border: '1.5px solid #ccc' }}
              onClick={() => setMenuOpen(false)}
            >
              <Shield className="h-4 w-4" /> Login — Doctor Access
            </button>
          </SignInButton>
          <button
            onClick={() => { setMenuOpen(false); onGuestAccess(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: '#0d0d0d', color: '#f9f9f5' }}
          >
            <Zap className="h-4 w-4" /> Scan Now
          </button>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-16">
        <div className="w-full max-w-3xl">

          {/* ── TITLE ── */}
          <div className="text-center mb-8 sm:mb-12">
            <h2
              className="font-extrabold mb-3"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(22px, 5vw, 42px)',
                letterSpacing: '-0.02em',
                color: '#0d0d0d',
                lineHeight: 1.2,
              }}
            >
              AI-Powered{' '}
              <span className="relative inline-block">
                Brain Tumor Detection
                <span
                  className="absolute left-0 bottom-0.5 w-full rounded-sm"
                  style={{ background: '#c8f04e', height: '8px', display: 'block', zIndex: -1 }}
                />
              </span>
            </h2>
            <p className="text-base sm:text-lg" style={{ color: '#666', fontWeight: 300 }}>
              Choose how you want to access the system
            </p>
          </div>

          {/* ── CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">

            {/* Doctor Portal */}
            <div
              className="rounded-2xl border p-6 sm:p-8 transition-all duration-200"
              style={{ background: '#ffffff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-5" style={{ background: '#e8eeff' }}>
                <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#3b5bdb' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
                Doctor Portal
              </h3>
              <p className="text-sm leading-relaxed mb-5 sm:mb-6" style={{ color: '#777' }}>
                Secure login for medical professionals. Store patient scans, track analysis history and manage medical reports.
              </p>
              <ul className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-7">
                {['Patient data storage', 'Analysis history', 'Secure records'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#555' }}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#dde8ff', color: '#3b5bdb', fontSize: '10px', fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <SignInButton mode="modal">
                <button
                  className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{ background: '#3b5bdb', color: '#ffffff' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#2f4ac0')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#3b5bdb')}
                >
                  <Shield className="h-4 w-4" /> Sign In — Doctor Access
                </button>
              </SignInButton>
            </div>

            {/* Quick Analysis */}
            <div
              className="rounded-2xl border p-6 sm:p-8 transition-all duration-200"
              style={{ background: '#ffffff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-5" style={{ background: '#e6f9e0' }}>
                <User className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#2d9c2d' }} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
                Quick Analysis
              </h3>
              <p className="text-sm leading-relaxed mb-5 sm:mb-6" style={{ color: '#777' }}>
                Analyze your brain MRI scan instantly without an account. Get real-time AI results with no registration required.
              </p>
              <ul className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-7">
                {['No account required', 'Instant AI analysis', 'Download report'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#555' }}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#d9f7d0', color: '#2d9c2d', fontSize: '10px', fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onGuestAccess}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                style={{ background: '#2d9c2d', color: '#ffffff' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#237a23')}
                onMouseLeave={e => (e.currentTarget.style.background = '#2d9c2d')}
              >
                <Zap className="h-4 w-4" /> Analyze Scan Now
              </button>
            </div>
          </div>

          {/* ── STATS ── */}
          <div className="rounded-2xl border p-4 sm:p-6" style={{ background: '#ffffff', borderColor: '#e0e0d8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: '#e0e0d8' }}>
              {[
                { value: '88%', label: 'Model Accuracy' },
                { value: '4', label: 'Tumor Classes' },
                { value: '5600+', label: 'Training Images' },
              ].map(s => (
                <div key={s.label} className="text-center px-2 sm:px-4">
                  <div className="font-extrabold text-xl sm:text-2xl mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3b5bdb' }}>
                    {s.value}
                  </div>
                  <div className="text-xs" style={{ color: '#888' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="flex items-center justify-between px-4 sm:px-10 py-4 sm:py-5 border-t"
        style={{ borderColor: '#e0e0d8', background: '#f9f9f5' }}
      >
        <div className="flex items-center gap-2 font-bold text-sm sm:text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
          <Brain className="h-4 w-4" /> NeuroScan AI
        </div>
        <div className="text-xs" style={{ color: '#888' }}>© 2026 All Rights Reserved</div>
      </footer>
    </div>
  );
};

export default HomePage;