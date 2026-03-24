import React from 'react';
import { SignInButton, useUser } from '@clerk/clerk-react';
import {SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Brain, Stethoscope, User, Zap, Shield } from 'lucide-react';

// Inject fonts once
if (typeof document !== 'undefined' && !document.getElementById('neuroscan-fonts')) {
  const link = document.createElement('link');
  link.id = 'neuroscan-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
}

// 1. Interface stays clean - types only
interface HomePageProps {
  onGuestAccess: () => void;
  onDoctorAccess: () => void;
}
// 2. Hook goes INSIDE the component function, not the interface


const HomePage: React.FC<HomePageProps> = ({ onGuestAccess, onDoctorAccess }) => {
  const { isSignedIn } = useUser();

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
        className="text-center py-2.5 px-4 text-xs"
        style={{ background: '#0d0d0d', color: '#c8f04e', letterSpacing: '0.04em' }}
      >
        NeuroScan AI uses a deep learning model trained on 5,600+ MRI images — results are for informational purposes only and should be reviewed by a qualified physician.
      </div> */}

      {/* ── HEADER ── */}
      <header
        className="flex items-center justify-between px-8 py-4 border-b sticky top-0 z-50"
        style={{ background: '#f9f9f5', borderColor: '#e0e0d8' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#0d0d0d' }}
          >
            <Brain className="h-5 w-5" style={{ color: '#c8f04e' }} />
          </div>
          <div>
            <div
              className="text-2xl font-extrabold leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}
            >
              NeuroScan AI
            </div>
            <div className="text-xs" style={{ color: '#888' }}>Brain Tumor Detection System</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
  {/* System Online dot */}
  <div className="flex items-center gap-2 text-xs" style={{ color: '#2d9c2d' }}>
    <span
      className="w-2 h-2 rounded-full animate-pulse inline-block"
      style={{ background: '#2d9c2d' }}
    />
    System Online
  </div>

  {/* Doctor Login button */}
  <SignInButton mode="modal">
  <button
    className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
    style={{ background: 'transparent', color: '#0d0d0d', border: '1.5px solid #ccc' }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
    onMouseLeave={e => (e.currentTarget.style.borderColor = '#ccc')}
  >
    <Shield className="h-4 w-4" />
    Login
  </button>
</SignInButton>

  {/* Analyze Scan button */}
  <button
    onClick={onGuestAccess}
    className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
    style={{ background: '#0d0d0d', color: '#f9f9f5', border: '2px solid #0d0d0d' }}
    onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#c8f04e'; el.style.color = '#0d0d0d'; el.style.borderColor = '#c8f04e'; }}
    onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#0d0d0d'; el.style.color = '#f9f9f5'; el.style.borderColor = '#0d0d0d'; }}
  >
    <Zap className="h-4 w-4" />
    Scan Now
  </button>
</div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 flex items-center justify-center px-4 pt-4 py-16">
        <div className="w-full max-w-3xl">

          {/* ── TITLE ── */}
          <div className="text-center mb-12">
            <h2
              className="font-extrabold mb-3"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(28px, 4vw, 42px)',
                letterSpacing: '-0.02em',
                color: '#0d0d0d',
              }}
            >
              AI-Powered{' '}
              <span className="relative inline-block">
                Brain Tumor Detection
                <span
                  className="absolute left-0 bottom-0.5 w-full rounded-sm"
                  style={{ background: '#c8f04e', height: '10px', display: 'block', zIndex: -1 }}
                />
              </span>
            </h2>
            <p
              className="text-lg"
              style={{ color: '#666', fontWeight: 300 }}
            >
              Choose how you want to access the system
            </p>
          </div>

          {/* ── CARDS ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

            {/* Doctor Portal */}
            <div
              className="rounded-2xl border p-8 transition-all duration-200 cursor-pointer"
              style={{ background: '#ffffff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.05)';
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                style={{ background: '#e8eeff' }}
              >
                <Stethoscope className="h-6 w-6" style={{ color: '#3b5bdb' }} />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}
              >
                Doctor Portal
              </h3>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: '#777', fontWeight: 400 }}
              >
                Secure login for medical professionals. Store patient scans, track analysis history and manage medical reports.
              </p>
              <ul className="space-y-2.5 mb-7">
                {['Patient data storage', 'Analysis history', 'Secure records'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#555' }}>
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#dde8ff', color: '#3b5bdb', fontSize: '10px', fontWeight: 700 }}
                    >✓</span>
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
    <Shield className="h-4 w-4" />
    Sign In — Doctor Access
  </button>
</SignInButton>
            </div>

            {/* Quick Analysis */}
            <div
              className="rounded-2xl border p-8 transition-all duration-200 cursor-pointer"
              style={{ background: '#ffffff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.05)';
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                style={{ background: '#e6f9e0' }}
              >
                <User className="h-6 w-6" style={{ color: '#2d9c2d' }} />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}
              >
                Quick Analysis
              </h3>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: '#777', fontWeight: 400 }}
              >
                Analyze your brain MRI scan instantly without an account. Get real-time AI results with no registration required.
              </p>
              <ul className="space-y-2.5 mb-7">
                {['No account required', 'Instant AI analysis', 'Download report'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#555' }}>
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#d9f7d0', color: '#2d9c2d', fontSize: '10px', fontWeight: 700 }}
                    >✓</span>
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
                <Zap className="h-4 w-4" />
                Analyze Scan Now
              </button>
            </div>
          </div>

          {/* ── STATS ── */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: '#ffffff', borderColor: '#e0e0d8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div className="grid grid-cols-3 divide-x" style={{ borderColor: '#e0e0d8' }}>
              {[
                { value: '88%', label: 'Model Accuracy' },
                { value: '4', label: 'Tumor Classes' },
                { value: '5600+', label: 'Training Images' },
              ].map(s => (
                <div key={s.label} className="text-center px-4">
                  <div
                    className="font-extrabold text-2xl mb-1"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3b5bdb' }}
                  >
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
        className="flex items-center justify-between px-10 py-5 border-t"
        style={{ borderColor: '#e0e0d8', background: '#f9f9f5' }}
      >
        <div
          className="flex items-center gap-2 font-bold text-base"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}
        >
          <Brain className="h-4 w-4" />
          NeuroScan AI
        </div>
        <div className="text-xs" style={{ color: '#888' }}>© 2026 All Rights Reserved</div>
      </footer>

    </div>
  );
};

export default HomePage;