import React from 'react';
import { FiFileText, FiLink } from 'react-icons/fi';

const MatchedFilesTable = ({ files }) => {
  if (!files || files.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-dark-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-dark-800 text-dark-300">
          <tr>
            <th className="px-4 py-3 font-medium">Submitted File</th>
            <th className="px-4 py-3 font-medium text-center">Match</th>
            <th className="px-4 py-3 font-medium">Original File</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-700">
          {files.map((file, idx) => (
            <tr key={idx} className="bg-dark-900/50 hover:bg-dark-800/80 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-dark-200 max-w-[200px] truncate" title={file.path}>
                  <FiFileText className="text-dark-400 flex-shrink-0" />
                  <span className="truncate">{file.path}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                  file.similarity >= 80 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  file.similarity >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {file.similarity}%
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 text-dark-200 max-w-[200px] truncate" title={file.matchedWith}>
                  <FiLink className="text-dark-400 flex-shrink-0" />
                  <span className="truncate text-brand-400">{file.matchedWith}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchedFilesTable;
