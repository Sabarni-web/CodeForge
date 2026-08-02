import React, { useState, useEffect } from 'react';
import { FiMinimize2, FiMaximize2 } from 'react-icons/fi';

const DiffViewer = ({ oldContent = '', newContent = '', filename }) => {
  const [diffLines, setDiffLines] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // A very naive diff algorithm for demonstration
    // Real-world would use diff-match-patch or jsdiff
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const lines = [];
    const maxLen = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLen; i++) {
      if (oldLines[i] === newLines[i]) {
        lines.push({ type: 'unchanged', old: oldLines[i], new: newLines[i], lineNum: i + 1 });
      } else {
        if (oldLines[i] !== undefined) {
          lines.push({ type: 'removed', content: oldLines[i], lineNum: i + 1 });
        }
        if (newLines[i] !== undefined) {
          lines.push({ type: 'added', content: newLines[i], lineNum: i + 1 });
        }
      }
    }
    setDiffLines(lines);
  }, [oldContent, newContent]);

  return (
    <div className={`border border-dark-700 rounded-lg overflow-hidden bg-dark-900 ${isExpanded ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
      <div className="bg-dark-800 px-4 py-2 border-b border-dark-700 flex justify-between items-center">
        <h4 className="font-mono text-sm text-dark-200">{filename || 'File Diff'}</h4>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-dark-400 hover:text-brand-400 p-1"
        >
          {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
        </button>
      </div>
      <div className={`overflow-x-auto font-mono text-xs ${isExpanded ? 'h-[calc(100vh-8rem)]' : 'max-h-96'}`}>
        <table className="w-full text-left border-collapse">
          <tbody>
            {diffLines.map((line, idx) => (
              <tr 
                key={idx}
                className={`
                  ${line.type === 'added' ? 'bg-green-500/10 text-green-400' : ''}
                  ${line.type === 'removed' ? 'bg-red-500/10 text-red-400' : ''}
                  ${line.type === 'unchanged' ? 'text-dark-300' : ''}
                `}
              >
                <td className="px-2 py-0.5 border-r border-dark-700 text-dark-500 select-none text-right w-12 bg-dark-800/50">
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : line.lineNum}
                </td>
                <td className="px-4 py-0.5 whitespace-pre">
                  {line.type === 'unchanged' ? line.old : line.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiffViewer;
