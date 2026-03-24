import React, { useState, useRef, useEffect } from 'react';
import { UploadedFile, DetectionResult } from '../types';

interface ImageComparisonProps {
  originalFile: UploadedFile;
  detectionResult: DetectionResult;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({ originalFile, detectionResult }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mouseleave', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Before & After Comparison
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Drag the slider to compare original scan with AI analysis
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-80 rounded-lg overflow-hidden cursor-col-resize select-none"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Original Image */}
        <div className="absolute inset-0">
          <img
            src={originalFile.preview}
            alt="Original scan"
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
            Original
          </div>
        </div>

        {/* Processed Image */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={detectionResult.processedImage}
            alt="Processed scan"
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
            AI Analysis
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        />

        {/* Slider Handle */}
        <div
          className="absolute top-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 transform -translate-y-1/2 -translate-x-1/2 cursor-col-resize z-20 flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-1 h-4 bg-gray-400 rounded-full" />
        </div>
      </div>

      <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Original Scan</span>
        <span>AI Analysis</span>
      </div>
    </div>
  );
};

export default ImageComparison;