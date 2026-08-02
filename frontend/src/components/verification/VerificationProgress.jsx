import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const VerificationProgress = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-dark-700 border-t-emerald-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheckIcon className="w-10 h-10 text-emerald-500 animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-dark-100 mb-2">Analyzing CodeDNA</h3>
      <p className="text-emerald-400 animate-pulse">{message || 'Comparing structural fingerprints...'}</p>
      
      <div className="w-full max-w-md mt-8 space-y-4">
        <div className="h-2 bg-dark-700 rounded overflow-hidden">
          <div className="h-full bg-emerald-500 w-2/3 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs text-dark-400">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div> AST Fingerprints</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" style={{ animationDelay: '0.2s'}}></div> Cyclomatic Complexity</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" style={{ animationDelay: '0.4s'}}></div> Code Style Metrics</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" style={{ animationDelay: '0.6s'}}></div> Directory Structure</div>
        </div>
      </div>
    </div>
  );
};

export default VerificationProgress;
