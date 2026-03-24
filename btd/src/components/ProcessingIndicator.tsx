import React, { useEffect, useState } from 'react';
import { Brain, Zap, Search, CheckCircle } from 'lucide-react';
import { ProcessingState } from '../types';

interface ProcessingIndicatorProps {
  processingState: ProcessingState;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ processingState }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: Brain, label: "Preprocessing scan", progress: 25 },
    { icon: Search, label: "AI analysis in progress", progress: 50 },
    { icon: Zap, label: "Detecting abnormalities", progress: 75 },
    { icon: CheckCircle, label: "Generating results", progress: 100 }
  ];

  useEffect(() => {
    if (processingState.progress <= 25) setCurrentStep(0);
    else if (processingState.progress <= 50) setCurrentStep(1);
    else if (processingState.progress <= 75) setCurrentStep(2);
    else setCurrentStep(3);
  }, [processingState.progress]);

  if (!processingState.isProcessing) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Processing Brain Scan
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Our AI is analyzing your scan for potential abnormalities
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-100 dark:bg-blue-900/40 animate-pulse' 
                  : isCompleted 
                    ? 'bg-green-100 dark:bg-green-900/40' 
                    : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Icon className={`h-4 w-4 transition-colors duration-300 ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : isCompleted 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-400 dark:text-gray-500'
                }`} />
              </div>
              <span className={`font-medium transition-colors duration-300 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : isCompleted 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-400 dark:text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {processingState.progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${processingState.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessingIndicator;