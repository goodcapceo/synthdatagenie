/**
 * LoadingState Component
 * Deterministic progress bar with cycling status messages
 * Deep Ocean Intelligence design system
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const STATUS_MESSAGES = [
  'Initializing statistical distributions...',
  'Generating customer profiles...',
  'Creating merchant networks...',
  'Synthesizing transaction patterns...',
  'Injecting temporal seasonality...',
  'Building geographic coherence...',
  'Synthesizing fraud anomalies...',
  'Calculating risk scores...',
  'Computing quality metrics...',
  'Formatting response...',
];

const LoadingState = ({ progress = 0 }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Cycle through messages based on progress
    const newIndex = Math.min(
      Math.floor((progress / 100) * STATUS_MESSAGES.length),
      STATUS_MESSAGES.length - 1
    );
    setMessageIndex(newIndex);
  }, [progress]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Animated Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-50 text-center mb-2">
          Generating Data
        </h3>

        {/* Status Message */}
        <p className="text-slate-400 text-sm text-center mb-6 h-5 transition-all duration-300">
          {STATUS_MESSAGES[messageIndex]}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span className="font-mono tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Processing indicator dots */}
        <div className="flex justify-center gap-1 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
