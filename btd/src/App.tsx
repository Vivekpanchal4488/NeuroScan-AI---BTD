// Wake up API on page load
fetch('https://brain-tumor-api-m3x7.onrender.com/')
  .then(() => console.log('API warmed up!'))
  .catch(() => console.log('API warming up...'));
import DoctorScanPage from './components/DoctorScanPage';
import HomePage from './components/HomePage';
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Brain, Zap, ArrowLeft } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ProcessingIndicator from './components/ProcessingIndicator';
import ImageComparison from './components/ImageComparison';
import Results from './components/Results';
import { UploadedFile, DetectionResult, ProcessingState } from './types';
import { simulateProcessing, downloadReport } from './utils/mockProcessing';
import { useClerk, useAuth, UserButton } from '@clerk/clerk-react';

fetch('https://brain-tumor-api-m3x7.onrender.com/').catch(() => {});

// Inject fonts once
if (typeof document !== 'undefined' && !document.getElementById('neuroscan-fonts')) {
  const link = document.createElement('link');
  link.id = 'neuroscan-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
}

function App() {

  // ── ALL HOOKS FIRST ──
  const { addListener } = useClerk();
  const { isSignedIn } = useAuth();

  const [showHome, setShowHome] = useState(() => {
    return sessionStorage.getItem('neuroscan-page') !== 'scan' &&
           sessionStorage.getItem('neuroscan-page') !== 'doctor';
  });

  const [isDoctor, setIsDoctor] = useState(() => {
    return sessionStorage.getItem('neuroscan-page') === 'doctor';
  });

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: ''
  });
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);

  // ── ALL FUNCTIONS ──
  const resetAnalysis = () => {
    setUploadedFile(null);
    setDetectionResult(null);
    setProcessingState({ isProcessing: false, progress: 0, stage: '' });
  };

  const handleFileUpload = async (file: UploadedFile) => {
    if (!file) {
      setUploadedFile(null);
      setDetectionResult(null);
      setProcessingState({ isProcessing: false, progress: 0, stage: '' });
      return;
    }
    setUploadedFile(file);
    setDetectionResult(null);
    setProcessingState({ isProcessing: true, progress: 0, stage: 'Initializing...' });
    try {
      const result = await simulateProcessing(file.file, (progress, stage) => {
        setProcessingState({ isProcessing: true, progress, stage });
      });
      setDetectionResult(result);
      setProcessingState({ isProcessing: false, progress: 100, stage: 'Complete' });
    } catch (error) {
      console.error('Processing failed:', error);
      setProcessingState({ isProcessing: false, progress: 0, stage: 'Error' });
    }
  };

  const handleDownload = () => {
    if (uploadedFile && detectionResult) {
      downloadReport('brain-scan-report', detectionResult, uploadedFile);
    }
  };

  // ── ALL EFFECTS ──

  // Sign out listener — clear session when user signs out
  useEffect(() => {
    const unlisten = addListener(({ user }) => {
      if (!user) {
        sessionStorage.removeItem('neuroscan-page');
        setShowHome(true);
        setIsDoctor(false);
        resetAnalysis();
      }
    });
    return () => unlisten();
  }, []);

  // If auth state becomes false (signed out), go home
  useEffect(() => {
    if (isSignedIn === false) {
      sessionStorage.removeItem('neuroscan-page');
      setShowHome(true);
      setIsDoctor(false);
      resetAnalysis();
    }
  }, [isSignedIn]);

  // Keep API awake every 10 minutes
  useEffect(() => {
    const keepAwake = setInterval(() => {
      fetch('https://brain-tumor-api-m3x7.onrender.com/').catch(() => {});
    }, 600000);
    return () => clearInterval(keepAwake);
  }, []);

  // ── ROUTING ──

  // Show homepage
  if (showHome) {
    return (
      <HomePage
        onGuestAccess={() => {
          sessionStorage.setItem('neuroscan-page', 'scan');
          setShowHome(false);
          setIsDoctor(false);
        }}
        onDoctorAccess={() => {
          sessionStorage.setItem('neuroscan-page', 'doctor');
          setShowHome(false);
          setIsDoctor(true);
        }}
      />
    );
  }

  // Show doctor scan page (logged in)
  if (isDoctor) {
    return (
      <DoctorScanPage
        onHome={() => {
          sessionStorage.removeItem('neuroscan-page');
          setShowHome(true);
          setIsDoctor(false);
          resetAnalysis();
        }}
      />
    );
  }

  // Show guest scan page
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Manrope', sans-serif", background: '#f9f9f5' }}>

        {/* ── ANNOUNCEMENT BAR ── */}
        {/* <div
          className="text-center py-2.5 px-4 text-xs"
          style={{ background: '#0d0d0d', color: '#c8f04e', letterSpacing: '0.04em' }}
        >
          NeuroScan AI — For informational purposes only. Always consult a qualified physician for diagnosis.
        </div> */}

        {/* ── HEADER ── */}
        <header
          className="flex items-center justify-between px-8 py-4 border-b sticky top-0 z-50"
          style={{ background: '#f9f9f5', borderColor: '#e0e0d8' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#0d0d0d' }}>
              <Brain className="h-5 w-5" style={{ color: '#c8f04e' }} />
            </div>
            <div>
              <div className="text-2xl font-extrabold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
                NeuroScan AI
              </div>
              <div className="text-xs" style={{ color: '#888' }}>Brain Tumor Detection System</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs" style={{ color: '#2d9c2d' }}>
              <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: '#2d9c2d' }} />
              System Online
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('neuroscan-page');
                setShowHome(true);
                resetAnalysis();
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
              style={{ background: 'transparent', color: '#0d0d0d', border: '1.5px solid #ccc' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#ccc')}
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </button>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-10">

          <div className="mb-10 pt-1">
            <p className="text-xs font-semibold uppercase mb-3" style={{ color: '#888', letterSpacing: '0.12em' }}>Quick Analysis</p>
            <h2
              className="font-extrabold mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', letterSpacing: '-0.02em', color: '#0d0d0d' }}
            >
              AI-Powered Brain{' '}
              <span className="relative inline-block">
                Tumor Detection
                <span className="absolute left-0 bottom-1 w-full rounded-sm" style={{ background: '#c8f04e', height: '10px', display: 'block', zIndex: -1 }} />
              </span>
            </h2>
            <p className="text-base" style={{ color: '#666', fontWeight: 300 }}>
              Upload your brain scan for advanced AI analysis and tumor detection
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div className="space-y-6">
              <div className="rounded-2xl border p-1" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                <FileUpload
                  onFileUpload={handleFileUpload}
                  uploadedFile={uploadedFile}
                  isProcessing={processingState.isProcessing}
                />
              </div>

              {processingState.isProcessing && (
                <div className="rounded-2xl border p-1" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <ProcessingIndicator processingState={processingState} />
                </div>
              )}

              {detectionResult && uploadedFile && (
                <div className="rounded-2xl border p-1" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <Results
                    detectionResult={detectionResult}
                    originalFile={uploadedFile}
                    onDownload={handleDownload}
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              {detectionResult && uploadedFile && (
                <div className="rounded-2xl border p-1" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <ImageComparison
                    originalFile={uploadedFile}
                    detectionResult={detectionResult}
                  />
                </div>
              )}

              {!uploadedFile && (
                <div className="rounded-2xl border p-8" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: '#e8eeff' }}>
                    <svg className="h-8 w-8" style={{ color: '#3b5bdb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
                    How it works
                  </h3>
                  <div className="space-y-5">
                    {[
                      { n: '1', text: 'Upload your brain scan image (MRI, CT, or X-ray)' },
                      { n: '2', text: 'Our AI analyzes the scan for potential abnormalities' },
                      { n: '3', text: 'Get detailed results with confidence levels and tumor area measurements' },
                    ].map(step => (
                      <div key={step.n} className="flex items-start gap-4">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: '#e8eeff', color: '#3b5bdb' }}>
                          {step.n}
                        </div>
                        <p className="text-sm pt-0.5 leading-relaxed" style={{ color: '#555' }}>{step.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 rounded-xl p-5 grid grid-cols-3 gap-2 text-center" style={{ background: '#0d0d0d' }}>
                    {[
                      { value: '88%', label: 'Accuracy' },
                      { value: '4', label: 'Tumor Classes' },
                      { value: '5600+', label: 'Images' },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="font-extrabold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#c8f04e' }}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {detectionResult && (
            <div className="mt-10 text-center">
              <button
                onClick={resetAnalysis}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{ background: '#0d0d0d', color: '#f9f9f5', border: '2px solid #0d0d0d' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#c8f04e'; el.style.color = '#0d0d0d'; el.style.borderColor = '#c8f04e'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#0d0d0d'; el.style.color = '#f9f9f5'; el.style.borderColor = '#0d0d0d'; }}
              >
                <Zap className="h-4 w-4" /> Analyze Another Scan
              </button>
            </div>
          )}
        </main>

        {/* ── FOOTER ── */}
        <footer className="flex items-center justify-between px-10 py-5 border-t mt-8" style={{ borderColor: '#e0e0d8', background: '#f9f9f5' }}>
          <div className="flex items-center gap-2 font-bold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
            <Brain className="h-4 w-4" />
            NeuroScan AI
          </div>
          <div className="text-xs" style={{ color: '#888' }}>© 2026 All Rights Reserved</div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;