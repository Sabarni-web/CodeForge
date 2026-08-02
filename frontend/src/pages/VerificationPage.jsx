import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVerificationReport } from '../features/verification/guardianReportSlice';
import { clearVerification } from '../features/verification/verificationSlice';
import VerificationUploader from '../components/verification/VerificationUploader';
import VerificationProgress from '../components/verification/VerificationProgress';
import VerificationResult from '../components/verification/VerificationResult';
import Loader from '../components/common/Loader';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

const VerificationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { reportId, loading: verifying, error: verifyError, statusMessage } = useSelector((state) => state.verification);
  const { report, loading: loadingReport, error: reportError } = useSelector((state) => state.guardianReport);

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'progress' | 'result'

  useEffect(() => {
    if (id) {
      dispatch(fetchVerificationReport(id));
      setActiveTab('result');
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (verifying) {
      setActiveTab('progress');
    } else if (reportId) {
      // Once verification is done and we get an ID, fetch the actual report
      dispatch(fetchVerificationReport(reportId));
      setActiveTab('result');
    }
  }, [verifying, reportId, dispatch]);

  // Clean up state when unmounting from upload view
  useEffect(() => {
    return () => {
      if (activeTab === 'upload') {
        dispatch(clearVerification());
      }
    };
  }, [activeTab, dispatch]);

  const handleVerifyAnother = () => {
    dispatch(clearVerification());
    setActiveTab('upload');
    if (id) {
      navigate('/guardian/verify');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
            <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">CodeForge Guardian™ Verification</h1>
        <p className="text-dark-300 max-w-2xl mx-auto">
          Verify the authenticity and potential ownership of source code by comparing its CodeDNA against millions of protected repositories.
        </p>
      </div>

      <div className="glass-card p-6 md:p-8">
        {activeTab === 'upload' && !id && (
          <VerificationUploader />
        )}

        {activeTab === 'progress' && (
          <VerificationProgress message={statusMessage} />
        )}

        {activeTab === 'result' && (
          <>
            {loadingReport ? (
              <Loader text="Loading report..." />
            ) : reportError || verifyError ? (
              <div className="text-center p-8 border border-red-500/30 bg-red-900/10 rounded-xl">
                <h3 className="text-red-400 text-lg font-bold mb-2">Verification Failed</h3>
                <p className="text-dark-300">{reportError || verifyError}</p>
                <button 
                  onClick={() => {
                    dispatch(clearVerification());
                    setActiveTab('upload');
                  }} 
                  className="mt-6 btn-secondary"
                >
                  Try Again
                </button>
              </div>
            ) : report ? (
              <VerificationResult report={report} onVerifyAnother={handleVerifyAnother} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
