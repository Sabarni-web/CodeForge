import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const GuardianReportCard = ({ report }) => {
  if (!report) return null;

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-dark-100">Verification Report</h4>
            <p className="text-xs text-dark-400">{new Date(report.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold ${
          report.similarityScore >= 80 ? 'bg-red-500/20 text-red-400' :
          report.similarityScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-emerald-500/20 text-emerald-400'
        }`}>
          {report.similarityScore}% Match
        </div>
      </div>
      
      <div className="text-sm text-dark-300 mb-4">
        {report.repositoryMatch ? (
          <>Matched against <span className="text-brand-400 font-semibold">{report.repositoryMatch.name}</span></>
        ) : (
          'No significant match found.'
        )}
      </div>

      <Link to={`/guardian/report/${report.reportId}`} className="btn-secondary w-full text-center block">
        View Full Report
      </Link>
    </div>
  );
};

export default GuardianReportCard;
