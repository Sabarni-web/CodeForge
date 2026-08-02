import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import CertificateModal from './CertificateModal';

const GuardianBadge = ({ fileId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { certificates } = useSelector((state) => state.certificate);
  const cert = fileId ? certificates[fileId] : null;

  if (!cert || !cert.guardianProtected) return null;

  return (
    <>
      <div 
        className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 text-sm font-medium cursor-pointer hover:bg-green-500/20 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <ShieldCheckIcon className="w-4 h-4" />
        <span>Protected by CodeForge Guardian™</span>
      </div>

      {isModalOpen && (
        <CertificateModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          certificate={cert}
        />
      )}
    </>
  );
};

export default GuardianBadge;
