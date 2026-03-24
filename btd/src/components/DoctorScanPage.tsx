
import PatientRecords from '../utils/PatientRecords';
import React, { useState, useEffect } from 'react';
import { Brain, Zap, ArrowLeft, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { UserButton, useUser, useClerk } from '@clerk/clerk-react';
import FileUpload from './FileUpload';
import ProcessingIndicator from './ProcessingIndicator';
import ImageComparison from './ImageComparison';
import Results from './Results';
import { UploadedFile, DetectionResult, ProcessingState } from '../types';
import { simulateProcessing, downloadReport } from '../utils/mockProcessing';
import { savePatientRecord, getDoctorPatients, updatePatientNotes, PatientRecord } from '../utils/patientService';

if (typeof document !== 'undefined' && !document.getElementById('neuroscan-fonts')) {
  const link = document.createElement('link');
  link.id = 'neuroscan-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
}

interface DoctorScanPageProps {
  onHome: () => void;
}

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #e0e0d8',
  background: '#f9f9f5',
  color: '#0d0d0d',
  fontFamily: "'Manrope', sans-serif",
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
};

const DoctorScanPage: React.FC<DoctorScanPageProps> = ({ onHome }) => {
  const { user } = useUser();
  const { signOut } = useClerk();

  // ── FORM STATES ──
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // ── SCAN STATES ──
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false, progress: 0, stage: ''
  });
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);

  // ── PATIENT HISTORY ──
  const [savedPatients, setSavedPatients] = useState<PatientRecord[]>([]);
  const [showPatients, setShowPatients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [notesSaved, setNotesSaved] = useState(false);

  // ── NAVIGATION ──
  const [showRecords, setShowRecords] = useState(false);

  // Load this doctor's patients on mount
  useEffect(() => {
    if (user?.id) {
      getDoctorPatients(user.id).then(setSavedPatients);
    }
  }, [user]);

  // ── RESET ──
  const resetAnalysis = () => {
    setUploadedFile(null);
    setDetectionResult(null);
    setProcessingState({ isProcessing: false, progress: 0, stage: '' });
    setPatientName('');
    setAge('');
    setGender('');
    setPhone('');
    setNotes('');
    setFormSubmitted(false);
    setLastSavedId(null);
    setNotesSaved(false);
  };

  // ── HANDLE SCAN ──
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

      // ✅ Set result first
      setDetectionResult(result);
      setProcessingState({ isProcessing: false, progress: 100, stage: 'Complete' });

      // ✅ Then save to Firebase and store the returned ID
      if (user?.id && patientName) {
        setSaving(true);
        const savedId = await savePatientRecord({
          doctorId: user.id,
          patientName,
          age,
          gender,
          phone,
          scanDate: new Date().toLocaleString(),
          tumorDetected: result.hasTumor,
          tumorType: (result as any).tumorType,
          confidence: result.confidence,
          notes,
        });
        setLastSavedId(savedId);
        const updated = await getDoctorPatients(user.id);
        setSavedPatients(updated);
        setSaving(false);
      }

    } catch (error) {
      console.error('Processing failed:', error);
      setProcessingState({ isProcessing: false, progress: 0, stage: 'Error' });
    }
  };

  // ── SAVE POST-SCAN NOTES ──
  const handleSaveNotes = async () => {
    if (!lastSavedId || !user?.id) return;
    try {
      await updatePatientNotes(lastSavedId, notes);
      const updated = await getDoctorPatients(user.id);
      setSavedPatients(updated);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleDownload = () => {
    if (uploadedFile && detectionResult) {
      downloadReport('brain-scan-report', detectionResult, uploadedFile);
    }
  };

  // ── SHOW PATIENT RECORDS PAGE ──
  if (showRecords) {
    return <PatientRecords onBack={() => setShowRecords(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Manrope', sans-serif", background: '#f9f9f5' }}>

      {/* ANNOUNCEMENT BAR */}
      {/* <div className="text-center py-2.5 px-4 text-xs" style={{ background: '#0d0d0d', color: '#c8f04e', letterSpacing: '0.04em' }}>
        Doctor Portal — Patient data is private and securely stored. For medical use only.
      </div> */}

      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-4 border-b sticky top-0 z-50" style={{ background: '#f9f9f5', borderColor: '#e0e0d8' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#0d0d0d' }}>
            <Brain className="h-5 w-5" style={{ color: '#c8f04e' }} />
          </div>
          <div>
            <div className="text-2xl font-extrabold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
              NeuroScan AI
            </div>
            <div className="text-xs" style={{ color: '#888' }}>Doctor Portal</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm font-medium hidden sm:block" style={{ color: '#555' }}>
              Welcome, <span style={{ color: '#0d0d0d', fontWeight: 700 }}>Dr. {user.firstName || user.username}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs" style={{ color: '#2d9c2d' }}>
            <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: '#2d9c2d' }} />
            System Online
          </div>
          <button
  onClick={async () => {
    await signOut();
    sessionStorage.removeItem('neuroscan-page');
    onHome();
  }}
  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
  style={{ background: 'transparent', color: '#0d0d0d', border: '1.5px solid #ccc' }}
  onMouseEnter={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
  onMouseLeave={e => (e.currentTarget.style.borderColor = '#ccc')}
>
  <ArrowLeft className="h-4 w-4" /> Home
</button>
          <button
            onClick={() => setShowRecords(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
            style={{ background: '#e8eeff', color: '#3b5bdb', border: '1.5px solid #c7d7ff' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3b5bdb'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#e8eeff'; e.currentTarget.style.color = '#3b5bdb'; }}
          >
            <ClipboardList className="h-4 w-4" /> Patient Records
          </button>
          <UserButton />
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-10">

        {/* Page title */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#888', letterSpacing: '0.12em' }}>Doctor Portal</p>
          <h2 className="font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 2vw, 42px)', letterSpacing: '-0.02em', color: '#0d0d0d' }}>
            AI-Powered{' '}
            <span className="relative inline-block">
              Brain Tumor Detection
              <span className="absolute left-0 bottom-1 w-full rounded-sm" style={{ background: '#c8f04e', height: '10px', display: 'block', zIndex: -1 }} />
            </span>
          </h2>
          <p className="text-base" style={{ color: '#666', fontWeight: 300 }}>
            Fill in patient details, upload the scan, and results are saved automatically.
          </p>
        </div>

        {/* ── PATIENT FORM ── */}
        {!formSubmitted ? (
          <div className="rounded-2xl border p-7 mb-8" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
            <h3 className="text-base font-bold mb-5 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
              <ClipboardList className="h-5 w-5" style={{ color: '#3b5bdb' }} />
              Patient Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#555' }}>
                  Patient Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="Enter full name"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e0e0d8')}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#555' }}>
                  Age <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="Age in years"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e0e0d8')}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#555' }}>Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e0e0d8')}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#555' }}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Contact number"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#e0e0d8')}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#555' }}>Doctor's Notes (pre-scan)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any observations, symptoms or notes before scanning..."
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
                onBlur={e => (e.currentTarget.style.borderColor = '#e0e0d8')}
              />
            </div>

            <button
              onClick={() => {
                if (!patientName.trim() || !age.trim()) {
                  alert('Please enter patient name and age to continue.');
                  return;
                }
                setFormSubmitted(true);
              }}
              className="px-7 py-3 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ background: '#0d0d0d', color: '#f9f9f5', border: '2px solid #0d0d0d' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#c8f04e'; el.style.color = '#0d0d0d'; el.style.borderColor = '#c8f04e'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#0d0d0d'; el.style.color = '#f9f9f5'; el.style.borderColor = '#0d0d0d'; }}
            >
              Continue to Scan →
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border p-4 mb-8 flex items-center justify-between flex-wrap gap-3"
            style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div className="flex items-center gap-3 flex-wrap text-sm" style={{ color: '#166534' }}>
              <span className="text-lg">✅</span>
              <span className="font-bold">{patientName}</span>
              <span>· Age: {age}</span>
              {gender && <span>· {gender}</span>}
              {phone && <span>· {phone}</span>}
              <span style={{ color: '#888' }}>· {new Date().toLocaleString()}</span>
            </div>
            <button
              onClick={() => setFormSubmitted(false)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}
            >
              ✏️ Edit
            </button>
          </div>
        )}

        {/* Saving indicator */}
        {saving && (
          <div className="mb-4 text-sm font-medium flex items-center gap-2" style={{ color: '#3b5bdb' }}>
            <span className="animate-spin">⏳</span> Saving patient record to database...
          </div>
        )}

        {/* Record saved confirmation */}
        {lastSavedId && !saving && (
          <div className="mb-4 text-sm font-medium flex items-center gap-2" style={{ color: '#16a34a' }}>
            ✅ Patient record saved successfully to database!
          </div>
        )}

        {/* ── SCAN GRID (only after form submitted) ── */}
        {formSubmitted && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT */}
            <div className="space-y-6">
              <div className="rounded-2xl border" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                <FileUpload onFileUpload={handleFileUpload} uploadedFile={uploadedFile} isProcessing={processingState.isProcessing} />
              </div>

              {processingState.isProcessing && (
                <div className="rounded-2xl border" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <ProcessingIndicator processingState={processingState} />
                </div>
              )}

              {detectionResult && uploadedFile && (
                <div className="rounded-2xl border" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <Results detectionResult={detectionResult} originalFile={uploadedFile} onDownload={handleDownload} />
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {detectionResult && uploadedFile && (
                <div className="rounded-2xl border" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <ImageComparison originalFile={uploadedFile} detectionResult={detectionResult} />
                </div>
              )}

              {/* Post-Scan Notes — shown after scan */}
              {detectionResult && (
                <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <h3 className="text-base font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
                    📝 Post-Scan Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={e => { setNotes(e.target.value); setNotesSaved(false); }}
                    placeholder="Add clinical observations or recommendations..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none transition-all duration-200"
                    style={{ border: '1.5px solid #e0e0d8', background: '#f9f9f5', color: '#0d0d0d', fontFamily: "'Manrope', sans-serif" }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#e0e0d8')}
                  />
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={handleSaveNotes}
                      className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                      style={{ background: '#0d0d0d', color: '#f9f9f5', border: '2px solid #0d0d0d' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#c8f04e'; e.currentTarget.style.color = '#0d0d0d'; e.currentTarget.style.borderColor = '#c8f04e'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#0d0d0d'; e.currentTarget.style.color = '#f9f9f5'; e.currentTarget.style.borderColor = '#0d0d0d'; }}
                    >
                      💾 Save Notes
                    </button>
                    {notesSaved && (
                      <span className="text-sm font-medium" style={{ color: '#16a34a' }}>
                        ✅ Notes saved!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* How it works — before upload */}
              {!uploadedFile && (
                <div className="rounded-2xl border p-8" style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: '#e8eeff' }}>
                    <svg className="h-8 w-8" style={{ color: '#3b5bdb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>How it works</h3>
                  <div className="space-y-5">
                    {[
                      { n: '1', text: 'Fill in patient details and click Continue' },
                      { n: '2', text: "Upload the patient's brain scan (MRI, CT, or X-ray)" },
                      { n: '3', text: 'AI analyzes the scan for potential abnormalities' },
                      { n: '4', text: 'Results auto-saved — add post-scan notes and save' },
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
                    {[{ value: '88%', label: 'Accuracy' }, { value: '4', label: 'Tumor Classes' }, { value: '5600+', label: 'Images' }].map(s => (
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
        )}

        {/* Reset button */}
        {detectionResult && (
          <div className="mt-10 text-center">
            <button
              onClick={resetAnalysis}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ background: '#0d0d0d', color: '#f9f9f5', border: '2px solid #0d0d0d' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#c8f04e'; el.style.color = '#0d0d0d'; el.style.borderColor = '#c8f04e'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#0d0d0d'; el.style.color = '#f9f9f5'; el.style.borderColor = '#0d0d0d'; }}
            >
              <Zap className="h-4 w-4" /> Analyze Another Patient
            </button>
          </div>
        )}

        {/* ── PATIENT HISTORY TABLE ── */}
        {savedPatients.length > 0 && (
          <div className="mt-12">
            <button
              onClick={() => setShowPatients(!showPatients)}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl mb-4 transition-all duration-200"
              style={{ background: '#e8eeff', color: '#3b5bdb', border: '1.5px solid #c7d7ff' }}
            >
              {showPatients ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Patient History ({savedPatients.length} records)
            </button>

            {showPatients && (
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ background: '#0d0d0d' }}>
                      <tr>
                        {['Patient Name', 'Age', 'Gender', 'Phone', 'Scan Date & Time', 'Result', 'Confidence', 'Notes'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {savedPatients.map((p, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #e0e0d8', background: i % 2 === 0 ? '#ffffff' : '#f9f9f5' }}>
                          <td className="px-4 py-3 font-semibold" style={{ color: '#0d0d0d' }}>{p.patientName}</td>
                          <td className="px-4 py-3" style={{ color: '#555' }}>{p.age}</td>
                          <td className="px-4 py-3" style={{ color: '#555' }}>{p.gender || '—'}</td>
                          <td className="px-4 py-3" style={{ color: '#555' }}>{p.phone || '—'}</td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#888' }}>{p.scanDate}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                              style={{ background: p.tumorDetected ? '#fee2e2' : '#dcfce7', color: p.tumorDetected ? '#dc2626' : '#16a34a' }}>
                              {p.tumorDetected ? `⚠ ${p.tumorType || 'Tumor'}` : '✓ No Tumor'}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ color: '#555' }}>
                            {p.confidence ? `${Number(p.confidence).toFixed(1)}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-xs max-w-xs truncate" style={{ color: '#888' }}>{p.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="flex items-center justify-between px-10 py-5 border-t mt-8" style={{ borderColor: '#e0e0d8', background: '#f9f9f5' }}>
        <div className="flex items-center gap-2 font-bold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
          <Brain className="h-4 w-4" /> NeuroScan AI — Doctor Portal
        </div>
        <div className="text-xs" style={{ color: '#888' }}>© 2026 All Rights Reserved</div>
      </footer>

    </div>
  );
};

export default DoctorScanPage;