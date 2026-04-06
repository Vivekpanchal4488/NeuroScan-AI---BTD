import React, { useState, useEffect } from 'react';
import { Brain, ArrowLeft, Search, ChevronDown, ChevronUp, Trash2, Printer, FileDown } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { getDoctorPatients, deletePatientRecord, PatientRecord } from '../utils/patientService';

if (typeof document !== 'undefined' && !document.getElementById('neuroscan-fonts')) {
  const link = document.createElement('link');
  link.id = 'neuroscan-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
}

interface PatientRecordsProps {
  onBack: () => void;
}

// ── PDF GENERATOR ──
const generatePDF = (patients: PatientRecord[], doctorName: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tumorCount = patients.filter(p => p.tumorDetected).length;
  const clearCount = patients.filter(p => !p.tumorDetected).length;

  const rows = patients.map((p, i) => `
    <tr style="background: ${i % 2 === 0 ? '#fff' : '#f9f9f9'}; border-bottom: 1px solid #e0e0d8;">
      <td style="padding: 10px 12px; font-size: 12px; color: #999;">${i + 1}</td>
      <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #0d0d0d;">${p.patientName}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #555;">${p.age}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #555;">${p.gender || '—'}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #555;">${p.phone || '—'}</td>
      <td style="padding: 10px 12px; font-size: 12px; color: #888;">${p.scanDate}</td>
      <td style="padding: 10px 12px;">
        <span style="
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: ${p.tumorDetected ? '#fee2e2' : '#dcfce7'};
          color: ${p.tumorDetected ? '#dc2626' : '#16a34a'};
        ">
          ${p.tumorDetected ? `⚠ ${p.tumorType || 'Tumor'}` : '✓ No Tumor'}
        </span>
      </td>
      <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: ${p.tumorDetected ? '#dc2626' : '#16a34a'};">
        ${p.confidence ? `${Number(p.confidence).toFixed(1)}%` : '—'}
      </td>
      <td style="padding: 10px 12px; font-size: 12px; color: #888; max-width: 150px;">${p.notes || '—'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Patient Records — TumorTrace</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Manrope', sans-serif; background: #fff; color: #0d0d0d; padding: 32px; }
        @media print {
          body { padding: 16px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #0d0d0d;">
        <div style="display:flex; align-items:center; gap: 12px;">
          <div style="width:40px; height:40px; background:#0d0d0d; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain h-4 w-4 sm:h-5 sm:w-5" style="color: rgb(200, 240, 78);"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path><path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path></svg></div>
          <div>
            <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:20px; font-weight:800;">TumorTrace</div>
            <div style="font-size:11px; color:#888;">Patient Records Report</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px; color:#555;">Dr. ${doctorName}</div>
          <div style="font-size:11px; color:#888;">Generated: ${new Date().toLocaleString()}</div>
        </div>
      </div>

      <!-- Stats -->
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-bottom:24px;">
        <div style="background:#e8eeff; border-radius:12px; padding:14px; text-align:center;">
          <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:28px; font-weight:800; color:#3b5bdb;">${patients.length}</div>
          <div style="font-size:11px; color:#555; margin-top:2px;">Total Patients</div>
        </div>
        <div style="background:#fee2e2; border-radius:12px; padding:14px; text-align:center;">
          <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:28px; font-weight:800; color:#dc2626;">${tumorCount}</div>
          <div style="font-size:11px; color:#555; margin-top:2px;">Tumor Detected</div>
        </div>
        <div style="background:#dcfce7; border-radius:12px; padding:14px; text-align:center;">
          <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:28px; font-weight:800; color:#16a34a;">${clearCount}</div>
          <div style="font-size:11px; color:#555; margin-top:2px;">No Tumor</div>
        </div>
      </div>

      <!-- Table -->
      <table style="width:100%; border-collapse:collapse; border-radius:12px; overflow:hidden; border: 1px solid #e0e0d8;">
        <thead>
          <tr style="background:#0d0d0d;">
            ${['#','Patient Name','Age','Gender','Phone','Scan Date','Result','Confidence','Notes'].map(h =>
              `<th style="padding:10px 12px; text-align:left; font-size:11px; font-weight:600; color:rgba(255,255,255,0.6); white-space:nowrap;">${h}</th>`
            ).join('')}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <!-- Footer -->
      <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e0e0d8; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:11px; color:#888;">TumorTrace — For medical use only. Results should be reviewed by a qualified physician.</div>
        <div style="font-size:11px; color:#888;">© 2026 All Rights Reserved</div>
      </div>

      <div class="no-print" style="margin-top:24px; text-align:center;">
        <button onclick="window.print()" style="
          background:#0d0d0d; color:#fff; border:none; padding:12px 28px;
          border-radius:8px; font-size:14px; font-weight:600; cursor:pointer;
          font-family:'Manrope',sans-serif;
        ">🖨️ Print / Save as PDF</button>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 800);
};

const PatientRecords: React.FC<PatientRecordsProps> = ({ onBack }) => {
  const { user } = useUser();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'tumor' | 'clear'>('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      getDoctorPatients(user.id).then(data => {
        setPatients(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleDelete = async (patientId: string) => {
    if (!patientId) return;
    setDeletingId(patientId);
    await deletePatientRecord(patientId);
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const filtered = patients.filter(p => {
    const matchSearch =
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search);
    const matchFilter =
      filter === 'all' ? true :
      filter === 'tumor' ? p.tumorDetected :
      !p.tumorDetected;
    return matchSearch && matchFilter;
  });

  const tumorCount = patients.filter(p => p.tumorDetected).length;
  const clearCount = patients.filter(p => !p.tumorDetected).length;
  const doctorName = user?.firstName || user?.username || 'Doctor';

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Manrope', sans-serif", background: '#f9f9f5' }}>

      {/* ANNOUNCEMENT BAR */}
      {/* <div className="text-center py-2.5 px-4 text-xs" style={{ background: '#0d0d0d', color: '#c8f04e', letterSpacing: '0.04em' }}>
        Doctor Portal — Patient Records are private and securely stored.
      </div> */}

      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-4 border-b sticky top-0 z-50" style={{ background: '#f9f9f5', borderColor: '#e0e0d8' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#0d0d0d' }}>
            <Brain className="h-5 w-5" style={{ color: '#c8f04e' }} />
          </div>
          <div>
            <div className="text-2xl font-extrabold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
              TumorTrace
            </div>
            <div className="text-xs" style={{ color: '#888' }}>Patient Records</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm font-medium hidden sm:block" style={{ color: '#555' }}>
              Dr. <span style={{ color: '#0d0d0d', fontWeight: 700 }}>{doctorName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs" style={{ color: '#2d9c2d' }}>
            <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: '#2d9c2d' }} />
            System Online
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
            style={{ background: 'transparent', color: '#0d0d0d', border: '1.5px solid #ccc' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#0d0d0d')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#ccc')}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Scan
          </button>
          <UserButton />
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-10 py-10">

        {/* Title + PDF button */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase mb-2" style={{ color: '#888', letterSpacing: '0.12em' }}>Doctor Portal</p>
            <h2 className="font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 3vw, 42px)', letterSpacing: '-0.02em', color: '#0d0d0d' }}>
              Patient{' '}
              <span className="relative inline-block">
                Records
                <span className="absolute left-0 bottom-1 w-full rounded-sm" style={{ background: '#c8f04e', height: '10px', display: 'block', zIndex: -1 }} />
              </span>
            </h2>
            <p className="text-base" style={{ color: '#666', fontWeight: 300 }}>
              All scans and patient data saved under your account.
            </p>
          </div>

          {/* PDF Export button */}
          {patients.length > 0 && (
            <button
              onClick={() => generatePDF(filtered.length > 0 ? filtered : patients, doctorName)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ background: '#0d0d0d', color: '#f9f9f5', border: '2px solid #0d0d0d' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#c8f04e'; e.currentTarget.style.color = '#0d0d0d'; e.currentTarget.style.borderColor = '#c8f04e'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0d0d0d'; e.currentTarget.style.color = '#f9f9f5'; e.currentTarget.style.borderColor = '#0d0d0d'; }}
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </button>
          )}
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Patients', value: patients.length, color: '#3b5bdb', bg: '#e8eeff' },
            { label: 'Tumor Detected', value: tumorCount, color: '#dc2626', bg: '#fee2e2' },
            { label: 'No Tumor', value: clearCount, color: '#16a34a', bg: '#dcfce7' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-5 flex items-center gap-4"
              style={{ background: '#fff', borderColor: '#e0e0d8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                <span className="font-extrabold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: s.color }}>
                  {s.value}
                </span>
              </div>
              <div className="text-sm font-semibold" style={{ color: '#555' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1 min-w-48 px-4 py-2.5 rounded-xl"
            style={{ background: '#fff', border: '1.5px solid #e0e0d8' }}>
            <Search className="h-4 w-4 flex-shrink-0" style={{ color: '#888' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by patient name or phone..."
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: '#0d0d0d', fontFamily: "'Manrope', sans-serif" }}
            />
          </div>
          {[
            { label: 'All', value: 'all' },
            { label: '⚠ Tumor', value: 'tumor' },
            { label: '✓ Clear', value: 'clear' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: filter === f.value ? '#0d0d0d' : '#fff',
                color: filter === f.value ? '#f9f9f5' : '#555',
                border: `1.5px solid ${filter === f.value ? '#0d0d0d' : '#e0e0d8'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* DELETE CONFIRM MODAL */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="rounded-2xl p-8 max-w-sm w-full mx-4" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🗑️</div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Delete Record?</h3>
                <p className="text-sm" style={{ color: '#666' }}>This will permanently delete this patient record from the database. This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#f9f9f5', color: '#0d0d0d', border: '1.5px solid #e0e0d8' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#dc2626', color: '#fff', border: 'none' }}
                >
                  {deletingId === confirmDelete ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLE */}
        {loading ? (
          <div className="text-center py-20" style={{ color: '#888' }}>
            <div className="text-3xl mb-3">⏳</div>
            <div className="text-sm font-medium">Loading patient records...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border" style={{ background: '#fff', borderColor: '#e0e0d8' }}>
            <div className="text-4xl mb-3">📋</div>
            <div className="text-base font-semibold mb-1" style={{ color: '#0d0d0d' }}>No records found</div>
            <div className="text-sm" style={{ color: '#888' }}>
              {search ? 'Try a different search term.' : 'Scan a patient to create the first record.'}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#e0e0d8', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: '#0d0d0d' }}>
                  <tr>
                    {['#', 'Patient Name', 'Age', 'Gender', 'Phone', 'Scan Date & Time', 'Result', 'Confidence', 'Notes', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"
                        style={{ color: 'rgba(255,255,255,0.55)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <React.Fragment key={p.id || i}>
                      <tr
                        style={{ borderTop: '1px solid #e0e0d8', background: i % 2 === 0 ? '#ffffff' : '#f9f9f5', cursor: 'pointer' }}
                        onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                      >
                        <td className="px-4 py-3 text-xs" style={{ color: '#bbb' }}>{i + 1}</td>
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
                        <td className="px-4 py-3 font-semibold" style={{ color: p.tumorDetected ? '#dc2626' : '#16a34a' }}>
                          {p.confidence ? `${Number(p.confidence).toFixed(1)}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs max-w-xs truncate" style={{ color: '#888' }}>{p.notes || '—'}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {/* Print single record */}
                            <button
                              onClick={() => generatePDF([p], doctorName)}
                              className="p-1.5 rounded-lg transition-all duration-200"
                              style={{ background: '#e8eeff', color: '#3b5bdb' }}
                              title="Print record"
                              onMouseEnter={e => (e.currentTarget.style.background = '#3b5bdb', e.currentTarget.style.color = '#fff')}
                              onMouseLeave={e => (e.currentTarget.style.background = '#e8eeff', e.currentTarget.style.color = '#3b5bdb')}
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => p.id && setConfirmDelete(p.id)}
                              className="p-1.5 rounded-lg transition-all duration-200"
                              style={{ background: '#fee2e2', color: '#dc2626' }}
                              title="Delete record"
                              onMouseEnter={e => (e.currentTarget.style.background = '#dc2626', e.currentTarget.style.color = '#fff')}
                              onMouseLeave={e => (e.currentTarget.style.background = '#fee2e2', e.currentTarget.style.color = '#dc2626')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            {/* Expand */}
                            {expandedRow === i
                              ? <ChevronUp className="h-4 w-4" style={{ color: '#888' }} />
                              : <ChevronDown className="h-4 w-4" style={{ color: '#888' }} />}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row */}
                      {expandedRow === i && (
                        <tr style={{ background: '#f0f4ff', borderTop: '1px solid #e0e0d8' }}>
                          <td colSpan={10} className="px-6 py-5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {[
                                { label: 'Full Name', value: p.patientName },
                                { label: 'Age', value: p.age },
                                { label: 'Gender', value: p.gender || '—' },
                                { label: 'Phone', value: p.phone || '—' },
                                { label: 'Scan Date', value: p.scanDate },
                                { label: 'Tumor Type', value: p.tumorType || '—' },
                                { label: 'Confidence', value: p.confidence ? `${Number(p.confidence).toFixed(1)}%` : '—' },
                                { label: 'Result', value: p.tumorDetected ? '⚠ Tumor Detected' : '✓ No Tumor' },
                              ].map(d => (
                                <div key={d.label}>
                                  <div className="text-xs font-semibold mb-1" style={{ color: '#888' }}>{d.label}</div>
                                  <div className="text-sm font-semibold" style={{ color: '#0d0d0d' }}>{d.value}</div>
                                </div>
                              ))}
                            </div>
                            {p.notes && (
                              <div>
                                <div className="text-xs font-semibold mb-1" style={{ color: '#888' }}>Doctor's Notes</div>
                                <div className="text-sm p-3 rounded-lg" style={{ background: '#fff', border: '1px solid #e0e0d8', color: '#555' }}>
                                  {p.notes}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="flex items-center justify-between px-10 py-5 border-t mt-8" style={{ borderColor: '#e0e0d8', background: '#f9f9f5' }}>
        <div className="flex items-center gap-2 font-bold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0d0d0d' }}>
          <Brain className="h-4 w-4" /> TumorTrace — Patient Records
        </div>
        <div className="text-xs" style={{ color: '#888' }}>© 2026 All Rights Reserved</div>
      </footer>
    </div>
  );
};

export default PatientRecords;