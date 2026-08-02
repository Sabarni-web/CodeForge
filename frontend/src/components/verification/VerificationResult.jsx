import { FiCheckCircle, FiAlertTriangle, FiInfo, FiExternalLink, FiUser, FiCode } from 'react-icons/fi';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import SimilarityChart from './SimilarityChart';
import MatchedFilesTable from './MatchedFilesTable';
import { useDispatch } from 'react-redux';
import { clearVerification } from '../../features/verification/verificationSlice';

const VerificationResult = ({ report, onVerifyAnother }) => {
  const dispatch = useDispatch();

  if (!report) return null;

  const {
    similarityScore,
    repositoryMatch,
    ownerMatch,
    certificateDetected,
    guardianProtected,
    matchedFiles,
    structureScore,
    styleScore,
    functionScore,
    complexityScore
  } = report;

  // Determine Confidence Level
  let confidenceLevel = '';
  let confidenceColor = '';
  let confidenceText = '';

  if (similarityScore >= 95) {
    confidenceLevel = 'Very High Similarity';
    confidenceColor = 'text-red-500';
    confidenceText = 'Likely derived from an existing CodeForge repository.';
  } else if (similarityScore >= 80) {
    confidenceLevel = 'High Similarity';
    confidenceColor = 'text-orange-500';
    confidenceText = 'Strong structural similarity detected.';
  } else if (similarityScore >= 60) {
    confidenceLevel = 'Moderate Similarity';
    confidenceColor = 'text-yellow-500';
    confidenceText = 'Some matching structures detected.';
  } else {
    confidenceLevel = 'Low Similarity';
    confidenceColor = 'text-green-500';
    confidenceText = 'No strong match found. Unlikely to be copied from a protected repository.';
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-dark-700/50">
        <div>
          <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
            Verification Report
          </h2>
          <p className="text-dark-400 text-sm mt-1">ID: {report.reportId}</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onVerifyAnother} className="btn-secondary">
            Verify Another
          </button>
        </div>
      </div>

      {/* Main Score Card */}
      <div className={`p-6 rounded-xl border ${similarityScore >= 80 ? 'bg-orange-900/10 border-orange-500/30' : similarityScore >= 60 ? 'bg-yellow-900/10 border-yellow-500/30' : 'bg-green-900/10 border-green-500/30'}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-dark-800" />
                <circle 
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={251.2} 
                  strokeDashoffset={251.2 - (251.2 * similarityScore) / 100}
                  className={confidenceColor} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-dark-100">
                {similarityScore}%
              </div>
            </div>
            <div>
              <h3 className={`text-xl font-bold ${confidenceColor} mb-1 flex items-center gap-2`}>
                {similarityScore >= 80 && <FiAlertTriangle />}
                {similarityScore < 60 && <FiCheckCircle />}
                {confidenceLevel}
              </h3>
              <p className="text-dark-300 max-w-md">{confidenceText}</p>
            </div>
          </div>

          {guardianProtected && certificateDetected && (
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-3">
              <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="font-semibold text-emerald-400 text-sm">Guardian Protected</div>
                <div className="text-emerald-300/70 text-xs">Certificate Detected</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Match Details */}
        <div className="glass-card p-5 border border-dark-700">
          <h3 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <FiInfo className="text-brand-400" /> Estimated Original Source
          </h3>
          
          {repositoryMatch ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-dark-700">
                <span className="text-dark-400 text-sm">Repository</span>
                <Link to={`/repos/${repositoryMatch._id}`} className="font-medium text-brand-400 hover:underline flex items-center gap-1">
                  {repositoryMatch.name} <FiExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-dark-700">
                <span className="text-dark-400 text-sm">Owner</span>
                <Link to={`/profile/${ownerMatch?.username}`} className="font-medium text-dark-200 hover:text-brand-400 flex items-center gap-2">
                  <FiUser className="text-dark-400" /> {ownerMatch?.username}
                </Link>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-dark-700">
                <span className="text-dark-400 text-sm">Verification Status</span>
                <span className="font-medium text-emerald-400">Verified</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-400 text-sm">Files Matched</span>
                <span className="font-medium text-dark-200 flex items-center gap-1">
                  <FiCode className="text-dark-400" /> {matchedFiles?.length || 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-dark-400 text-sm text-center py-8">
              No matching repository found in the public database.
            </div>
          )}
        </div>

        {/* Breakdown Chart */}
        <div className="glass-card p-5 border border-dark-700">
          <h3 className="font-semibold text-dark-100 mb-4">Similarity Breakdown</h3>
          <SimilarityChart 
            astScore={functionScore} 
            structureScore={structureScore} 
            styleScore={styleScore} 
            complexityScore={complexityScore} 
          />
        </div>
      </div>

      {/* Files List */}
      {matchedFiles && matchedFiles.length > 0 && (
        <div className="glass-card p-5 border border-dark-700">
          <h3 className="font-semibold text-dark-100 mb-4">Highly Similar Files</h3>
          <MatchedFilesTable files={matchedFiles} />
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-dark-900 border border-dark-700 rounded-lg p-4 text-xs text-dark-400 flex gap-3">
        <FiInfo className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Disclaimer:</strong> This report represents a probabilistic estimate of similarity based on structural AST, complexity, and style CodeDNA fingerprints. It is designed to assist in verifying provenance and does not constitute absolute proof of authorship or plagiarism. Sabarni Mukherjee and CodeForge assume no liability for actions taken based on these estimates.
        </p>
      </div>
    </div>
  );
};

export default VerificationResult;
