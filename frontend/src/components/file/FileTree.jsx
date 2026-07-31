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
        
        {isDir ? (
          <span className="text-dark-200 text-sm">{item.name}</span>
        ) : (
          <span className="text-dark-200 text-sm hover:text-brand-400">{item.name}</span>
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
    <div className="font-mono bg-dark-900 rounded-lg border border-dark-700 p-2 overflow-x-auto">
      {tree.map((item) => (
        <FileTreeNode key={item.path} item={item} repoId={repoId} />
      ))}
    </div>
  );
};

export default FileTree;
