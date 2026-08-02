import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ShieldCheckIcon, DocumentTextIcon, XMarkIcon, ClockIcon, LinkIcon } from '@heroicons/react/24/outline';
import moment from 'moment';

const CertificateModal = ({ isOpen, onClose, certificate }) => {
  if (!certificate) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-dark-bg border border-dark-border p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-5">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white flex items-center gap-2"
                  >
                    <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                    Ownership Certificate
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-dark-card rounded-lg p-4 border border-dark-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <DocumentTextIcon className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Certificate ID</p>
                        <p className="text-white font-mono text-sm">{certificate.fileCertificateId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ClockIcon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Inserted On</p>
                        <p className="text-white text-sm">
                          {moment(certificate.certificateInsertedAt).format('DD MMM YYYY, HH:mm:ss')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <LinkIcon className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Verification URL</p>
                        <a 
                          href={`https://codeforge.app/verify/${certificate.fileCertificateId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-sm hover:underline"
                        >
                          Verify Online
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-3">
                    <ShieldCheckIcon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-200/80 leading-relaxed">
                      This file is protected by <strong>CodeForge Guardian™</strong>. The cryptographic ownership certificate is embedded directly into the source code and cannot be forged.
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CertificateModal;
