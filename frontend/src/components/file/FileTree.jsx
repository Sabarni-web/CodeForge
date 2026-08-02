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
    <>
      <div
        className="flex items-center justify-between py-2 px-4 hover:bg-dark-800 border-b border-dark-700/50 transition-colors cursor-pointer group"
        onClick={handleClick}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0" style={{ paddingLeft: `${level * 16}px` }}>
          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
            {isDir && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -ml-5">
                {isOpen ? <FiChevronDown className="w-3 h-3 text-dark-500" /> : <FiChevronRight className="w-3 h-3 text-dark-500" />}
              </div>
            )}
            <FileIcon filename={item.name} isDirectory={isDir} isOpen={isOpen} className="w-4 h-4" />
          </div>
          
          <span className={`text-sm truncate ${isDir ? 'text-dark-100' : 'text-dark-100 hover:text-brand-400 hover:underline'}`}>
            {item.name}
          </span>
        </div>

        {/* File Metadata */}
        <div className="hidden md:flex items-center gap-4 text-xs text-dark-400 w-2/3 shrink-0">
          <span className="truncate w-1/3" title={item.lastCommit?.message || (isDir ? '-' : 'No commit message')}>
            {item.lastCommit?.message || '-'}
          </span>
          <span className="w-16 shrink-0 text-center">
            {isDir ? '-' : `v${item.version || 1}`}
          </span>
          <span className="truncate w-1/4">
            {item.lastCommit?.author?.username || '-'}
          </span>
          <span className="w-32 shrink-0 text-right pr-2">
            {item.lastModified ? new Date(item.lastModified).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
          </span>
        </div>
      </div>

      {isDir && isOpen && item.children && (
        <div className="w-full">
          {item.children.map((child) => (
            <FileTreeNode key={child.path} item={child} level={level + 1} repoId={repoId} />
          ))}
        </div>
      )}
    </>
  );
};

const FileTree = ({ tree, repoId }) => {
  if (!tree || tree.length === 0) {
    return <div className="p-4 text-dark-400 text-sm text-center">Repository is empty.</div>;
  }

  // Sort: directories first, then files
  const sortedTree = [...tree].sort((a, b) => {
    if (a.type === 'directory' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });

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
        {sortedTree.map((item) => (
          <FileTreeNode key={item.path} item={item} repoId={repoId} />
        ))}
      </div>
    </div>
  );
};

export default FileTree;
