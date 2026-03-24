import React from 'react';
import { AlertTriangle, CheckCircle, Download, FileText, Target, Brain } from 'lucide-react';
import { DetectionResult, UploadedFile } from '../types';

interface ResultsProps {
  detectionResult: DetectionResult;
  originalFile: UploadedFile;
  onDownload: () => void;
}

const tumorInfo: Record<string, { label: string; description: string; color: string }> = {
  glioma: {
    label: 'Glioma',
    description: 'A tumor that starts in the glial cells of the brain or spine.',
    color: 'text-red-600 dark:text-red-400',
  },
  meningioma: {
    label: 'Meningioma',
    description: 'A tumor that arises from the meninges surrounding the brain and spinal cord.',
    color: 'text-orange-600 dark:text-orange-400',
  },
  pituitary: {
    label: 'Pituitary Tumor',
    description: 'A tumor that forms in the pituitary gland at the base of the brain.',
    color: 'text-purple-600 dark:text-purple-400',
  },
  notumor: {
    label: 'No Tumor',
    description: 'No tumor detected in the scan.',
    color: 'text-green-600 dark:text-green-400',
  },
};

const Results: React.FC<ResultsProps> = ({ detectionResult, originalFile, onDownload }) => {
  const { hasTumor, confidence, tumorArea, tumorType, allProbabilities } = detectionResult as any;
  const tumor = tumorInfo[tumorType] || tumorInfo['notumor'];

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
        <div className="flex items-center space-x-4 mb-4">
          {hasTumor ? (
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {hasTumor ? 'Tumor Detected' : 'No Tumor Detected'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">AI Analysis Complete</p>
          </div>
        </div>

        {/* Tumor Type Card */}
        {hasTumor && tumorType && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Brain className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Tumor Type</span>
            </div>
            <p className={`text-2xl font-bold ${tumor.color}`}>{tumor.label}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tumor.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Confidence</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{confidence}%</p>
          </div>

          {hasTumor && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Tumor Area</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tumorArea} mm²</p>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</span>
            </div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Analysis Complete</p>
          </div>
        </div>

        {/* All Probabilities */}
        {allProbabilities && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">All Class Probabilities</h4>
            <div className="space-y-2">
              {Object.entries(allProbabilities).map(([cls, prob]: [string, any]) => (
                <div key={cls}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700 dark:text-gray-300">
                      {tumorInfo[cls]?.label || cls}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{prob.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${cls === tumorType ? 'bg-blue-600' : 'bg-gray-400'}`}
                      style={{ width: `${prob}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDownload}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            Print Results
          </button>
        </div>
      </div>

      {hasTumor && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                Medical Consultation Recommended
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This AI analysis is for screening purposes only. Please consult with a qualified healthcare professional for proper medical diagnosis and treatment recommendations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;