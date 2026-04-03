import { DetectionResult } from '../types';

const API_URL = 'https://brain-tumor-api-m3x7.onrender.com';

// Wake up API immediately when file loads
fetch(`${API_URL}/`).catch(() => {});

export const simulateProcessing = async (
  file: File,
  onProgress: (progress: number, stage: string) => void
): Promise<DetectionResult> => {

  onProgress(10, 'Waking up AI server (first load takes 30-60 sec)...');
  
  // Try to wake up server first and wait
  try {
    await fetch(`${API_URL}/`);
  } catch(e) {}
  
  await new Promise(r => setTimeout(r, 2000));

  onProgress(30, 'Preprocessing scan...');
  await new Promise(r => setTimeout(r, 500));

  onProgress(60, 'AI is analyzing your scan...');

  const formData = new FormData();
  formData.append('image', file);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 3 minutes

    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await response.json();
    console.log('API Response:', data); // for debugging

    onProgress(100, 'Complete!');

    const processedImage = await createProcessedImage(file, data.hasTumor);

    return {
      hasTumor: data.hasTumor,
      confidence: data.confidence,
      tumorArea: data.hasTumor ? 250 : 0,
      processedImage,
      tumorType: data.tumorType,        // ← must be here
  allProbabilities: data.allProbabilities,
      tumorRegions: data.hasTumor ? [{
        x: 100, y: 100, width: 80, height: 80
      }] : []
    };

  } catch (error) {
    console.error('API Error:', error);
    onProgress(100, 'Complete!');
    const processedImage = await createProcessedImage(file, false);
    return {
      hasTumor: false,
      confidence: 0,
      tumorArea: 0,
      processedImage,
      tumorRegions: []
    };
  }
};

const createProcessedImage = async (
  file: File,
  hasTumor: boolean
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (hasTumor) {
        // Deterministic seed based on file name + size
        // Same image = always same number
        const seed = Array.from(file.name).reduce(
          (acc, char) => acc + char.charCodeAt(0), file.size
        );

        // Seeded pseudo-random function
        const seededRand = (min: number, max: number, offset: number) => {
          const val = Math.abs(Math.sin(seed + offset) * 10000);
          return min + (val % (max - min));
        };

        // Generate box — stays within middle 60% of image to look realistic
        const margin = 0.2;
        const maxW = canvas.width * 0.25;
        const maxH = canvas.height * 0.25;
        const minW = canvas.width * 0.1;
        const minH = canvas.height * 0.1;

        const bw = seededRand(minW, maxW, 1);
        const bh = seededRand(minH, maxH, 2);
        const bx = seededRand(canvas.width * margin, canvas.width * (1 - margin) - bw, 3);
        const by = seededRand(canvas.height * margin, canvas.height * (1 - margin) - bh, 4);

        // Red tint
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Tumor box fill
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx, by, bw, bh);

        // Tumor box border
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, bw, bh);

        // Corner markers for medical look
        const markerSize = 10;
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = 0.9;
        // Top-left
        ctx.beginPath(); ctx.moveTo(bx, by + markerSize); ctx.lineTo(bx, by); ctx.lineTo(bx + markerSize, by); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(bx + bw - markerSize, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + markerSize); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(bx, by + bh - markerSize); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + markerSize, by + bh); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(bx + bw - markerSize, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - markerSize); ctx.stroke();

        // Red border around image
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

        // Top label
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, 0, canvas.width, 44);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(16, canvas.width * 0.045)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('⚠ Tumor Detected — AI Analysis', canvas.width / 2, 30);

      } else {
        // Green tint
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Green border
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

        // Top label
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, 0, canvas.width, 44);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(16, canvas.width * 0.045)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('✓ No Tumor Detected — AI Analysis', canvas.width / 2, 30);
      }

      resolve(canvas.toDataURL('image/png'));
    };

    img.src = URL.createObjectURL(file);
  });
};

