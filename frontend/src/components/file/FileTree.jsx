import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';
import FileIcon from './FileIcon';

const FileTreeNode = ({ item, level = 0, repoId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isDir = item.type === 'directory';

  const handleClick = (e) => {
    // If it's a directory, toggle it open/closed
    if (isDir) {
      setIsOpen(!isOpen);
    } else {
      // If it's a file, navigate to it when the row is clicked
      navigate(`/repos/${repoId}/files/${item._id}`);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1.5 px-2 hover:bg-dark-800/50 rounded transition-colors cursor-pointer`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        <div className="w-4 h-4 mr-1 flex items-center justify-center">
          {isDir && (
            isOpen ? <FiChevronDown className="w-3 h-3 text-dark-400" /> : <FiChevronRight className="w-3 h-3 text-dark-400" />
          )}
        </div>
        
        <FileIcon filename={item.name} isDirectory={isDir} isOpen={isOpen} className="w-4 h-4 mr-2" />
        
        <div className="flex-1 flex items-center min-w-0">
          {isDir ? (
            <span className="text-dark-200 text-sm truncate">{item.name}</span>
          ) : (
            <span className="text-dark-200 text-sm hover:text-brand-400 truncate">{item.name}</span>
          )}
        </div>

        {/* File Metadata */}
        {!isDir && (
          <div className="hidden md:flex items-center gap-4 text-xs text-dark-400 w-2/3 shrink-0">
            <span className="truncate w-1/3" title={item.lastCommit?.message || 'No commit message'}>
              {item.lastCommit?.message || '-'}
            </span>
            <span className="w-16 shrink-0 text-center">
              v{item.version || 1}
            </span>
            <span className="truncate w-1/4">
              {item.lastCommit?.author?.username || '-'}
            </span>
            <span className="w-32 shrink-0 text-right pr-2">
              {item.lastModified ? new Date(item.lastModified).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) : '-'}
            </span>
          </div>
        )}
      </div>

      {isDir && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeNode key={child.path} item={child} level={level + 1} repoId={repoId} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree = ({ tree, repoId }) => {
  if (!tree || tree.length === 0) {
    return <div className="p-4 text-dark-400 text-sm text-center">Repository is empty.</div>;
  }

  return (
    <div className="bg-dark-900 rounded-lg border border-dark-700 p-2 overflow-x-auto">
      {/* Header */}
      <div className="hidden md:flex items-center py-2 px-2 border-b border-dark-700/50 mb-2 text-xs font-semibold text-dark-300 select-none">
        <div className="flex-1 pl-6">File Name</div>
        <div className="flex items-center gap-4 w-2/3 shrink-0">
          <div className="w-1/3">Commit Message</div>
          <div className="w-16 text-center">Version</div>
          <div className="w-1/4">Updated By</div>
          <div className="w-32 text-right pr-2">Last Updated</div>
        </div>
      </div>
      <div className="font-mono">
      {tree.map((item) => (
        <FileTreeNode key={item.path} item={item} repoId={repoId} />
      ))}
      </div>
    </div>
  );
};

export default FileTree;