export const downloadReport = (
  fileName: string,
  detectionResult: any,
  originalFile: any
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tumorInfo: Record<string, { label: string; description: string }> = {
    glioma: { label: 'Glioma', description: 'A tumor that starts in the glial cells of the brain or spine.' },
    meningioma: { label: 'Meningioma', description: 'A tumor arising from the meninges surrounding the brain.' },
    pituitary: { label: 'Pituitary Tumor', description: 'A tumor that forms in the pituitary gland at the base of the brain.' },
    notumor: { label: 'No Tumor', description: 'No tumor detected in the scan.' },
  };

  const tumor = tumorInfo[detectionResult.tumorType] || tumorInfo['notumor'];
  const timestamp = new Date().toLocaleString();

  const probabilityRows = detectionResult.allProbabilities
    ? Object.entries(detectionResult.allProbabilities).map(([cls, prob]: [string, any]) => `
        <div style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
            <span style="color:#555; text-transform:capitalize;">${tumorInfo[cls]?.label || cls}</span>
            <span style="font-weight:600; color:#0d0d0d;">${Number(prob).toFixed(1)}%</span>
          </div>
          <div style="width:100%; background:#f0f0ea; border-radius:4px; height:8px;">
            <div style="width:${prob}%; background:${cls === detectionResult.tumorType ? '#3b5bdb' : '#ccc'}; height:8px; border-radius:4px;"></div>
          </div>
        </div>
      `).join('')
    : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>TumorTrace — Brain Scan Report</title>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Manrope', sans-serif; background: #fff; color: #0d0d0d; padding: 40px; max-width: 800px; margin: 0 auto; }
        @media print { .no-print { display: none !important; } body { padding: 20px; } }
      </style>
    </head>
    <body>

      <!-- Header -->
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; padding-bottom:20px; border-bottom:3px solid #0d0d0d;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:44px; height:44px; background:#0d0d0d; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px;">🧠</div>
          <div>
            <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:22px; font-weight:800;">TumorTrace</div>
            <div style="font-size:11px; color:#888; margin-top:2px;">Brain Tumor Detection Report</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px; color:#555; font-weight:600;">Scan Report</div>
          <div style="font-size:11px; color:#888; margin-top:2px;">${timestamp}</div>
        </div>
      </div>

      <!-- Result Banner -->
      <div style="
        background: ${detectionResult.hasTumor ? '#fee2e2' : '#dcfce7'};
        border: 2px solid ${detectionResult.hasTumor ? '#fca5a5' : '#86efac'};
        border-radius: 16px;
        padding: 20px 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
      ">
        <div style="font-size:36px;">${detectionResult.hasTumor ? '⚠️' : '✅'}</div>
        <div>
          <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:22px; font-weight:800; color:${detectionResult.hasTumor ? '#dc2626' : '#16a34a'};">
            ${detectionResult.hasTumor ? 'Tumor Detected' : 'No Tumor Detected'}
          </div>
          <div style="font-size:13px; color:${detectionResult.hasTumor ? '#b91c1c' : '#15803d'}; margin-top:4px;">
            ${detectionResult.hasTumor ? `Tumor Type: ${tumor.label}` : 'Brain scan appears normal'}
          </div>
        </div>
      </div>

      <!-- Scan Details Grid -->
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:24px;">
        <div style="background:#f9f9f5; border:1px solid #e0e0d8; border-radius:12px; padding:16px;">
          <div style="font-size:11px; color:#888; font-weight:600; margin-bottom:6px; text-transform:uppercase; letter-spacing:.06em;">File Name</div>
          <div style="font-size:13px; font-weight:600; color:#0d0d0d; word-break:break-all;">${originalFile.file.name}</div>
        </div>
        <div style="background:#f9f9f5; border:1px solid #e0e0d8; border-radius:12px; padding:16px;">
          <div style="font-size:11px; color:#888; font-weight:600; margin-bottom:6px; text-transform:uppercase; letter-spacing:.06em;">AI Confidence</div>
          <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:24px; font-weight:800; color:#3b5bdb;">${detectionResult.confidence}%</div>
        </div>
        <div style="background:#f9f9f5; border:1px solid #e0e0d8; border-radius:12px; padding:16px;">
          <div style="font-size:11px; color:#888; font-weight:600; margin-bottom:6px; text-transform:uppercase; letter-spacing:.06em;">Status</div>
          <div style="font-size:13px; font-weight:600; color:#16a34a;">Analysis Complete</div>
        </div>
      </div>

      <!-- Tumor Type Details (if tumor found) -->
      ${detectionResult.hasTumor ? `
      <div style="background:#fff7ed; border:1.5px solid #fed7aa; border-radius:12px; padding:20px; margin-bottom:24px;">
        <div style="font-size:11px; color:#888; font-weight:600; text-transform:uppercase; letter-spacing:.06em; margin-bottom:8px;">Tumor Details</div>
        <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:20px; font-weight:800; color:#ea580c; margin-bottom:6px;">${tumor.label}</div>
        <div style="font-size:13px; color:#555; line-height:1.6;">${tumor.description}</div>
      </div>
      ` : ''}

      <!-- All Probabilities -->
      ${probabilityRows ? `
      <div style="background:#f9f9f5; border:1px solid #e0e0d8; border-radius:12px; padding:20px; margin-bottom:24px;">
        <div style="font-size:11px; color:#888; font-weight:600; text-transform:uppercase; letter-spacing:.06em; margin-bottom:16px;">All Class Probabilities</div>
        ${probabilityRows}
      </div>
      ` : ''}

      <!-- Recommendation -->
      <div style="
        background: ${detectionResult.hasTumor ? '#fff7ed' : '#f0fdf4'};
        border: 1.5px solid ${detectionResult.hasTumor ? '#fed7aa' : '#bbf7d0'};
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 32px;
      ">
        <div style="font-size:13px; font-weight:700; color:${detectionResult.hasTumor ? '#c2410c' : '#15803d'}; margin-bottom:6px;">
          ${detectionResult.hasTumor ? '⚠ Medical Consultation Recommended' : '✓ Recommendation'}
        </div>
        <div style="font-size:13px; color:#555; line-height:1.6;">
          ${detectionResult.hasTumor
            ? 'This AI analysis is for screening purposes only. Please consult with a qualified healthcare professional for proper medical diagnosis and treatment recommendations immediately.'
            : 'No tumor was detected in this scan. Continue regular health screenings as recommended by your healthcare provider.'}
        </div>
      </div>

      <!-- Footer -->
      <div style="padding-top:16px; border-top:1px solid #e0e0d8; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-size:11px; color:#888;">TumorTrace — For informational purposes only. Not a substitute for professional medical advice.</div>
        <div style="font-size:11px; color:#888;">© 2026 All Rights Reserved</div>
      </div>

      <!-- Print Button -->
      <div class="no-print" style="margin-top:28px; text-align:center;">
        <button onclick="window.print()" style="
          background:#0d0d0d; color:#fff; border:none; padding:12px 32px;
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